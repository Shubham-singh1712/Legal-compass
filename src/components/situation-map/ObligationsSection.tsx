'use client';

import React, { useState } from 'react';
import { CheckSquare, Clock, User, Building, FileText, ChevronRight } from 'lucide-react';
import { Obligation, FindingEvidence } from '@/types/legal';

interface ObligationsSectionProps {
  obligations: Obligation[];
  onSelectEvidence: (evidence: FindingEvidence, title: string, interpretation: string) => void;
}

export function ObligationsSection({
  obligations,
  onSelectEvidence,
}: ObligationsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'user' | 'counterparty'>('all');

  const filteredObligations = obligations.filter((ob) => {
    if (filter === 'user') return ob.actor.toLowerCase().includes('you') || ob.actor.toLowerCase().includes('employee') || ob.actor.toLowerCase().includes('tenant') || ob.actor.toLowerCase().includes('freelancer');
    if (filter === 'counterparty') return !ob.actor.toLowerCase().includes('you');
    return true;
  });

  return (
    <div className="space-y-5 text-left">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-legal-800/80">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Operational Duties
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Identified Obligations
          </h3>
        </div>

        {/* Actor Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-legal-900 border border-legal-800 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-legal-800 text-white font-semibold shadow-sm'
                : 'text-legal-400 hover:text-legal-200'
            }`}
          >
            All ({obligations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('user')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'user'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                : 'text-legal-400 hover:text-legal-200'
            }`}
          >
            Your Duties
          </button>
          <button
            type="button"
            onClick={() => setFilter('counterparty')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'counterparty'
                ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40 shadow-sm'
                : 'text-legal-400 hover:text-legal-200'
            }`}
          >
            Counterparty Duties
          </button>
        </div>
      </div>

      {/* Obligations List */}
      <div className="space-y-3">
        {filteredObligations.map((ob) => {
          const isUser = ob.actor.toLowerCase().includes('you') || ob.actor.toLowerCase().includes('employee') || ob.actor.toLowerCase().includes('tenant') || ob.actor.toLowerCase().includes('freelancer');

          return (
            <div
              key={ob.id}
              onClick={() => {
                onSelectEvidence(
                  {
                    clauseIdentifier: ob.sourceClauseTitle || 'Obligation Provision',
                    pageNumber: ob.pageNumber || 1,
                    excerpt: ob.action,
                  },
                  ob.action,
                  `Actor: ${ob.actor} | Timeline: ${ob.deadline || 'Standard contractual term'} | Category: ${ob.category}`
                );
              }}
              className="surface-card p-5 border-legal-800/80 bg-legal-900/60 hover:bg-legal-900 hover:border-blue-500/40 hover:shadow-blue-glow transition-all cursor-pointer group space-y-3 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                      isUser
                        ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                        : 'bg-blue-950/70 text-blue-300 border border-blue-800/60'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                    <span>{ob.actor}</span>
                  </span>

                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-legal-950 text-legal-300 border border-legal-800">
                    {ob.category}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-legal-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>

              {/* Action Description */}
              <p className="text-xs sm:text-sm text-white leading-relaxed font-medium">
                {ob.action}
              </p>

              {/* Deadline & Source info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-legal-800/60 text-xs text-legal-400">
                {ob.deadline ? (
                  <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timeline: {ob.deadline}</span>
                  </span>
                ) : (
                  <span className="text-legal-500">Standard operational term</span>
                )}

                {ob.sourceClauseTitle && (
                  <span className="flex items-center gap-1.5 text-legal-400">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>{ob.sourceClauseTitle}</span>
                    <span>• Page {ob.pageNumber || 1}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
