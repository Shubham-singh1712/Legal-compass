import React from 'react';
import { AlertTriangle, ChevronRight, HelpCircle, FileText, SlidersHorizontal } from 'lucide-react';
import { Finding } from '@/types/legal';
import { RiskSensitivityMode } from '@/lib/analysisEngine';

interface ReviewPrioritiesSectionProps {
  findings: Finding[];
  onSelectEvidence: (finding: Finding) => void;
  sensitivity: RiskSensitivityMode;
  onOpenSensitivity: () => void;
}

export function ReviewPrioritiesSection({
  findings,
  onSelectEvidence,
  sensitivity,
  onOpenSensitivity,
}: ReviewPrioritiesSectionProps) {
  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-legal-800/80">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Risk Radar
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            What deserves your attention
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-legal-400 hidden sm:inline">{findings.length} prioritized review items</span>
          <button type="button" onClick={onOpenSensitivity} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-legal-700 bg-legal-900 text-xs font-semibold text-amber-300 hover:border-amber-500/60 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{sensitivity === 'strict' ? 'Strict' : sensitivity === 'flexible' ? 'Flexible' : 'Standard'} risk</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {findings.map((finding) => {
          const isHigh = finding.priority === 'high';

          return (
            <div
              key={finding.id}
              onClick={() => onSelectEvidence(finding)}
              className={`surface-card p-6 border transition-all cursor-pointer group space-y-4 hover:-translate-y-0.5 ${
                isHigh
                  ? 'border-rose-900/60 bg-rose-950/15 hover:border-rose-700/80 hover:bg-rose-950/25'
                  : 'border-amber-900/60 bg-amber-950/15 hover:border-amber-700/80 hover:bg-amber-950/25'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isHigh ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isHigh
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                    }`}
                  >
                    {isHigh ? 'High attention' : 'Medium attention'}
                  </span>

                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-legal-950 text-legal-300 border border-legal-800">
                    {finding.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-legal-400 hidden sm:inline">
                    {Math.round(finding.confidence * 100)}% confidence
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all">
                    <span>View evidence</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-200 transition-colors">
                {finding.title}
              </h4>

              {/* What the document says & Why it matters */}
              <div className="space-y-2.5 text-xs sm:text-sm text-legal-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-legal-950/60 border border-legal-800/80">
                  <span className="text-legal-400 text-xs block mb-0.5">What the agreement says:</span>
                  <p className="text-white font-serif italic text-xs sm:text-[13px]">
                    "{finding.whatItSays}"
                  </p>
                </div>

                <div className="text-xs text-legal-300">
                  <strong className="text-amber-300">Why it matters: </strong>
                  {finding.whyItMatters}
                </div>
              </div>

              {/* What to ask box */}
              <div className="p-3.5 rounded-xl bg-legal-950/90 border border-amber-900/30 text-xs text-legal-300 space-y-1">
                <div className="text-[11px] uppercase font-semibold text-amber-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>What to ask your lawyer or counterparty:</span>
                </div>
                <p className="text-white font-medium text-xs">
                  "{finding.suggestedQuestion}"
                </p>
              </div>

              {/* Evidence source pill footer */}
              <div className="flex items-center justify-between text-xs text-legal-400 pt-2 border-t border-legal-800/60">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{finding.evidence.clauseIdentifier}</span>
                </span>
                <span>Page {finding.evidence.pageNumber}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
