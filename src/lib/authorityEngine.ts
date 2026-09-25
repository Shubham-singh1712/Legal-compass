/**
 * authorityEngine.ts
 * Phase 5: Legal Authority Layer
 * Manages external legal context separately from internal document evidence.
 */

import { Jurisdiction } from '@/types/legal';

export interface LegalAuthorityContext {
  jurisdiction: Jurisdiction;
  topic: string;
  documentExcerpt: string;
  applicableStatuteOrRule?: {
    statuteName: string;
    section: string;
    summary: string;
    sourceUrl?: string;
  };
  relationshipExplanation: string;
  verificationStatus: 'VERIFIED_STATUTE' | 'GENERAL_PRINCIPLE' | 'INSUFFICIENT_AUTHORITY';
  limitationNote: string;
}

export function getLegalAuthorityContext(
  jurisdiction: Jurisdiction | undefined,
  topic: string,
  clauseText: string
): LegalAuthorityContext {
  if (!jurisdiction || jurisdiction === 'General / Unknown') {
    return {
      jurisdiction: 'General / Unknown',
      topic,
      documentExcerpt: clauseText,
      relationshipExplanation: 'Jurisdiction is required before providing jurisdiction-specific statutory legal context.',
      verificationStatus: 'INSUFFICIENT_AUTHORITY',
      limitationNote: 'Select a specific jurisdiction during context setup to evaluate applicable local legal statutes.',
    };
  }

  const lowerTopic = topic.toLowerCase();
  const lowerText = clauseText.toLowerCase();

  // 1. Non-compete under California Law
  if (jurisdiction === 'US - California' && (lowerTopic.includes('non-compete') || lowerText.includes('non-compete') || lowerText.includes('competing business'))) {
    return {
      jurisdiction: 'US - California',
      topic: 'Post-Employment Non-Compete Enforceability',
      documentExcerpt: clauseText,
      applicableStatuteOrRule: {
        statuteName: 'California Business & Professions Code',
        section: 'Section 16600 & 16600.5',
        summary: 'Except as otherwise provided, every contract by which anyone is restrained from engaging in a lawful profession, trade, or business of any kind is to that extent void.',
      },
      relationshipExplanation: 'Your contract clause restricts post-employment competition, but California Business & Professions Code § 16600 renders post-employment non-competes void as a matter of public policy.',
      verificationStatus: 'VERIFIED_STATUTE',
      limitationNote: 'Statutory rule applies to California residents and contracts governed by California law.',
    };
  }

  // 2. Security Deposit under New York Housing Law
  if (jurisdiction === 'US - New York' && (lowerTopic.includes('deposit') || lowerText.includes('security deposit') || lowerText.includes('move-out'))) {
    return {
      jurisdiction: 'US - New York',
      topic: 'Residential Security Deposit Return Window',
      documentExcerpt: clauseText,
      applicableStatuteOrRule: {
        statuteName: 'New York General Obligations Law',
        section: 'GOL § 7-108(1-a)',
        summary: 'Within 14 days after the tenant has vacated the premises, the landlord shall provide the tenant with an itemized statement indicating the basis for retaining any portion of the deposit.',
      },
      relationshipExplanation: 'If the lease allows 30 days for deposit returns, New York General Obligations Law § 7-108 specifies a 14-day statutory limit for residential leases.',
      verificationStatus: 'VERIFIED_STATUTE',
      limitationNote: 'Applies to non-rent-regulated residential dwellings in New York State.',
    };
  }

  // 3. Delaware Corporate Law / General Arbitration
  if (jurisdiction === 'US - Delaware' && (lowerTopic.includes('arbitration') || lowerText.includes('arbitration') || lowerText.includes('delaware'))) {
    return {
      jurisdiction: 'US - Delaware',
      topic: 'Delaware Uniform Arbitration Act',
      documentExcerpt: clauseText,
      applicableStatuteOrRule: {
        statuteName: 'Delaware Code Title 10',
        section: 'Chapter 57 (Uniform Arbitration Act)',
        summary: 'A written agreement to submit any existing controversy or any controversy thereafter arising to arbitration is valid, enforceable and irrevocable.',
      },
      relationshipExplanation: 'Mandatory arbitration provisions in Delaware contracts are generally enforced according to their explicit written terms under Title 10.',
      verificationStatus: 'VERIFIED_STATUTE',
      limitationNote: 'Subject to general contract defenses such as unconscionability.',
    };
  }

  // Fallback for unmapped statutory edge-cases
  return {
    jurisdiction,
    topic,
    documentExcerpt: clauseText,
    relationshipExplanation: `Extracted contract provision is governed under ${jurisdiction}. Specific statutory overrides were not identified for this clause pattern.`,
    verificationStatus: 'GENERAL_PRINCIPLE',
    limitationNote: 'The document text represents the binding agreement between parties unless contradicted by mandatory local statutes.',
  };
}
