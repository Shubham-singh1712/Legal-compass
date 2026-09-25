'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Eye, Compass, ShieldCheck, ArrowRight, Lock, Check } from 'lucide-react';

export function WorkflowVisualization() {
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const stages = [
    {
      number: '01',
      title: 'Understand',
      description: 'Extract parties, rights, obligations & notice deadlines',
      icon: Layers,
      accentColor: 'text-emerald-400',
      activeBorder: 'border-emerald-500/40 bg-emerald-950/20 shadow-emerald-glow',
    },
    {
      number: '02',
      title: 'Verify',
      description: 'Trace every conclusion to exact document evidence and page offsets',
      icon: Eye,
      accentColor: 'text-blue-400',
      activeBorder: 'border-blue-500/40 bg-blue-950/20 shadow-blue-glow',
    },
    {
      number: '03',
      title: 'Assess',
      description: 'Prioritize practical risks, notice windows & asymmetric liabilities',
      icon: Compass,
      accentColor: 'text-amber-400',
      activeBorder: 'border-amber-500/40 bg-amber-950/20 shadow-subtle-glow',
    },
    {
      number: '04',
      title: 'Act',
      description: 'Prepare focused attorney questions and actionable next steps',
      icon: ShieldCheck,
      accentColor: 'text-rose-400',
      activeBorder: 'border-rose-500/40 bg-rose-950/20',
    },
  ];

  // Subtle cyclic highlight progression
  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightedIndex((prev) => (prev + 1) % stages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="w-full surface-card p-6 border-legal-800/80 bg-legal-900/90 relative overflow-hidden text-left shadow-2xl">
      {/* Subtle ambient light */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-legal-800/80 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            EVIDENCE-GROUNDED PIPELINE
          </span>
        </div>
        <span className="text-[10px] font-medium text-legal-400 px-2.5 py-0.5 rounded-full bg-legal-950 border border-legal-800">
          Deterministic Traceability
        </span>
      </div>

      {/* 4 Workflow Stages Preview */}
      <div className="space-y-2.5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isHighlighted = highlightedIndex === idx;

          return (
            <div
              key={stage.number}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                isHighlighted
                  ? `${stage.activeBorder} -translate-y-0.5`
                  : 'bg-legal-950/40 border-legal-800/70 hover:border-legal-700 hover:bg-legal-950/70'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Number & Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isHighlighted ? 'bg-legal-850' : 'bg-legal-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${stage.accentColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-legal-400">
                      {stage.number}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {stage.title}
                    </h4>
                  </div>
                  <p className="text-xs text-legal-300 mt-0.5 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div
                  className={`shrink-0 transition-all duration-200 ${
                    isHighlighted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
                  }`}
                >
                  <ArrowRight className={`w-4 h-4 ${stage.accentColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Trust summary */}
      <div className="mt-5 pt-4 border-t border-legal-800/80 flex items-center justify-between text-[11px] text-legal-400">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-legal-500" />
          <span>Zero model training on uploaded files</span>
        </span>
        <span className="text-amber-400 font-medium">100% Clause-Linked</span>
      </div>
    </div>
  );
}
