import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisForDocument } from '@/lib/analysisEngine';
import { documentStore } from '@/lib/documentStore';
import { UserContext, UserRole, DocumentType, Jurisdiction } from '@/types/legal';
import { getSessionId } from '@/lib/security';

export async function GET(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const sessionId = getSessionId(req);

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Missing document ID parameter.' },
        { status: 400 }
      );
    }

    if (!sessionId || !documentStore.has(documentId, sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Document was not found in the current session. Please upload it again.' },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const roleParam = url.searchParams.get('role') as UserRole | null;
    const docTypeParam = url.searchParams.get('docType') as DocumentType | null;
    const jurisdictionParam = url.searchParams.get('jurisdiction') as Jurisdiction | null;
    const specificConcerns = url.searchParams.get('concerns') || undefined;

    let userContextOverride: UserContext | undefined;
    if (roleParam) {
      userContextOverride = {
        role: roleParam,
        docType: docTypeParam || undefined,
        jurisdiction: jurisdictionParam || undefined,
        specificConcerns,
      };
      // Persist in store for subsequent requests
      documentStore.updateUserContext(documentId, userContextOverride, sessionId);
    }

    const data = getAnalysisForDocument(documentId, userContextOverride, sessionId);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Error fetching analysis:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analysis data.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const sessionId = getSessionId(req);
    const body = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Missing document ID parameter.' },
        { status: 400 }
      );
    }

    if (!sessionId || !documentStore.has(documentId, sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Document was not found in the current session. Please upload it again.' },
        { status: 404 }
      );
    }

    const userContext: UserContext = {
      role: body.role || 'Other',
      docType: body.docType,
      jurisdiction: body.jurisdiction,
      specificConcerns: body.specificConcerns,
    };

    documentStore.updateUserContext(documentId, userContext, sessionId);
    const data = getAnalysisForDocument(documentId, userContext, sessionId);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Error updating analysis context:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update analysis context.' },
      { status: 500 }
    );
  }
}
