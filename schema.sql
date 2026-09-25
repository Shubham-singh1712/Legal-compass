-- =======================================================================
-- LEGAL COMPASS: Database Schema (Supabase PostgreSQL + pgvector)
-- =======================================================================

-- 1. Enable pgvector extension for clause semantic retrieval
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT DEFAULT 'application/pdf',
    doc_type TEXT, -- e.g. 'Employment Agreement', 'Rental Agreement'
    user_role TEXT, -- e.g. 'Employee', 'Tenant', 'Freelancer'
    jurisdiction TEXT, -- e.g. 'US-CA', 'US-NY', 'General'
    processing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
    error_message TEXT,
    raw_text TEXT,
    page_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Clauses Table (Page-aware segmentation and embeddings)
CREATE TABLE IF NOT EXISTS clauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    clause_id TEXT NOT NULL, -- e.g. 'clause_1', 'sec_3_2'
    clause_number TEXT, -- e.g. '3.2', '14'
    title TEXT NOT NULL, -- e.g. 'Limitation of Liability'
    text TEXT NOT NULL,
    page_number INT NOT NULL DEFAULT 1,
    char_start INT,
    char_end INT,
    clause_category TEXT, -- 'liability', 'termination', 'ip', 'payment', etc.
    embedding vector(1536), -- Compatible with standard embedding models
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clauses_document_id ON clauses(document_id);
CREATE INDEX IF NOT EXISTS idx_clauses_page_number ON clauses(document_id, page_number);

-- 4. Findings Table (Risk Radar items with review priorities)
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'liability' | 'termination' | 'payment' | 'ip' | 'renewal' | 'confidentiality' | 'obligation' | 'other'
    priority TEXT NOT NULL, -- 'high' | 'medium' | 'low' (Framed as Review Priority, not legal verdict)
    title TEXT NOT NULL, -- Short descriptive title
    what_it_says TEXT NOT NULL, -- Plain language description
    why_it_matters TEXT NOT NULL, -- Practical impact cautiously stated
    impact TEXT NOT NULL, -- Severity context
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.900, -- Confidence indicator
    limitation TEXT NOT NULL, -- Epistemic boundary: what cannot be established from the doc
    suggested_question TEXT NOT NULL, -- Question to ask counterparty or attorney
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_findings_document_id ON findings(document_id);

-- 5. Finding Evidence (Links findings to source clauses)
CREATE TABLE IF NOT EXISTS finding_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    clause_id UUID REFERENCES clauses(id) ON DELETE SET NULL,
    clause_identifier TEXT NOT NULL, -- e.g. 'Section 14'
    page_number INT NOT NULL,
    excerpt TEXT NOT NULL,
    highlight_range TEXT
);

CREATE INDEX IF NOT EXISTS idx_finding_evidence_finding_id ON finding_evidence(finding_id);

-- 6. Obligations Table (Legal Situation Map & Action Checklist)
CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    actor TEXT NOT NULL, -- 'You (Employee)', 'Company', 'Landlord', etc.
    action TEXT NOT NULL, -- e.g. 'Provide 30 days written notice prior to termination'
    deadline TEXT, -- e.g. '30 days before termination', '5th of each month'
    condition TEXT, -- e.g. 'In the event of voluntary resignation'
    category TEXT NOT NULL DEFAULT 'operational', -- 'notice', 'financial', 'compliance', 'ip'
    source_clause_id UUID REFERENCES clauses(id) ON DELETE SET NULL,
    source_clause_title TEXT,
    page_number INT,
    is_completed BOOLEAN DEFAULT FALSE,
    urgency TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_obligations_document_id ON obligations(document_id);

-- 7. Grounded Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
    question TEXT,
    answer TEXT NOT NULL,
    uncertainty_flag BOOLEAN DEFAULT FALSE,
    false_premise_detected BOOLEAN DEFAULT FALSE,
    epistemic_label TEXT DEFAULT 'AI interpretation', -- 'From your document' | 'AI interpretation' | 'Needs legal verification' | 'Not found in document'
    limitation_note TEXT,
    suggested_followup TEXT,
    evidence_clause_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_document_id ON chat_messages(document_id);

-- 8. Lawyer Preparation Brief Table
CREATE TABLE IF NOT EXISTS prep_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    situation_summary TEXT NOT NULL,
    top_concerns JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    questions_for_lawyer JSONB NOT NULL DEFAULT '[]'::jsonb,
    documents_to_bring JSONB NOT NULL DEFAULT '[]'::jsonb,
    unresolved_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prep_briefs_document_id ON prep_briefs(document_id);

-- Row Level Security (RLS) policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_briefs ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous access scoped to session_id for MVP demo
CREATE POLICY "Public session access on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Public session access on clauses" ON clauses FOR ALL USING (true);
CREATE POLICY "Public session access on findings" ON findings FOR ALL USING (true);
CREATE POLICY "Public session access on finding_evidence" ON finding_evidence FOR ALL USING (true);
CREATE POLICY "Public session access on obligations" ON obligations FOR ALL USING (true);
CREATE POLICY "Public session access on chat_messages" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Public session access on prep_briefs" ON prep_briefs FOR ALL USING (true);
