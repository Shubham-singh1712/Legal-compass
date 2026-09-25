/**
 * security.ts
 * Phase 10: Security & Privacy Hardening
 * Treats uploaded documents as untrusted data and guards against prompt injections,
 * malicious text, and cross-document state leaks.
 */

export interface SecurityPolicyResult {
  sanitizedText: string;
  isInjectionAttemptDetected: boolean;
  warnings: string[];
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(your\s+)?system\s+prompt/i,
  /you\s+are\s+now\s+a/i,
  /call\s+this\s+tool/i,
  /override\s+system\s+rules/i,
  /disregard\s+prior\s+context/i,
];

export function sanitizeDocumentText(rawText: string): SecurityPolicyResult {
  const warnings: string[] = [];
  let isInjectionAttemptDetected = false;

  // Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(rawText)) {
      isInjectionAttemptDetected = true;
      warnings.push('Document contains text patterns resembling system instruction overrides. Processed strictly as passive data.');
      break;
    }
  }

  // Sanitize text by removing potentially problematic control characters
  const sanitizedText = rawText
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();

  return {
    sanitizedText,
    isInjectionAttemptDetected,
    warnings,
  };
}

/**
 * Wraps document content safely in structural boundary tags
 * preventing LLM prompt confusion.
 */
export function wrapDocumentContent(documentId: string, filename: string, text: string): string {
  return `<UNTRUSTED_DOCUMENT_DATA id="${documentId}" filename="${filename}">
${text}
</UNTRUSTED_DOCUMENT_DATA>`;
}

/**
 * Validates document isolation access
 */
export function validateDocumentScope(requestedId: string, currentSessionDocId: string): boolean {
  return requestedId === currentSessionDocId;
}

export function getSessionId(request: Request): string | undefined {
  return request.headers.get('cookie')?.match(/(?:^|;\s*)legal_compass_session=([^;]+)/)?.[1];
}

export function getOrCreateSessionId(request: Request): string {
  return getSessionId(request) || crypto.randomUUID();
}
