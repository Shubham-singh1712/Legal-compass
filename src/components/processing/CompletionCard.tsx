import React from 'react';
import { CheckCircle2, ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { UserContext } from '@/types/legal';

interface CompletionCardProps {
  filename: string;
  userContext: UserContext;
  onViewAnalysis: () => void;
  onReset: () => void;
}

export function CompletionCard({
  filename,
  userContext,
  onViewAnalysis,
  onReset,
}: CompletionCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto surface-card p-8 sm:p-10 border-legal-800/90 bg-legal-900/90 text-center space-y-6 shadow-card-elevated">
      {/* Success Icon with Glow */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-emerald-glow">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      {/* Headings */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
          Processing Complete
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Your document is ready.
        </h3>
        <p className="text-sm text-legal-300 max-w-md mx-auto leading-relaxed">
          We've mapped your obligations, identified potential risks, and linked every finding directly to source evidence.
        </p>
      </div>

      {/* Metadata summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left p-4 rounded-2xl bg-legal-950/80 border border-legal-800/80">
        <div>
          <span className="text-[10px] text-legal-400 uppercase font-medium">Document</span>
          <div className="text-xs font-semibold text-white truncate max-w-[150px] mt-0.5">{filename}</div>
        </div>
        <div>
          <span className="text-[10px] text-legal-400 uppercase font-medium">Perspective</span>
          <div className="text-xs font-semibold text-amber-300 mt-0.5">{userContext.role}</div>
        </div>
        <div>
          <span className="text-[10px] text-legal-400 uppercase font-medium">Jurisdiction</span>
          <div className="text-xs font-semibold text-blue-300 mt-0.5">{userContext.jurisdiction || 'General'}</div>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="p-3.5 rounded-xl bg-legal-950/40 border border-legal-850 text-xs text-legal-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Analysis will cite verifiable clauses and page offsets.</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onViewAnalysis}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-legal-950 font-bold text-sm transition-all shadow-subtle-glow hover:shadow-amber-500/25 active:scale-95"
        >
          <span>View Situation Map</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-legal-850 hover:bg-legal-800 text-legal-300 font-medium text-sm border border-legal-800 transition-colors"
        >
          <span>Upload Another Document</span>
        </button>
      </div>
    </div>
  );
}
