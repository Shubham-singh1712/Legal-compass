import { z } from 'zod';

export const FindingEvidenceSchema = z.object({
  clauseIdentifier: z.string(),
  pageNumber: z.number().int().positive(),
  excerpt: z.string(),
  sourceClauseId: z.string().optional(),
});

export const FindingSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  category: z.enum(['liability', 'termination', 'payment', 'ip', 'renewal', 'confidentiality', 'obligation', 'dispute', 'other']),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  whatItSays: z.string(),
  whyItMatters: z.string(),
  impact: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: FindingEvidenceSchema,
  suggestedQuestion: z.string(),
  limitation: z.string(),
});

export const ObligationSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  actor: z.string(),
  action: z.string(),
  deadline: z.string().optional(),
  condition: z.string().optional(),
  category: z.enum(['notice', 'financial', 'compliance', 'ip', 'general']),
  sourceClauseTitle: z.string().optional(),
  pageNumber: z.number().int().positive().optional(),
  isCompleted: z.boolean().optional(),
  urgency: z.enum(['high', 'medium', 'low']),
});

export const UserContextSchema = z.object({
  role: z.enum([
    'Employee',
    'Employer',
    'Tenant',
    'Landlord',
    'Freelancer',
    'Client',
    'Vendor',
    'Business Owner',
    'Consumer',
    'Other'
  ]),
  docType: z.enum([
    'Employment Agreement',
    'Residential Rental Agreement',
    'Freelance / Services Agreement',
    'Non-Disclosure Agreement (NDA)',
    'Commercial Contract',
    'Terms & Policy',
    'Other'
  ]).optional(),
  jurisdiction: z.enum([
    'US - California',
    'US - New York',
    'US - Delaware',
    'United Kingdom',
    'European Union',
    'India',
    'General / Unknown'
  ]).optional(),
  specificConcerns: z.string().optional(),
});

export const GroundedChatResponseSchema = z.object({
  answer: z.string(),
  evidence: z.array(FindingEvidenceSchema).optional(),
  uncertaintyFlag: z.boolean().default(false),
  falsePremiseDetected: z.boolean().default(false),
  epistemicLabel: z.enum([
    'From your document',
    'AI interpretation',
    'Needs legal verification',
    'Not found in document'
  ]).default('AI interpretation'),
  limitationNote: z.string().optional(),
  suggestedFollowUp: z.string().optional(),
});
