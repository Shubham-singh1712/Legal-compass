import React from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export type StepState = 'pending' | 'running' | 'completed' | 'error';

interface ProcessingStepProps {
  number: number;
  title: string;
  description: string;
  state: StepState;
  detail?: string;
}

export function ProcessingStep({
  number,
  title,
  description,
  state,
  detail,
}: ProcessingStepProps) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 ${
        state === 'running'
          ? 'bg-amber-500/10 border-amber-500/40 shadow-subtle-glow -translate-y-0.5'
          : state === 'completed'
          ? 'bg-legal-900/80 border-legal-800/80'
          : state === 'error'
          ? 'bg-rose-950/40 border-rose-800/80'
          : 'bg-legal-950/40 border-legal-850/60 opacity-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Step Icon / Status Indicator */}
          <div className="mt-0.5 shrink-0">
            {state === 'completed' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {state === 'running' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            {state === 'pending' && (
              <div className="w-6 h-6 rounded-full bg-legal-850 border border-legal-750 flex items-center justify-center text-legal-500 text-xs font-mono font-medium">
                {number}
              </div>
            )}
            {state === 'error' && (
              <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
              <h4
                className={`text-sm font-semibold ${
                  state === 'running'
                    ? 'text-amber-200'
                    : state === 'completed'
                    ? 'text-white'
                    : state === 'error'
                    ? 'text-rose-200'
                    : 'text-legal-400'
                }`}
              >
                {title}
              </h4>
              {state === 'running' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  In progress
                </span>
              )}
            </div>
            <p className="text-xs text-legal-400 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Phase label */}
        {detail && (
          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-legal-950 border border-legal-800 text-legal-300 shrink-0 hidden sm:inline-block">
            {detail}
          </span>
        )}
      </div>
    </div>
  );
}
