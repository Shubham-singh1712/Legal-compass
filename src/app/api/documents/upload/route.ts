import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { documentStore } from '@/lib/documentStore';
import { classifyDocument, determineUserRole } from '@/lib/analysisEngine';
import { UserContext } from '@/types/legal';
import { getOrCreateSessionId } from '@/lib/security';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}

async function parsePdfSafely(buffer: Buffer): Promise<{ text: string; numpages: number }> {
  // Ensure buffer has its own dedicated ArrayBuffer (byteOffset === 0)
  // to prevent pdf.js LoopbackPort slicing bug on pooled Node buffers
  const unpooledBuffer = Buffer.from(new Uint8Array(buffer));

  // 1. Try direct in-process parse first
  try {
    const pdfData = await pdfParse(unpooledBuffer);
    if (pdfData && typeof pdfData.text === 'string' && pdfData.text.trim().length > 0) {
      return { text: pdfData.text, numpages: pdfData.numpages || 1 };
    }
  } catch (directErr) {
    console.warn(
      'Direct PDF parsing encountered issue, falling back to isolated worker:',
      directErr instanceof Error ? directErr.message : directErr
    );
  }

  // 2. Fallback: Use isolated worker_threads to bypass any shared global pdf.js worker state
  try {
    const { Worker } = await import('worker_threads');
    return await new Promise<{ text: string; numpages: number }>((resolve, reject) => {
      const workerCode = `
        const { parentPort, workerData } = require('worker_threads');
        const pdf = require('pdf-parse');
        pdf(workerData).then(data => {
          parentPort.postMessage({
            text: data.text,
            numpages: data.numpages
          });
        }).catch(err => {
          parentPort.postMessage({ error: err.message });
        });
      `;
      const worker = new Worker(workerCode, { eval: true, workerData: unpooledBuffer });
      worker.on('message', (msg) => {
        if (msg.error) reject(new Error(msg.error));
        else resolve({ text: msg.text || '', numpages: msg.numpages || 1 });
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error('Worker stopped with exit code ' + code));
      });
    });
  } catch (workerErr) {
    console.error('Worker thread PDF parsing also failed:', workerErr instanceof Error ? workerErr.message : workerErr);
    throw workerErr;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No document file provided.' },
        { status: 400 }
      );
    }

    // 1. Validate file extension & MIME type
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file type. Please upload a valid PDF (.pdf) file.',
        },
        { status: 400 }
      );
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 15MB.`,
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'The uploaded file is empty. Please provide a valid document.',
        },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeFilename(file.name);
    const nameSlug = sanitizedName.toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]/g, '_');
    const documentId = `doc_${nameSlug}_${Date.now()}`;
    const sessionId = getOrCreateSessionId(req);

    // Read buffer safely
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify PDF header magic bytes (%PDF-)
    const pdfHeader = buffer.slice(0, 5).toString('ascii');
    if (!pdfHeader.startsWith('%PDF-')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Corrupted or invalid PDF header. Please provide a standard PDF document.',
        },
        { status: 400 }
      );
    }

    // Parse PDF content safely using unpooled buffer with worker thread isolation fallback
    let extractedText = '';
    let pageCount = 1;
    try {
      const parsed = await parsePdfSafely(buffer);
      extractedText = parsed.text || '';
      pageCount = parsed.numpages || 1;
    } catch (parseError) {
      console.error('PDF text extraction failed:', parseError instanceof Error ? parseError.message : 'unknown parser error');
      return NextResponse.json(
        { success: false, error: 'Document text could not be extracted. Please upload a readable PDF.' },
        { status: 422 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Document text could not be extracted. The PDF may be image-only or empty.' },
        { status: 422 }
      );
    }

    // Classify document and infer smart role from the actual text
    const classification = classifyDocument(extractedText, sanitizedName);
    const roleResult = determineUserRole(classification);

    const initialUserContext: UserContext = {
      role: roleResult.role,
      docType: classification.detectedType,
      jurisdiction: classification.jurisdiction,
    };

    // Save into documentStore
    documentStore.set(documentId, {
      id: documentId,
      sessionId,
      filename: sanitizedName,
      fileSize: file.size,
      fileType: 'application/pdf',
      extractedText,
      pageCount,
      userContext: initialUserContext,
      uploadedAt: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      documentId,
      filename: sanitizedName,
      fileSizeBytes: file.size,
      pageCount,
      extractedTextLength: extractedText.length,
      detectedType: classification.detectedType,
      inferredRole: roleResult.role,
      jurisdiction: classification.jurisdiction,
      confidence: classification.confidence,
      parties: classification.parties,
      message: 'Document successfully ingested, parsed, and classified.',
    });
    response.cookies.set('legal_compass_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err: any) {
    console.error('Document upload API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while uploading and validating the document. Please try again.',
      },
      { status: 500 }
    );
  }
}
