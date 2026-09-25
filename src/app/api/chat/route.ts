import { NextRequest, NextResponse } from 'next/server';
import { generateGroundedResponse } from '@/lib/chatEngine';
import { getSessionId, sanitizeDocumentText } from '@/lib/security';
import { documentStore } from '@/lib/documentStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, message } = body;
    const sessionId = getSessionId(req);

    if (!documentId || !message) {
      return NextResponse.json(
        { success: false, error: 'Document ID and user message are required.' },
        { status: 400 }
      );
    }

    if (!sessionId || !documentStore.has(documentId, sessionId)) {
      return NextResponse.json({ success: false, error: 'Document was not found in the current session.' }, { status: 404 });
    }

    // Security check on user message
    const secResult = sanitizeDocumentText(message);
    const result = generateGroundedResponse(documentId, secResult.sanitizedText);

    return NextResponse.json({
      success: true,
      documentId,
      result,
      securityWarning: secResult.isInjectionAttemptDetected ? secResult.warnings[0] : undefined,
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { success: false, error: 'An error occurred while generating grounded chat response.' },
      { status: 500 }
    );
  }
}
