/**
 * clauseExtractor.ts
 * Extracts legal structures, obligations, rights, deadlines, and risks from raw PDF text.
 */

export interface ExtractedClause {
  id: string;
  sectionNumber?: string;
  title: string;
  text: string;
  category: 'right' | 'obligation' | 'deadline' | 'penalty' | 'review' | 'general';
  confidence: number;
}

export interface ExtractedMetadata {
  title: string;
  documentType: string;
  parties: { name: string; role: string }[];
  effectiveDate?: string;
  governingLaw?: string;
  keyClauses: ExtractedClause[];
}

export function extractFromText(rawText: string, filename: string): ExtractedMetadata {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // 1. Infer Document Type & Title
  let documentType = 'Legal Agreement';
  let title = filename.replace(/\.pdf$/i, '').replace(/_/g, ' ');
  
  const textUpper = rawText.toUpperCase();
  if (textUpper.includes('EMPLOYMENT AGREEMENT') || textUpper.includes('EMPLOYMENT CONTRACT')) {
    documentType = 'Employment Agreement';
    title = 'Executive Employment Agreement';
  } else if (textUpper.includes('RESIDENTIAL LEASE') || textUpper.includes('LEASE AGREEMENT')) {
    documentType = 'Residential Lease';
    title = 'Residential Lease Agreement';
  } else if (textUpper.includes('FREELANCE') || textUpper.includes('SERVICES AGREEMENT')) {
    documentType = 'Services Agreement';
    title = 'Freelance Services Agreement';
  } else if (textUpper.includes('NON-DISCLOSURE') || textUpper.includes('NDA')) {
    documentType = 'Non-Disclosure Agreement';
    title = 'Mutual Non-Disclosure Agreement';
  } else if (textUpper.includes('SAAS') || textUpper.includes('VENDOR AGREEMENT')) {
    documentType = 'SaaS Vendor Agreement';
    title = 'Enterprise SaaS Vendor Agreement';
  } else if (textUpper.includes('CREATIVE') || textUpper.includes('MASTER SERVICES')) {
    documentType = 'Master Services Agreement';
    title = 'Creative Agency Master Services Agreement';
  } else if (lines.length > 0) {
    title = lines[0].substring(0, 80);
  }

  // 2. Identify Parties
  const parties: { name: string; role: string }[] = [];
  const partyMatch1 = rawText.match(/between\s+([A-Z0-9\s.,]+?)\s+\("?([^"\n]+)"?\)\s+and\s+([A-Z0-9\s.,]+?)\s+\("?([^"\n]+)"?\)/i);
  if (partyMatch1) {
    parties.push({ name: partyMatch1[1].trim(), role: partyMatch1[2].trim() });
    parties.push({ name: partyMatch1[3].trim(), role: partyMatch1[4].trim() });
  }

  // 3. Extract Clauses
  const keyClauses: ExtractedClause[] = [];
  let clauseIdCounter = 1;

  // Simple section/paragraph chunking
  const paragraphs = rawText.split(/\n\s*\n/);
  for (const p of paragraphs) {
    const cleanP = p.replace(/\s+/g, ' ').trim();
    if (cleanP.length < 20) continue;

    let category: ExtractedClause['category'] = 'general';
    const lowerP = cleanP.toLowerCase();

    if (lowerP.includes('shall not') || lowerP.includes('non-compete') || lowerP.includes('penalty') || lowerP.includes('termination for cause')) {
      category = 'penalty';
    } else if (lowerP.includes('days') || lowerP.includes('month') || lowerP.includes('due on') || lowerP.includes('deadline') || lowerP.includes('notice')) {
      category = 'deadline';
    } else if (lowerP.includes('shall') || lowerP.includes('must') || lowerP.includes('agrees to') || lowerP.includes('obligation')) {
      category = 'obligation';
    } else if (lowerP.includes('entitled to') || lowerP.includes('right') || lowerP.includes('may terminate')) {
      category = 'right';
    } else if (lowerP.includes('indemn') || lowerP.includes('arbitration') || lowerP.includes('alteration')) {
      category = 'review';
    }

    const sectionMatch = cleanP.match(/^(\d+[\.\d]*)\s*([A-Z\s]{3,40})/);
    const clauseTitle = sectionMatch ? sectionMatch[2].trim() : `Clause ${clauseIdCounter}`;

    keyClauses.push({
      id: `clause_${clauseIdCounter++}`,
      sectionNumber: sectionMatch ? sectionMatch[1] : undefined,
      title: clauseTitle,
      text: cleanP,
      category,
      confidence: 0.92
    });
  }

  // Extract Effective Date & Governing Law
  const dateMatch = rawText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i);
  const lawMatch = rawText.match(/laws of (the State of [A-Za-z]+|[A-Za-z\s]+)/i);

  return {
    title,
    documentType,
    parties,
    effectiveDate: dateMatch ? dateMatch[0] : undefined,
    governingLaw: lawMatch ? lawMatch[1] : undefined,
    keyClauses
  };
}
