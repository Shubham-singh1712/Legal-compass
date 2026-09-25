'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, HelpCircle, Scale, Copy, Check, Info, Sparkles, BookOpen } from 'lucide-react';
import { FindingEvidence } from '@/types/legal';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  evidence: FindingEvidence | null;
  interpretation?: string;
  whyItMatters?: string;
  suggestedQuestion?: string;
  limitation?: string;
  confidence?: number;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  title,
  evidence,
  interpretation,
  whyItMatters,
  suggestedQuestion,
  limitation,
  confidence = 0.92,
}: EvidenceDrawerProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !evidence) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Background click overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-xl bg-legal-950 border-l border-legal-800/80 h-full overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-left flex flex-col z-10">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-legal-800">
          <div className="space-y-2 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-epistemic-doc inline-flex items-center gap-1.5 px-2.5 py-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Document Evidence</span>
              </span>
              <span className="text-xs font-mono text-legal-400 px-2 py-0.5 rounded-md bg-legal-900 border border-legal-800">
                Page {evidence.pageNumber}
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-legal-400 hover:text-white hover:bg-legal-850 transition-colors shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. WHY WE FLAGGED THIS */}
        <div className="surface-card p-4 rounded-xl border border-legal-800/90 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-brand-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-semibold">Why We Flagged This</span>
          </div>
          <p className="text-sm text-legal-200 leading-relaxed">
            {interpretation || 'This clause establishes key binding obligations or legal restrictions that significantly affect your operational position under this agreement.'}
          </p>
        </div>

        {/* 2. DOCUMENT EVIDENCE (QUOTATION) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{evidence.clauseIdentifier}</span>
            </span>
            <button
              onClick={() => handleCopy(evidence.excerpt, 'excerpt')}
              className="inline-flex items-center gap-1 text-xs text-legal-400 hover:text-legal-200 transition-colors"
            >
              {copied === 'excerpt' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy text</span>
                </>
              )}
            </button>
          </div>

          <div className="relative p-5 rounded-2xl bg-legal-900/90 border border-emerald-500/20 text-legal-100 shadow-inner">
            <div className="absolute top-3 right-4 text-emerald-400/20 text-4xl font-serif select-none pointer-events-none">
              “
            </div>
            <p className="text-sm font-serif italic leading-relaxed pr-6 text-legal-200">
              "{evidence.excerpt}"
            </p>
          </div>
        </div>

        {/* 3. WHY IT MATTERS (PRACTICAL IMPACT) */}
        {whyItMatters && (
          <div className="surface-card p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Why It Matters In Practice</span>
            </span>
            <p className="text-sm text-legal-200 leading-relaxed">
              {whyItMatters}
            </p>
          </div>
        )}

        {/* 4. SUGGESTED QUESTION TO ASK */}
        {suggestedQuestion && (
          <div className="surface-card p-4 rounded-xl border border-brand-gold/30 bg-brand-gold/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Question To Ask Counterparty / Counsel</span>
              </span>
              <button
                onClick={() => handleCopy(suggestedQuestion, 'question')}
                className="inline-flex items-center gap-1 text-xs text-brand-gold/80 hover:text-brand-gold transition-colors"
              >
                {copied === 'question' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-legal-950/80 border border-legal-800 text-sm text-white font-serif italic">
              "{suggestedQuestion}"
            </div>
          </div>
        )}

        {/* 5. EPISTEMIC LIMITATION NOTICE */}
        <div className="mt-auto pt-5 border-t border-legal-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-legal-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Scale className="w-3.5 h-3.5 text-legal-400" />
              <span>Grounded Extraction Confidence: {(confidence * 100).toFixed(0)}%</span>
            </span>
            <span className="badge-epistemic-warn text-xs">
              Requires Legal Verification
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-legal-900/60 border border-legal-800 text-xs text-legal-400 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-legal-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-legal-300 font-medium">What this document doesn't tell us: </strong>
              <span>{limitation || 'Enforceability depends on governing jurisdiction precedents, local labor or contract statutes, and facts outside the document text.'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
