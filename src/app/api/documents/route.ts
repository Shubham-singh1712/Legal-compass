import { NextRequest, NextResponse } from 'next/server';
import { documentStore } from '@/lib/documentStore';
import { getAnalysisForDocument } from '@/lib/analysisEngine';
import { getSessionId } from '@/lib/security';

export async function GET(request: NextRequest) {
  const sessionId = getSessionId(request);
  if (!sessionId) return NextResponse.json({ success: false, error: 'No active document session.' }, { status: 401 });

  const documents = documentStore
    .getAllForSession(sessionId)
    .filter((document) => document.extractedText.trim().length >= 50)
    .map((document) => getAnalysisForDocument(document.id, undefined, sessionId));

  return NextResponse.json({ success: true, data: documents });
}