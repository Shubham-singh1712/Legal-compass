import React from 'react';
import { Scale, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LegalSituationMap, FindingEvidence } from '@/types/legal';

interface RightsSectionProps {
  rights: LegalSituationMap['keyRights'];
  onSelectEvidence: (evidence: FindingEvidence, title: string, interpretation: string) => void;
}

export function RightsSection({ rights, onSelectEvidence }: RightsSectionProps) {
  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-legal-800/80">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Protections & Entitlements
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Key Rights Identified
          </h3>
        </div>
        <span className="text-xs text-legal-400">
          {rights.length} rights & entitlements
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rights.map((right, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (right.sourceClause && right.page) {
                onSelectEvidence(
                  {
                    clauseIdentifier: right.sourceClause,
                    pageNumber: right.page,
                    excerpt: right.description,
                  },
                  right.title,
                  right.description
                );
              }
            }}
            className="surface-card p-5 border-legal-800/80 bg-legal-900/70 hover:bg-legal-900 hover:border-emerald-500/40 hover:shadow-emerald-glow transition-all cursor-pointer group space-y-3 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {right.title}
                </h4>
              </div>
              <ChevronRight className="w-4 h-4 text-legal-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>

            <p className="text-xs text-legal-300 leading-relaxed">
              {right.description}
            </p>

            {right.sourceClause && (
              <div className="pt-2.5 border-t border-legal-800/60 flex items-center justify-between text-xs text-legal-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{right.sourceClause}</span>
                </span>
                <span>Page {right.page || 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
