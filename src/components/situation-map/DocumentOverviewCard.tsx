'use client';

import React from 'react';
import { Users, BookOpen, ShieldCheck, MapPin, Calendar, Clock, AlertCircle, HelpCircle, User, Building2 } from 'lucide-react';
import { LegalSituationMap } from '@/types/legal';

interface DocumentOverviewCardProps {
  overview: LegalSituationMap['overview'];
  missingProtections: LegalSituationMap['missingOrUnclearProtections'];
  onInspectEvidence?: (clause: string, page: number, excerpt: string, interpretation: string) => void;
}

export function DocumentOverviewCard({
  overview,
  missingProtections,
}: DocumentOverviewCardProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Narrative Section Header */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl border border-legal-800/90 space-y-6 shadow-card-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-legal-800/80">
          <div>
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
              Executive Situation Narrative
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight mt-1">
              Here's what matters in this document.
            </h3>
          </div>
          <span className="badge-epistemic-doc self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Document Grounded</span>
          </span>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-legal-950/80 border border-brand-gold/25 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-brand-gold font-semibold uppercase tracking-wider">
                Your Position / Role
              </span>
            </div>
            <div className="text-base font-serif font-bold text-white pl-0.5">
              {overview.parties.userParty}
            </div>
            <p className="text-xs text-legal-400 pl-0.5">Primary perspective applied to this analysis</p>
          </div>

          <div className="p-5 rounded-2xl bg-legal-950/80 border border-blue-500/25 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                Identified Counterparty
              </span>
            </div>
            <div className="text-base font-serif font-bold text-white pl-0.5">
              {overview.parties.counterParty}
            </div>
            <p className="text-xs text-legal-400 pl-0.5">Bound entity under mutual terms</p>
          </div>
        </div>

        {/* Purpose */}
        <div className="p-5 rounded-2xl bg-legal-950/60 border border-legal-800/80 space-y-2.5">
          <span className="text-xs font-semibold text-brand-gold flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Document Purpose & Scope</span>
          </span>
          <p className="text-sm text-legal-200 leading-relaxed font-normal">
            {overview.documentPurpose}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-legal-300">
          <div className="p-4 rounded-xl bg-legal-950/70 border border-legal-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-legal-400 uppercase font-medium">Governing Law</div>
              <div className="font-semibold text-white text-xs mt-0.5">{overview.governingLaw || 'Not specified'}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-legal-950/70 border border-legal-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-legal-400 uppercase font-medium">Term Length</div>
              <div className="font-semibold text-white text-xs mt-0.5">{overview.termLength || 'Fixed / Ongoing'}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-legal-950/70 border border-legal-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-legal-400 uppercase font-medium">Effective Date</div>
              <div className="font-semibold text-white text-xs mt-0.5">{overview.effectiveDate || 'Upon execution'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing or Ambiguous Protections Card */}
      {missingProtections && missingProtections.length > 0 && (
        <div className="surface-card p-6 sm:p-7 rounded-2xl border border-amber-900/40 bg-amber-950/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-900/30">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Notable Missing or Ambiguous Protections
            </h4>
          </div>

          <div className="space-y-3">
            {missingProtections.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-legal-950/90 border border-amber-900/40 space-y-2.5 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-amber-200">{item.protection}</span>
                  <span className="badge-epistemic-missing text-xs shrink-0">
                    Missing in agreement
                  </span>
                </div>
                <p className="text-xs text-legal-300 leading-relaxed">
                  <strong className="text-white font-medium">Why it matters:</strong> {item.whyItMatters}
                </p>
                <div className="pt-1.5 text-xs text-amber-200/90 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span><strong>Suggested Ask:</strong> {item.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
