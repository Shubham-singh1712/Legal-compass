import React from 'react';
import { Calendar, Clock, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { LegalSituationMap, FindingEvidence } from '@/types/legal';

interface DeadlinesSectionProps {
  deadlines: LegalSituationMap['importantDates'];
  onSelectEvidence: (evidence: FindingEvidence, title: string, interpretation: string) => void;
}

export function DeadlinesSection({
  deadlines,
  onSelectEvidence,
}: DeadlinesSectionProps) {
  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-legal-800/80">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Critical Dates & Notice Windows
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Important Contract Deadlines
          </h3>
        </div>
        <span className="text-xs text-legal-400">
          {deadlines.length} timelines identified
        </span>
      </div>

      <div className="space-y-3">
        {deadlines.map((item, idx) => {
          const isHigh = item.urgency === 'high';

          return (
            <div
              key={idx}
              onClick={() => {
                onSelectEvidence(
                  {
                    clauseIdentifier: item.sourceClause,
                    pageNumber: item.page,
                    excerpt: `${item.event}: ${item.dateOrPeriod}`,
                  },
                  item.event,
                  `Timeline / Notice: ${item.dateOrPeriod} (Review urgency: ${item.urgency})`
                );
              }}
              className="surface-card p-5 border-legal-800/80 bg-legal-900/60 hover:bg-legal-900 hover:border-amber-500/40 hover:shadow-subtle-glow transition-all cursor-pointer group space-y-3 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isHigh
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-legal-850 text-legal-300 border border-legal-750'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                      {item.event}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-legal-850 text-legal-300 border border-legal-750'
                    }`}
                  >
                    {item.urgency === 'high' ? 'High urgency' : 'Standard'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-legal-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-legal-950/70 border border-legal-800/80 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-medium text-amber-300">⏱ Required Timeline: {item.dateOrPeriod}</span>
                <span className="text-legal-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-legal-500" />
                  <span>{item.sourceClause} • Page {item.page}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
