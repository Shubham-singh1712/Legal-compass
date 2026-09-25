/**
 * analysisEngine.ts
 *
 * REAL document-grounded legal analysis engine.
 * Every value — role, clause count, rights, obligations, deadlines, risks —
 * is dynamically derived from the actual uploaded or referenced document text.
 *
 * NO hardcoded analysis in the production path.
 */

import {
  AnalysisResult,
  LegalSituationMap,
  Finding,
  Obligation,
  Clause,
  FindingEvidence,
  UserContext,
  UserRole,
  DocumentType,
  Jurisdiction,
  RiskPriority,
} from '@/types/legal';
import { documentStore, StoredDocument } from './documentStore';

export type RiskSensitivityMode = 'strict' | 'standard' | 'flexible';

/** Re-rank grounded findings without changing their document evidence. */
export function applyRiskSensitivity(findings: Finding[], mode: RiskSensitivityMode): Finding[] {
  return findings.map((finding) => {
    const searchable = `${finding.title} ${finding.whatItSays}`.toLowerCase();
    let priority = finding.priority;

    if (mode === 'strict') {
      if (
        (finding.category === 'payment' && /net\s+(?:1[5-9]|[2-9]\d)\s+days?/.test(searchable)) ||
        (finding.category === 'ip' && /assign|ownership|broad|all right|title/.test(searchable)) ||
        (finding.category === 'confidentiality' && /\b(?:[2-9]|\d{2,})\s+years?/.test(searchable))
      ) {
        priority = 'high';
      }
    }

    if (mode === 'flexible') {
      const severe =
        (finding.category === 'liability' && /cap|shall not exceed|limitation/.test(searchable)) ||
        (finding.category === 'termination' && /immediate|without notice|breach/.test(searchable));
      priority = severe ? 'high' : priority === 'high' ? 'medium' : 'low';
    }

    return priority === finding.priority ? finding : { ...finding, priority };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLAUSE SEGMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SegmentedClause {
  id: string;
  sectionNumber: string;
  title: string;
  text: string;
  pageNumber: number;
  category: string;
}

/**
 * Split raw document text into structured clauses.
 * Detects numbered sections (1., 2.1, etc.) and ALL-CAPS headings.
 */
export function segmentClauses(rawText: string): SegmentedClause[] {
  const clauses: SegmentedClause[] = [];
  const lines = rawText.split(/\r?\n/);

  let currentSectionNum = '';
  let currentTitle = '';
  let currentLines: string[] = [];
  let clauseCounter = 0;

  const isSectionHeader = (line: string): { num: string; title: string } | null => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Numbered section: "1. TITLE", "2.1 Title", "Section 3 — Title"
    const numbered = trimmed.match(/^(\d+(?:\.\d+)?)[.\s]+([A-Z][A-Za-z\s&\/,()\-]{2,60})$/);
    if (numbered) return { num: numbered[1], title: numbered[2].trim() };

    // ALL CAPS heading (no number)
    const allCaps = trimmed.match(/^([A-Z][A-Z\s&\/,()\-]{4,60})$/);
    if (allCaps && trimmed === trimmed.toUpperCase() && trimmed.length > 4) {
      return { num: '', title: trimmed };
    }
    return null;
  };

  const flushClause = () => {
    const text = currentLines.join(' ').replace(/\s+/g, ' ').trim();
    if (text.length < 15 || !currentTitle) return;
    clauseCounter++;
    clauses.push({
      id: `clause_${clauseCounter}`,
      sectionNumber: currentSectionNum,
      title: currentTitle,
      text,
      pageNumber: 1,
      category: categorizeClause(text, currentTitle),
    });
  };

  for (const line of lines) {
    const header = isSectionHeader(line);
    if (header) {
      flushClause();
      currentSectionNum = header.num;
      currentTitle = header.title;
      currentLines = [];
    } else {
      const trimmed = line.trim();
      if (trimmed) currentLines.push(trimmed);
    }
  }
  flushClause();

  // If no sections were segmented (e.g. single block of text), create paragraph clauses
  if (clauses.length === 0) {
    const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 30);
    paragraphs.forEach((p, idx) => {
      clauses.push({
        id: `clause_${idx + 1}`,
        sectionNumber: `${idx + 1}`,
        title: `Clause ${idx + 1}`,
        text: p.replace(/\s+/g, ' '),
        pageNumber: 1,
        category: categorizeClause(p, `Clause ${idx + 1}`),
      });
    });
  }

  return clauses;
}

/**
 * Classify a clause into a category based on keyword heuristics.
 */
export function categorizeClause(text: string, title: string): string {
  const combined = (title + ' ' + text).toLowerCase();

  if (/compensat|payment|salary|bonus|fee|retainer|rent|deposit|invoice|price|rate/.test(combined)) {
    return 'payment';
  }
  if (/terminat|resign|severance|notice\s+period|early\s+break|cancellation/.test(combined)) {
    return 'termination';
  }
  if (/intellectual\s+property|ownership|deliverable|work\s+product|patent|copyright|license/.test(combined)) {
    return 'ip';
  }
  if (/confidential|non-disclosure|proprietary|trade\s+secret/.test(combined)) {
    return 'confidentiality';
  }
  if (/non-compete|restrictive\s+covenant|non-solicit|exclusiv/.test(combined)) {
    return 'restrictive';
  }
  if (/governing\s+law|jurisdiction|dispute|arbitration|venue/.test(combined)) {
    return 'dispute';
  }
  if (/service\s+level|sla|uptime|maintenance|support|alteration/.test(combined)) {
    return 'service_level';
  }
  if (/liability|indemnif|warranty|remedy|damage|limitation/.test(combined)) {
    return 'liability';
  }
  if (/renew|term\s+and\s+renewal|auto-renew/.test(combined)) {
    return 'renewal';
  }
  return 'general';
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCUMENT CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export interface DocClassification {
  detectedType: DocumentType;
  confidence: number;
  parties: { name: string; role: string }[];
  effectiveDate?: string;
  governingLaw?: string;
  jurisdiction: Jurisdiction;
}

export function classifyDocument(
  rawText: string,
  filename: string,
  userContext?: UserContext | null
): DocClassification {
  const upper = rawText.toUpperCase();
  const lower = rawText.toLowerCase();

  let detectedType: DocumentType = 'Commercial Contract';
  let confidence = 0.6;

  if (/\bEXECUTIVE EMPLOYMENT\b|\bEMPLOYMENT AGREEMENT\b|\bEMPLOYMENT CONTRACT\b/.test(upper)) {
    detectedType = 'Employment Agreement';
    confidence = 0.98;
  } else if (/\bFREELANCE SERVICES\b|\bFREELANCER\b|\bCONTRACTOR\b.*\bCLIENT\b/.test(upper) ||
             /\bfreelance services agreement\b|\bservices agreement\b/.test(lower)) {
    detectedType = 'Freelance / Services Agreement';
    confidence = 0.96;
  } else if (/\bMUTUAL NON-DISCLOSURE\b|\bNON-DISCLOSURE AGREEMENT\b|\bNDA\b/.test(upper)) {
    detectedType = 'Non-Disclosure Agreement (NDA)';
    confidence = 0.98;
  } else if (/\bRESIDENTIAL LEASE\b|\bLEASE AGREEMENT\b|\bTENANT\b.*\bLANDLORD\b/.test(upper)) {
    detectedType = 'Residential Rental Agreement';
    confidence = 0.96;
  } else if (/\bTERMS OF SERVICE\b|\bPRIVACY POLICY\b|\bTERMS AND CONDITIONS\b/.test(upper)) {
    detectedType = 'Terms & Policy';
    confidence = 0.92;
  } else if (/\bSAAS\b|\bVENDOR AGREEMENT\b|\bMASTER SERVICES\b|\bAGREEMENT\b/.test(upper)) {
    detectedType = 'Commercial Contract';
    confidence = 0.90;
  }

  // Override with user selection if explicitly provided
  if (userContext?.docType && userContext.docType !== 'Other') {
    detectedType = userContext.docType;
    confidence = Math.max(confidence, 0.95);
  }

  // Extract parties
  const parties = extractParties(rawText);

  // Effective date
  const dateMatch = rawText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i);

  // Governing law / jurisdiction
  const lawMatch = rawText.match(/governed by (?:and construed under )?the laws of (the State of [A-Za-z]+|[A-Za-z\s]+?)[\.,]/i);
  const govLaw = lawMatch ? lawMatch[1].trim() : undefined;

  const jurisdictionMap: Record<string, Jurisdiction> = {
    'california': 'US - California',
    'new york': 'US - New York',
    'delaware': 'US - Delaware',
    'united kingdom': 'United Kingdom',
    'england': 'United Kingdom',
    'european union': 'European Union',
    'india': 'India',
  };

  let jurisdiction: Jurisdiction = userContext?.jurisdiction || 'General / Unknown';
  if (govLaw) {
    const govLawLower = govLaw.toLowerCase();
    for (const [key, val] of Object.entries(jurisdictionMap)) {
      if (govLawLower.includes(key)) {
        jurisdiction = val;
        break;
      }
    }
  }

  return {
    detectedType,
    confidence,
    parties,
    effectiveDate: dateMatch ? dateMatch[0] : undefined,
    governingLaw: govLaw,
    jurisdiction,
  };
}

/**
 * Extract contracting parties and roles with support for complex naming.
 */
export function extractParties(rawText: string): { name: string; role: string }[] {
  const clean = rawText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
  const partyPattern = /between\s+([A-Z][A-Za-z0-9\s.,]+?)\s+\(([^)]+)\)\s*(?:and|,?\s*and)\s+([A-Z][A-Za-z0-9\s.,]+?)\s+\(([^)]+)\)/i;
  const match = clean.match(partyPattern);
  if (!match) return [];

  const cleanRole = (roleStr: string) => {
    return roleStr
      .replace(/["']/g, '')
      .split(/\s+or\s+/i)[0]
      .replace(/^the\s+/i, '')
      .trim();
  };

  return [
    { name: match[1].trim(), role: cleanRole(match[2]) },
    { name: match[3].trim(), role: cleanRole(match[4]) },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROLE DETERMINATION
// ─────────────────────────────────────────────────────────────────────────────

export function determineUserRole(
  classification: DocClassification,
  userContext?: UserContext | null
): { role: UserRole; isInferred: boolean; counterPartyRole: string } {
  // 1. Explicit user selection
  if (userContext?.role && userContext.role !== 'Other') {
    const counterMap: Record<UserRole, string> = {
      'Employee': 'Employer / Company',
      'Employer': 'Employee / Executive',
      'Tenant': 'Landlord',
      'Landlord': 'Tenant',
      'Freelancer': 'Client',
      'Client': 'Freelancer / Contractor',
      'Vendor': 'Customer / Client',
      'Business Owner': 'Counterparty',
      'Consumer': 'Provider / Vendor',
      'Other': 'Counterparty',
    };
    return {
      role: userContext.role,
      isInferred: false,
      counterPartyRole: counterMap[userContext.role] || 'Counterparty',
    };
  }

  // 2. Infer from document type
  const typeRoleMap: Record<DocumentType, { role: UserRole; counter: string }> = {
    'Employment Agreement': { role: 'Employee', counter: 'Employer / Company' },
    'Freelance / Services Agreement': { role: 'Freelancer', counter: 'Client' },
    'Residential Rental Agreement': { role: 'Tenant', counter: 'Landlord' },
    'Non-Disclosure Agreement (NDA)': { role: 'Other', counter: 'Receiving Party' },
    'Commercial Contract': { role: 'Client', counter: 'Vendor / Provider' },
    'Terms & Policy': { role: 'Consumer', counter: 'Platform Provider' },
    'Other': { role: 'Other', counter: 'Counterparty' },
  };

  const mapped = typeRoleMap[classification.detectedType];
  if (mapped) {
    return { role: mapped.role, isInferred: true, counterPartyRole: mapped.counter };
  }

  return { role: 'Other', isInferred: true, counterPartyRole: 'Counterparty' };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RIGHTS EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

export interface ExtractedRight {
  id: string;
  title: string;
  description: string;
  sourceClause: string;
  page: number;
  excerpt: string;
  confidence: number;
}

const RIGHT_PATTERNS: { pattern: RegExp; title: string; importance: number }[] = [
  { pattern: /retains? the right\s+([^.]+)/i, title: 'Retained Right', importance: 0.95 },
  { pattern: /retains?\s+([^.]+portfolio[^.]+)/i, title: 'Portfolio Display Right', importance: 0.95 },
  { pattern: /may terminate\s+([^.]+)/i, title: 'Termination Right', importance: 0.92 },
  { pattern: /entitled to\s+([^.]+)/i, title: 'Entitlement Right', importance: 0.92 },
  { pattern: /shall provide up to\s+([^.]+revisions?)/i, title: 'Revision Right', importance: 0.90 },
  { pattern: /shall pay\s+([^.]+(?:completed milestone work|severance|bonus)[^.]*)/i, title: 'Payment / Severance Right', importance: 0.92 },
  { pattern: /service credit\s+([^.]+)/i, title: 'Service Credit Right', importance: 0.90 },
  { pattern: /sole and exclusive ownership\s+([^.]+)/i, title: 'Data Ownership Right', importance: 0.95 },
  { pattern: /refundable\s+([^.]+)/i, title: 'Deposit Refund Right', importance: 0.90 },
  { pattern: /eligible for\s+([^.]+)/i, title: 'Bonus / Benefits Eligibility', importance: 0.88 },
  { pattern: /right to\s+([^.]+)/i, title: 'Contractual Right', importance: 0.88 },
  { pattern: /assigns all right[^.]+upon receipt of full payment/i, title: 'Conditional IP Retention', importance: 0.92 },
];

export function extractRights(clauses: SegmentedClause[], userRole: UserRole): ExtractedRight[] {
  const rights: ExtractedRight[] = [];
  const seen = new Set<string>();

  for (const clause of clauses) {
    const text = clause.text;
    const sourceClause = clause.sectionNumber
      ? `Section ${clause.sectionNumber} — ${clause.title}`
      : clause.title;

    for (const rp of RIGHT_PATTERNS) {
      const match = text.match(rp.pattern);
      if (match) {
        const excerpt = match[0].trim();
        const key = excerpt.substring(0, 45).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        rights.push({
          id: `right_${rights.length + 1}`,
          title: `${rp.title}: ${clause.title}`,
          description: `${excerpt.charAt(0).toUpperCase()}${excerpt.slice(1)}.`,
          sourceClause,
          page: clause.pageNumber,
          excerpt: text.substring(0, 200),
          confidence: rp.importance,
        });
      }
    }

    // Compensation & Payment Rights
    if (clause.category === 'payment' && /\$[\d,]+/.test(text)) {
      const moneyMatch = text.match(/\$[\d,]+[^.]+/);
      if (moneyMatch) {
        const key = moneyMatch[0].substring(0, 40).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          rights.push({
            id: `right_${rights.length + 1}`,
            title: `Compensation: ${clause.title}`,
            description: moneyMatch[0].substring(0, 150),
            sourceClause,
            page: clause.pageNumber,
            excerpt: text.substring(0, 200),
            confidence: 0.92,
          });
        }
      }
    }
  }

  return rights;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. OBLIGATIONS EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

const OBLIGATION_PATTERNS: RegExp[] = [
  /(?:shall|must|agrees? to|is required to|undertakes? to|will be obligated to)\s+([^.]{12,120})/ig,
  /(?:is responsible for|shall maintain|shall deliver)\s+([^.]{12,100})/ig,
];

export function extractObligations(
  clauses: SegmentedClause[],
  userRole: UserRole,
  classification: DocClassification
): Obligation[] {
  const obligations: Obligation[] = [];
  const seen = new Set<string>();
  let oblCounter = 0;

  for (const clause of clauses) {
    const text = clause.text;

    for (const pattern of OBLIGATION_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const action = match[1].trim();
        if (action.length < 15) continue;
        const key = action.substring(0, 45).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        oblCounter++;
        const category = getObligationCategory(clause.category);

        obligations.push({
          id: `obl_${oblCounter}`,
          documentId: '',
          actor: inferObligationActor(text, match[0], userRole, classification),
          action: action.charAt(0).toUpperCase() + action.slice(1),
          deadline: extractDeadlineFromText(text),
          category,
          sourceClauseTitle: clause.sectionNumber
            ? `Section ${clause.sectionNumber} — ${clause.title}`
            : clause.title,
          pageNumber: clause.pageNumber,
          urgency: clause.category === 'payment' || clause.category === 'termination' ? 'high' : 'medium',
        });

        if (obligations.length >= 10) break;
      }
      if (obligations.length >= 10) break;
    }
    if (obligations.length >= 10) break;
  }

  return obligations;
}

function inferObligationActor(
  text: string,
  matchStr: string,
  userRole: UserRole,
  classification: DocClassification
): string {
  const idx = text.toLowerCase().indexOf(matchStr.toLowerCase());
  const before = text.substring(Math.max(0, idx - 60), idx).toLowerCase();

  const p0 = classification.parties[0]?.name || '';
  const p1 = classification.parties[1]?.name || '';

  if (p0 && before.includes(p0.toLowerCase().split(' ')[0])) {
    return `${p0} (${classification.parties[0]?.role || 'Counterparty'})`;
  }
  if (p1 && before.includes(p1.toLowerCase().split(' ')[0])) {
    return `${p1} (${classification.parties[1]?.role || userRole})`;
  }

  if (/\b(client|customer|company|employer|landlord)\b/i.test(before)) {
    return classification.parties[0]?.name || 'Counterparty';
  }
  if (/\b(freelancer|contractor|executive|employee|tenant|vendor|agency)\b/i.test(before)) {
    return `You (${userRole})`;
  }

  return `You (${userRole})`;
}

function getObligationCategory(clauseCategory: string): Obligation['category'] {
  switch (clauseCategory) {
    case 'payment': return 'financial';
    case 'termination': return 'notice';
    case 'ip': return 'ip';
    case 'confidentiality': return 'compliance';
    default: return 'general';
  }
}

function extractDeadlineFromText(text: string): string | undefined {
  const patterns = [
    /within\s+(\d+\s+(?:business\s+)?(?:days?|weeks?|months?|hours?))/i,
    /Net\s+(\d+)\s+days?/i,
    /(\d+)\s+(?:days?|weeks?|months?)\s+(?:prior|advance|written|before)/i,
    /for\s+(\d+\s+(?:years?|months?))\s+from/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0];
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DEADLINES EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

export interface ExtractedDeadline {
  event: string;
  dateOrPeriod: string;
  sourceClause: string;
  page: number;
  urgency: 'high' | 'medium' | 'low';
  excerpt: string;
}

const DEADLINE_PATTERNS: { pattern: RegExp; label: string; urgency: 'high' | 'medium' | 'low' }[] = [
  { pattern: /within\s+(\d+\s+(?:business\s+)?(?:days?|weeks?|months?|hours?))(?:\s+of|\s+after|\s+receipt)?/i, label: 'Notice / Feedback Window', urgency: 'high' },
  { pattern: /Net\s+(\d+)\s+days?(?:\s+of\s+invoice\s+date)?/i, label: 'Payment Term', urgency: 'high' },
  { pattern: /(\d+)\s+days?\s+(?:prior|advance|written)\s+notice/i, label: 'Notice Requirement', urgency: 'high' },
  { pattern: /for\s+(\d+\s+(?:years?|months?))\s+(?:from|following)\s+disclosure/i, label: 'Confidentiality Duration', urgency: 'medium' },
  { pattern: /(\d+)\s+months?\s+(?:post.?termination|following\s+termination)/i, label: 'Post-Termination Covenant', urgency: 'medium' },
  { pattern: /commences?\s+on\s+([^.]+?)ends?\s+on\s+([^.]+)/i, label: 'Agreement / Lease Term', urgency: 'medium' },
  { pattern: /due on the (\d+(?:st|nd|rd|th)?\s+day\s+of\s+(?:each|the)\s+month)/i, label: 'Monthly Payment Due', urgency: 'high' },
  { pattern: /auto.?renew(?:ing)?[^.]+/i, label: 'Auto-Renewal Window', urgency: 'medium' },
];

export function extractDeadlines(clauses: SegmentedClause[]): ExtractedDeadline[] {
  const deadlines: ExtractedDeadline[] = [];
  const seen = new Set<string>();

  for (const clause of clauses) {
    const text = clause.text;
    const sourceClause = clause.sectionNumber
      ? `Section ${clause.sectionNumber} — ${clause.title}`
      : clause.title;

    for (const dp of DEADLINE_PATTERNS) {
      const match = text.match(dp.pattern);
      if (match) {
        const key = match[0].substring(0, 45).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        deadlines.push({
          event: `${dp.label}: ${clause.title}`,
          dateOrPeriod: match[0].trim(),
          sourceClause,
          page: clause.pageNumber,
          urgency: dp.urgency,
          excerpt: text.substring(0, 180),
        });
      }
    }
  }

  return deadlines;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RISK / FINDINGS ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

interface RiskRubric {
  category: Finding['category'];
  pattern: RegExp;
  title: string;
  whyItMatters: string;
  priority: RiskPriority;
  suggestedQuestion: string;
}

const RISK_RUBRICS: RiskRubric[] = [
  {
    category: 'ip',
    pattern: /(?:assigns?|transfer[^.]+ownership)[^.]+(?:upon receipt of full payment|full payment)/i,
    title: 'Conditional IP Assignment',
    whyItMatters: 'IP rights transfer exclusively upon full payment. Disputed milestone invoices could leave ownership rights in limbo.',
    priority: 'high',
    suggestedQuestion: 'What specific mechanisms exist to protect IP ownership if a client withholds final milestone payment?',
  },
  {
    category: 'liability',
    pattern: /non.?compete[^.]+(?:\d+)\s+months?/i,
    title: 'Post-Termination Non-Compete',
    whyItMatters: 'Restrictive covenants can severely impede your livelihood. Many jurisdictions (including California) deem broad non-competes void.',
    priority: 'high',
    suggestedQuestion: 'Is this non-compete enforceable under applicable state law, and can the scope and geography be narrowed?',
  },
  {
    category: 'termination',
    pattern: /terminat[^.]+(?:penalty|2.month|fee)/i,
    title: 'Early Termination Penalty',
    whyItMatters: 'Substantial exit fees penalize early termination. Landlords or vendors are often required by law to mitigate damages.',
    priority: 'high',
    suggestedQuestion: 'Is the counterparty obligated to make reasonable efforts to mitigate damages upon early termination notice?',
  },
  {
    category: 'obligation',
    pattern: /Net\s+(\d+)\s+days?/i,
    title: 'Payment Window & Cashflow Terms',
    whyItMatters: 'Extended payment terms impact cashflow. Late payment interest rates should be monitored.',
    priority: 'medium',
    suggestedQuestion: 'Can payment terms be negotiated to Net-7 or Net-15 with prompt payment discounts?',
  },
  {
    category: 'liability',
    pattern: /shall not exceed[^.]+(?:fees paid|12 months?|total)/i,
    title: 'Limitation of Liability Cap',
    whyItMatters: 'Caps recovery for damages, frequently excluding breach of confidentiality or gross negligence.',
    priority: 'high',
    suggestedQuestion: 'Does the liability cap mutually apply, and are data breaches or willful misconduct properly carved out?',
  },
  {
    category: 'renewal',
    pattern: /auto.?renew(?:ing)?[^.]+/i,
    title: 'Automatic Renewal Mechanism',
    whyItMatters: 'Failure to give timely cancellation notice automatically binds you to another full contract term.',
    priority: 'medium',
    suggestedQuestion: 'Can a reminder notice requirement be included 30 days prior to the auto-renewal deadline?',
  },
  {
    category: 'confidentiality',
    pattern: /confidential(?:ity)?[^.]+(?:\d+)\s+years?/i,
    title: 'Multi-Year Confidentiality Term',
    whyItMatters: 'Extended non-disclosure duties require strict data hygiene and restrict public disclosure of work.',
    priority: 'medium',
    suggestedQuestion: 'Are there standard exclusions for information already known or publicly available?',
  },
  {
    category: 'dispute',
    pattern: /binding arbitration/i,
    title: 'Mandatory Binding Arbitration',
    whyItMatters: 'Waives courtroom litigation and jury trial rights in favor of private, binding arbitration proceedings.',
    priority: 'medium',
    suggestedQuestion: 'Where will arbitration take place, and who is responsible for bearing arbitration fees?',
  },
];

export function extractRisks(clauses: SegmentedClause[], rawText: string): Finding[] {
  const findings: Finding[] = [];
  const seen = new Set<string>();

  for (const rubric of RISK_RUBRICS) {
    const match = rawText.match(rubric.pattern);
    if (!match) continue;

    const matchText = match[0];
    const key = rubric.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const matchingClause = clauses.find((clause) => {
      rubric.pattern.lastIndex = 0;
      return rubric.pattern.test(clause.text);
    });

    if (!matchingClause) continue;

    const evidence: FindingEvidence = {
      clauseIdentifier: matchingClause.sectionNumber
        ? `Section ${matchingClause.sectionNumber} — ${matchingClause.title}`
        : matchingClause.title,
      pageNumber: matchingClause.pageNumber,
      excerpt: matchText.substring(0, 200),
    };

    findings.push({
      id: `risk_${findings.length + 1}`,
      documentId: '',
      category: rubric.category,
      priority: rubric.priority,
      title: rubric.title,
      whatItSays: matchText.charAt(0).toUpperCase() + matchText.slice(1),
      whyItMatters: rubric.whyItMatters,
      impact: rubric.priority === 'high'
        ? 'High operational or legal significance. Requires affirmative verification.'
        : 'Standard commercial term. Review to ensure operational alignment.',
      confidence: 0.90,
      evidence,
      suggestedQuestion: rubric.suggestedQuestion,
      limitation: 'Identified via automated text analysis. Consult a qualified attorney for legal counsel.',
    });
  }

  return findings;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. FINANCIAL TERMS EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

export function extractFinancialTerms(clauses: SegmentedClause[]): Array<{ item: string; details: string; sourceClause: string; page: number }> {
  const terms: Array<{ item: string; details: string; sourceClause: string; page: number }> = [];

  for (const clause of clauses) {
    if (clause.category !== 'payment') continue;
    const text = clause.text;
    const sourceClause = clause.sectionNumber
      ? `Section ${clause.sectionNumber} — ${clause.title}`
      : clause.title;

    const moneyMatches = text.match(/\$[\d,]+(?:\.\d+)?[^.]{0,80}/g) || [];
    for (const m of moneyMatches.slice(0, 3)) {
      terms.push({
        item: clause.title,
        details: m.trim(),
        sourceClause,
        page: clause.pageNumber,
      });
    }
  }

  return terms.slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TERMINATION SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export function extractTerminationSummary(
  clauses: SegmentedClause[],
  rawText: string
): { terminationNotice: string; renewalClause: string; penaltiesOrRestrictions: string; sourceClauses: string[] } {
  const termClauses = clauses.filter(c => c.category === 'termination' || c.category === 'renewal');

  let terminationNotice = 'Not specified in document.';
  let renewalClause = 'Not specified in document.';
  let penaltiesOrRestrictions = 'Standard default remedies apply.';
  const sourceClauses: string[] = [];

  const noticeMatch = rawText.match(/(\d+)\s+days?\s+(?:written|advance|prior)\s+notice/i);
  if (noticeMatch) {
    terminationNotice = `${noticeMatch[1]} days written notice required.`;
  }

  const renewalMatch = rawText.match(/auto.?renew(?:ing)?[^.]+/i);
  if (renewalMatch) {
    renewalClause = renewalMatch[0].trim();
  }

  const penaltyMatch = rawText.match(/(?:penalty|fee)[^.]+(?:\$[\d,]+|month[^.]{0,40})/i);
  if (penaltyMatch) {
    penaltiesOrRestrictions = penaltyMatch[0].trim();
  }

  for (const c of termClauses) {
    const label = c.sectionNumber ? `Section ${c.sectionNumber} — ${c.title}` : c.title;
    if (!sourceClauses.includes(label)) sourceClauses.push(label);
  }

  return { terminationNotice, renewalClause, penaltiesOrRestrictions, sourceClauses };
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. LAWYER PREP BRIEF
// ─────────────────────────────────────────────────────────────────────────────

export function buildPrepBrief(
  docId: string,
  classification: DocClassification,
  userRole: UserRole,
  deadlines: ExtractedDeadline[],
  findings: Finding[],
  clauses: SegmentedClause[]
) {
  const topConcerns = findings.slice(0, 4).map(f => ({
    priority: f.priority,
    issue: f.title,
    whyItMatters: f.whyItMatters,
    evidenceCitation: `${f.evidence.clauseIdentifier} • Page ${f.evidence.pageNumber}`,
  }));

  const criticalDates = deadlines.slice(0, 4).map(d => ({
    deadline: d.dateOrPeriod,
    description: d.event,
    clause: d.sourceClause,
  }));

  const questionsForLawyer: string[] = findings.map(f => f.suggestedQuestion).slice(0, 5);

  const ambiguities: string[] = [];
  if (clauses.some(c => c.category === 'ip')) {
    ambiguities.push('IP ownership transfer conditions and timing upon milestone completion.');
  }
  if (clauses.some(c => c.category === 'liability')) {
    ambiguities.push('Enforceability and scope of liability limitation under governing law.');
  }
  if (clauses.some(c => c.category === 'renewal')) {
    ambiguities.push('Auto-renewal notice mechanics and cancellation cutoff dates.');
  }

  const actionChecklist: Array<{ task: string; urgency: 'high' | 'medium' | 'low'; source: string }> = [];
  for (const f of findings.filter(x => x.priority === 'high').slice(0, 3)) {
    actionChecklist.push({
      task: `Review ${f.title} clause with legal counsel.`,
      urgency: 'high',
      source: `${f.evidence.clauseIdentifier} • Page ${f.evidence.pageNumber}`,
    });
  }
  for (const d of deadlines.filter(x => x.urgency === 'high').slice(0, 2)) {
    actionChecklist.push({
      task: `Calendar deadline: ${d.event} (${d.dateOrPeriod}).`,
      urgency: 'high',
      source: `${d.sourceClause} • Page ${d.page}`,
    });
  }

  return {
    documentId: docId,
    generatedAt: new Date().toISOString(),
    documentSummary: `${classification.detectedType} — extracted ${clauses.length} structured clauses.`,
    userPosition: `${userRole} — reviewing ${classification.detectedType}.`,
    topConcerns,
    criticalDates,
    questionsForLawyer,
    documentsAndProofToBring: [
      'Original execution copy of this agreement.',
      'All relevant Statements of Work, invoices, or addenda.',
      'Written email records or amendments regarding changes.',
    ],
    unresolvedAmbiguities: ambiguities,
    actionChecklist,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

export function getAnalysisForDocument(
  documentId: string,
  userContextOverride?: UserContext | null,
  sessionId?: string
): AnalysisResult {
  const storedDoc = documentStore.get(documentId, sessionId);

  if (!storedDoc || !storedDoc.extractedText || storedDoc.extractedText.length < 50) {
    return buildEmptyAnalysis(documentId, storedDoc?.filename || documentId);
  }

  const rawText = storedDoc.extractedText;
  const userContext = userContextOverride || storedDoc.userContext;

  // Step 1: Classify document
  const classification = classifyDocument(rawText, storedDoc.filename, userContext);

  // Step 2: Determine role
  const roleResult = determineUserRole(classification, userContext);
  const userRole = roleResult.role;

  // Step 3: Segment clauses
  const segmented = segmentClauses(rawText);

  // Step 4: Extract grounded analysis
  const rights = extractRights(segmented, userRole);
  const obligations = extractObligations(segmented, userRole, classification);
  const deadlines = extractDeadlines(segmented);
  const findings = extractRisks(segmented, rawText);
  const financialTerms = extractFinancialTerms(segmented);
  const terminationSummary = extractTerminationSummary(segmented, rawText);

  // Step 5: Parties
  const userPartyName = userContext?.role
    ? `You (${userRole})`
    : classification.parties[1]
      ? `${classification.parties[1].name} (${userRole})`
      : `You (${userRole})`;
  const counterPartyName = classification.parties[0]
    ? `${classification.parties[0].name} (${classification.parties[0].role})`
    : roleResult.counterPartyRole;

  // Step 6: Build situationMap
  const situationMap: LegalSituationMap = {
    documentId,
    overview: {
      parties: {
        userParty: userPartyName,
        counterParty: counterPartyName,
      },
      documentPurpose: `${classification.detectedType} — ${storedDoc.filename}`,
      governingLaw: classification.governingLaw,
      termLength: extractTermLength(rawText),
      effectiveDate: classification.effectiveDate,
    },
    keyRights: rights.map(r => ({
      title: r.title,
      description: r.description,
      sourceClause: r.sourceClause,
      page: r.page,
    })),
    obligations: obligations.map(o => ({ ...o, documentId })),
    importantDates: deadlines.map(d => ({
      event: d.event,
      dateOrPeriod: d.dateOrPeriod,
      sourceClause: d.sourceClause,
      page: d.page,
      urgency: d.urgency,
    })),
    financialTerms,
    terminationAndRenewal: terminationSummary,
    missingOrUnclearProtections: buildMissingProtections(segmented, classification),
  };

  // Step 7: Clauses for UI
  const uiClauses: Clause[] = segmented.map((c, idx) => ({
    id: c.id,
    documentId,
    clauseId: `sec_${idx + 1}`,
    clauseNumber: c.sectionNumber || `${idx + 1}`,
    title: c.title,
    text: c.text,
    pageNumber: c.pageNumber,
    category: c.category,
  }));

  // Step 8: Prep Brief
  const prepBrief = buildPrepBrief(documentId, classification, userRole, deadlines, findings, segmented);

  // Step 9: Build final document record
  const effectiveRole = userRole as UserRole;
  const effectiveDocType = userContext?.docType || classification.detectedType;
  const effectiveJurisdiction = classification.jurisdiction || userContext?.jurisdiction || 'General / Unknown';

  return {
    document: {
      id: documentId,
      sessionId: `session_${documentId}`,
      filename: storedDoc.filename,
      fileSizeBytes: storedDoc.fileSize,
      mimeType: storedDoc.fileType,
      userContext: {
        role: effectiveRole,
        docType: effectiveDocType,
        jurisdiction: effectiveJurisdiction,
      },
      pageCount: storedDoc.pageCount,
      rawText: rawText.substring(0, 500),
      processingStatus: 'completed',
      createdAt: storedDoc.uploadedAt,
    },
    clauses: uiClauses,
    situationMap,
    findings: findings.map((finding) => ({
      ...finding,
      documentId,
      evidence: { ...finding.evidence, documentId },
    })),
    prepBrief,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function extractTermLength(rawText: string): string {
  const termMatch = rawText.match(/(?:term|duration|period)\s+(?:is|of)\s+(\d+\s+months?)[^.]{0,40}/i);
  if (termMatch) return termMatch[1];

  const leaseMatch = rawText.match(/commences?\s+on[^.]+ends?\s+on[^.]+\d{4}/i);
  if (leaseMatch) return leaseMatch[0].substring(0, 80);

  const subscriptionMatch = rawText.match(/initial\s+term\s+is\s+([^.]+)/i);
  if (subscriptionMatch) return subscriptionMatch[1].trim();

  return 'As specified in the agreement.';
}

function buildMissingProtections(
  clauses: SegmentedClause[],
  classification: DocClassification
): Array<{ protection: string; whyItMatters: string; recommendation: string }> {
  const categories = new Set(clauses.map(c => c.category));
  const missing: Array<{ protection: string; whyItMatters: string; recommendation: string }> = [];

  if (classification.detectedType === 'Freelance / Services Agreement' || classification.detectedType === 'Commercial Contract') {
    if (!categories.has('liability')) {
      missing.push({
        protection: 'No explicit limitation of liability clause',
        whyItMatters: 'Without an express liability cap, either party may be exposed to unlimited consequential damages.',
        recommendation: 'Request a mutual limitation of liability capping claims to total fees paid under the contract.',
      });
    }
    if (!categories.has('dispute')) {
      missing.push({
        protection: 'No formal dispute resolution protocol',
        whyItMatters: 'Unspecified dispute procedures can lead to protracted and expensive litigation.',
        recommendation: 'Consider adding a mandatory mediation-first or binding arbitration clause.',
      });
    }
  }

  if (classification.detectedType === 'Employment Agreement') {
    if (!categories.has('service_level')) {
      missing.push({
        protection: 'No explicit remote work / equipment policy',
        whyItMatters: 'Device ownership, reimbursement, and BYOD guidelines should be formally articulated.',
        recommendation: 'Verify if a supplemental employee handbook or equipment addendum governs remote work.',
      });
    }
  }

  return missing.slice(0, 3);
}

function buildEmptyAnalysis(documentId: string, filename: string): AnalysisResult {
  return {
    document: {
      id: documentId,
      sessionId: `session_${documentId}`,
      filename,
      fileSizeBytes: 0,
      mimeType: 'application/pdf',
      userContext: { role: 'Other' },
      pageCount: 0,
      rawText: '',
      processingStatus: 'failed',
      errorMessage: 'Document not found in session store. Please re-upload the document.',
      createdAt: new Date().toISOString(),
    },
    clauses: [],
    situationMap: {
      documentId,
      overview: {
        parties: { userParty: 'Not identified', counterParty: 'Not identified' },
        documentPurpose: 'Document could not be analyzed — text not available.',
        governingLaw: undefined,
        termLength: undefined,
        effectiveDate: undefined,
      },
      keyRights: [],
      obligations: [],
      importantDates: [],
      financialTerms: [],
      terminationAndRenewal: {
        terminationNotice: 'Not available',
        renewalClause: 'Not available',
        penaltiesOrRestrictions: 'Not available',
        sourceClauses: [],
      },
      missingOrUnclearProtections: [],
    },
    findings: [],
    prepBrief: {
      documentId,
      generatedAt: new Date().toISOString(),
      documentSummary: 'Analysis could not be completed — document text unavailable.',
      userPosition: 'Unknown — document not loaded.',
      topConcerns: [],
      criticalDates: [],
      questionsForLawyer: [],
      documentsAndProofToBring: [],
      unresolvedAmbiguities: ['Document text was not extractable. Please re-upload the PDF.'],
      actionChecklist: [],
    },
  };
}

export const SAMPLE_ANALYSIS_DATA: Record<string, AnalysisResult> = {};
