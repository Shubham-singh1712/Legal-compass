export type UserRole =
  | 'Employee'
  | 'Employer'
  | 'Tenant'
  | 'Landlord'
  | 'Freelancer'
  | 'Client'
  | 'Vendor'
  | 'Business Owner'
  | 'Consumer'
  | 'Other';

export type DocumentType =
  | 'Employment Agreement'
  | 'Residential Rental Agreement'
  | 'Freelance / Services Agreement'
  | 'Non-Disclosure Agreement (NDA)'
  | 'Commercial Contract'
  | 'Terms & Policy'
  | 'Other';

export type Jurisdiction =
  | 'US - California'
  | 'US - New York'
  | 'US - Delaware'
  | 'United Kingdom'
  | 'European Union'
  | 'India'
  | 'General / Unknown';

export type ProcessingStatus = 'idle' | 'uploading' | 'parsing' | 'segmenting' | 'analyzing' | 'completed' | 'failed';

export type RiskPriority = 'high' | 'medium' | 'low';

export type EpistemicLabel =
  | 'From your document'
  | 'AI interpretation'
  | 'Needs legal verification'
  | 'Not found in document';

export interface UserContext {
  role: UserRole;
  docType?: DocumentType;
  jurisdiction?: Jurisdiction;
  specificConcerns?: string;
}

export interface LegalDocument {
  id: string;
  sessionId: string;
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
  userContext: UserContext;
  pageCount: number;
  rawText: string;
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  createdAt: string;
}

export interface Clause {
  id: string;
  documentId: string;
  clauseId: string; // e.g. 'clause_14'
  clauseNumber?: string; // e.g. '14.2'
  title: string;
  text: string;
  pageNumber: number;
  category?: string;
  charStart?: number;
  charEnd?: number;
}

export interface FindingEvidence {
  documentId?: string;
  clauseIdentifier: string; // e.g. "Section 14 — Limitation of Liability"
  pageNumber: number;
  excerpt: string;
  sourceClauseId?: string;
}

export interface Finding {
  id: string;
  documentId: string;
  category: 'liability' | 'termination' | 'payment' | 'ip' | 'renewal' | 'confidentiality' | 'obligation' | 'dispute' | 'other';
  priority: RiskPriority; // Review priority
  title: string;
  whatItSays: string;
  whyItMatters: string;
  impact: string;
  confidence: number; // 0.0 - 1.0
  evidence: FindingEvidence;
  suggestedQuestion: string;
  limitation: string;
}

export interface Obligation {
  id: string;
  documentId: string;
  actor: string; // e.g. "You (Employee)", "Company"
  action: string;
  deadline?: string;
  condition?: string;
  category: 'notice' | 'financial' | 'compliance' | 'ip' | 'general';
  sourceClauseTitle?: string;
  pageNumber?: number;
  isCompleted?: boolean;
  urgency: 'high' | 'medium' | 'low';
}

export interface LegalSituationMap {
  documentId: string;
  overview: {
    parties: {
      userParty: string;
      counterParty: string;
    };
    documentPurpose: string;
    governingLaw?: string;
    termLength?: string;
    effectiveDate?: string;
  };
  keyRights: Array<{
    title: string;
    description: string;
    sourceClause?: string;
    page?: number;
  }>;
  obligations: Obligation[];
  importantDates: Array<{
    event: string;
    dateOrPeriod: string;
    sourceClause: string;
    page: number;
    urgency: 'high' | 'medium' | 'low';
  }>;
  financialTerms: Array<{
    item: string;
    details: string;
    sourceClause: string;
    page: number;
  }>;
  terminationAndRenewal: {
    terminationNotice: string;
    renewalClause: string;
    penaltiesOrRestrictions: string;
    sourceClauses: string[];
  };
  missingOrUnclearProtections: Array<{
    protection: string;
    whyItMatters: string;
    recommendation: string;
  }>;
}

export interface GroundedChatMessage {
  id: string;
  documentId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidence?: FindingEvidence[];
  uncertaintyFlag?: boolean;
  falsePremiseDetected?: boolean;
  epistemicLabel?: EpistemicLabel;
  limitationNote?: string;
  suggestedFollowUp?: string;
}

export interface LawyerPrepBrief {
  documentId: string;
  generatedAt: string;
  documentSummary: string;
  userPosition: string;
  topConcerns: Array<{
    priority: RiskPriority;
    issue: string;
    whyItMatters: string;
    evidenceCitation: string;
  }>;
  criticalDates: Array<{
    deadline: string;
    description: string;
    clause: string;
  }>;
  questionsForLawyer: string[];
  documentsAndProofToBring: string[];
  unresolvedAmbiguities: string[];
  actionChecklist: Array<{
    task: string;
    urgency: 'high' | 'medium' | 'low';
    source: string;
  }>;
}

export interface AnalysisResult {
  document: LegalDocument;
  clauses: Clause[];
  situationMap: LegalSituationMap;
  findings: Finding[];
  prepBrief: LawyerPrepBrief;
}
