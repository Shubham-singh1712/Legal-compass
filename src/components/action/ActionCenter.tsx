'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckSquare,
  HelpCircle,
  UserCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Calendar,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { LegalSituationMap, LawyerPrepBrief } from '@/types/legal';

interface ActionCenterProps {
  deadlines: LegalSituationMap['importantDates'];
  actionItems: LawyerPrepBrief['actionChecklist'];
  onAskLawyerClick?: () => void;
}

export function ActionCenter({
  deadlines,
  actionItems,
  onAskLawyerClick,
}: ActionCenterProps) {
  const [checkedState, setCheckedState] = useState<Record<number, 'Reviewed' | 'Need Clarification' | 'Ask Lawyer' | 'Pending'>>({});
  const [copied, setCopied] = useState(false);

  const toggleStatus = (idx: number, status: 'Reviewed' | 'Need Clarification' | 'Ask Lawyer') => {
    setCheckedState((prev) => ({
      ...prev,
      [idx]: prev[idx] === status ? 'Pending' : status,
    }));
  };

  const completedCount = useMemo(() => {
    return Object.values(checkedState).filter((s) => s === 'Reviewed').length;
  }, [checkedState]);

  const progressPercent = actionItems.length > 0 ? Math.round((completedCount / actionItems.length) * 100) : 0;

  const handleExportPlan = () => {
    const lines = [
      'LEGAL COMPASS — ACTION CHECKLIST',
      '===============================',
      ...actionItems.map((item, idx) => {
        const st = checkedState[idx] || 'Pending';
        return `[${st === 'Reviewed' ? 'X' : ' '}] ${item.task} (Urgency: ${item.urgency}, Source: ${item.source}) — Status: ${st}`;
      }),
      '',
      'KEY TIMELINE DEADLINES:',
      ...deadlines.map((d) => `• ${d.event}: ${d.dateOrPeriod} (${d.sourceClause}, P.${d.page})`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* 1. HEADER & PROGRESS SUMMARY */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl border border-legal-800/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-brand-gold" />
              <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                Your Next Steps & Action Plan
              </h3>
            </div>
            <p className="text-xs text-legal-300">
              Track contract readiness, verify critical clauses, and align before execution.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportPlan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-legal-900 border border-legal-750 text-xs font-semibold text-legal-200 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-gold" />}
              <span>{copied ? 'Copied' : 'Export Plan'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs text-legal-400 font-mono">
            <span>{completedCount} of {actionItems.length} items verified</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="h-2 w-full bg-legal-950 rounded-full overflow-hidden border border-legal-800">
            <div
              className="h-full bg-gradient-to-r from-brand-gold to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. VISUAL DEADLINE TIMELINE */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl border border-legal-800/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-legal-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              Contract Timeline Milestones
            </h4>
          </div>
          <span className="text-xs text-legal-400 font-mono">Chronological Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {deadlines.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-legal-950/80 border border-legal-800 space-y-2 relative group hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 font-medium">
                  {item.dateOrPeriod}
                </span>
                <span className="text-xs font-mono text-legal-400">P.{item.page}</span>
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                {item.event}
              </h5>
              <p className="text-xs text-legal-400 line-clamp-2">
                Referenced in {item.sourceClause}.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. INTERACTIVE REVIEW CHECKLIST */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl border border-legal-800/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-legal-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              Prioritized Review Checklist
            </h4>
          </div>
          <span className="text-xs text-legal-400">Select status to track</span>
        </div>

        <div className="space-y-3">
          {actionItems.map((item, idx) => {
            const currentStatus = checkedState[idx] || 'Pending';
            const isReviewed = currentStatus === 'Reviewed';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isReviewed
                    ? 'bg-legal-950/40 border-legal-800/50 opacity-80'
                    : 'bg-legal-950/80 border-legal-800 hover:border-brand-gold/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-semibold ${isReviewed ? 'line-through text-legal-400' : 'text-white'}`}>
                      {item.task}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-legal-900 border border-legal-800 text-legal-400">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-xs text-legal-400">
                    Priority Urgency: <strong className="text-brand-gold font-medium uppercase">{item.urgency}</strong>
                  </p>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleStatus(idx, 'Reviewed')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentStatus === 'Reviewed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold'
                        : 'bg-legal-900 text-legal-400 border border-legal-800 hover:text-white'
                    }`}
                  >
                    Verified
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus(idx, 'Need Clarification')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentStatus === 'Need Clarification'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700 font-semibold'
                        : 'bg-legal-900 text-legal-400 border border-legal-800 hover:text-white'
                    }`}
                  >
                    Clarify
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus(idx, 'Ask Lawyer')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentStatus === 'Ask Lawyer'
                        ? 'bg-blue-950 text-blue-300 border border-blue-700 font-semibold'
                        : 'bg-legal-900 text-legal-400 border border-legal-800 hover:text-white'
                    }`}
                  >
                    Ask Lawyer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
