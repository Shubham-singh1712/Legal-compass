'use client';

import React from 'react';
import { Compass, Shield, CheckSquare, AlertTriangle, Clock, ArrowRight, Sparkles, Scale, FileText } from 'lucide-react';

interface LegalSituationMapDiagramProps {
  rightsCount: number;
  obligationsCount: number;
  risksCount: number;
  deadlinesCount: number;
  onNavigateTab: (tab: 'rights' | 'obligations' | 'review' | 'deadlines' | 'action') => void;
}

export function LegalSituationMapDiagram({
  rightsCount,
  obligationsCount,
  risksCount,
  deadlinesCount,
  onNavigateTab,
}: LegalSituationMapDiagramProps) {
  return (
    <div className="surface-card p-6 sm:p-8 border-legal-800/90 bg-legal-900/90 relative overflow-hidden text-left shadow-card-elevated">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-legal-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-subtle-glow">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Legal Situation Map
            </h3>
            <p className="text-xs text-legal-400">
              Interactive structural map of your agreement's interconnected provisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-legal-950 text-legal-300 border border-legal-800 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Connected Relationship Graph</span>
          </span>
        </div>
      </div>

      {/* Visual Relationship Diagram Structure */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Node 1: Root Agreement */}
        <div className="flex justify-center">
          <div className="px-6 py-3 rounded-2xl bg-legal-850 border border-legal-750 text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-white">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Your Executed Agreement</span>
            </div>
            <p className="text-[10px] text-legal-400 mt-0.5">Primary Legal Binding Context</p>
          </div>
        </div>

        {/* Tree Connectors SVG */}
        <div className="flex justify-center -my-2">
          <svg className="w-full max-w-xl h-8 text-legal-700" viewBox="0 0 400 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M200 0 V 15 M200 15 H 60 V 30 M200 15 H 200 V 30 M200 15 H 340 V 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* Level 2: Three Pillars (Rights, Obligations, Risks) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Rights / Protection */}
          <button
            type="button"
            onClick={() => onNavigateTab('rights')}
            className="surface-elevated p-4 rounded-2xl border-emerald-900/50 hover:border-emerald-500/50 hover:shadow-emerald-glow transition-all text-left group hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Key Rights
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/50">
                {rightsCount}
              </span>
            </div>
            <p className="text-[11px] text-legal-400 leading-relaxed">
              Your protections, compensations, deliverables, and entitlement provisions.
            </p>
            <div className="mt-3 pt-2 border-t border-legal-800/60 flex items-center justify-between text-[10px] text-emerald-400/90 font-medium">
              <span>View protections</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Pillar 2: Obligations / Duties */}
          <button
            type="button"
            onClick={() => onNavigateTab('obligations')}
            className="surface-elevated p-4 rounded-2xl border-blue-900/50 hover:border-blue-500/50 hover:shadow-blue-glow transition-all text-left group hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  Obligations
                </span>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-800/50">
                {obligationsCount}
              </span>
            </div>
            <p className="text-[11px] text-legal-400 leading-relaxed">
              Your operational duties, counterparty obligations, and restrictions.
            </p>
            <div className="mt-3 pt-2 border-t border-legal-800/60 flex items-center justify-between text-[10px] text-blue-400/90 font-medium">
              <span>View duties</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Pillar 3: Risks / Review Priorities */}
          <button
            type="button"
            onClick={() => onNavigateTab('review')}
            className="surface-elevated p-4 rounded-2xl border-rose-900/50 hover:border-rose-500/50 hover:shadow-subtle-glow transition-all text-left group hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                  Review Items
                </span>
              </div>
              <span className="text-xs font-bold text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-800/50">
                {risksCount}
              </span>
            </div>
            <p className="text-[11px] text-legal-400 leading-relaxed">
              Provisions deserving attention: auto-renewals, caps & ambiguities.
            </p>
            <div className="mt-3 pt-2 border-t border-legal-800/60 flex items-center justify-between text-[10px] text-rose-400/90 font-medium">
              <span>View priorities</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Tree Connectors SVG to Level 3 */}
        <div className="flex justify-center -my-2">
          <svg className="w-full max-w-xl h-8 text-legal-700" viewBox="0 0 400 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 0 V 15 H 200 V 30 M200 0 V 30 M340 0 V 15 H 200" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* Level 3: Deadlines & Action Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onNavigateTab('deadlines')}
            className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 hover:border-amber-500/50 transition-all text-left group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  {deadlinesCount} Critical Timelines & Deadlines
                </div>
                <div className="text-[11px] text-legal-400">Notice windows and expiry triggers</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('action')}
            className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 hover:border-purple-500/50 transition-all text-left group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  Action Center & Next Steps
                </div>
                <div className="text-[11px] text-legal-400">Practical review checklist & attorney prep</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
