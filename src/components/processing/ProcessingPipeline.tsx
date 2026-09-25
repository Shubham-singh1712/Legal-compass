'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingStep, StepState } from './ProcessingStep';
import { Shield, Sparkles, AlertCircle, RefreshCw, Compass, FileSearch } from 'lucide-react';

export type PipelineStage =
  | 'uploading'
  | 'extracting'
  | 'segmenting'
  | 'mapping'
  | 'analyzing'
  | 'completed'
  | 'error';

interface ProcessingPipelineProps {
  filename: string;
  stage: PipelineStage;
  error?: string | null;
  onRetry?: () => void;
  onCompleted?: () => void;
}

export function ProcessingPipeline({
  filename,
  stage,
  error,
  onRetry,
  onCompleted,
}: ProcessingPipelineProps) {
  const getStepState = (stepIndex: number): StepState => {
    if (stage === 'error') {
      return 'error';
    }

    const stageOrder: PipelineStage[] = [
      'uploading',
      'extracting',
      'segmenting',
      'mapping',
      'analyzing',
      'completed',
    ];

    const currentStageIndex = stageOrder.indexOf(stage);

    if (currentStageIndex > stepIndex) return 'completed';
    if (currentStageIndex === stepIndex) return 'running';
    return 'pending';
  };

  const progressiveMessages: Record<PipelineStage, string> = {
    uploading: 'Reading the agreement & establishing isolated session...',
    extracting: 'Extracting text structure and page boundaries...',
    segmenting: 'Identifying sections and mapping clauses...',
    mapping: 'Finding rights, obligations & notice deadlines...',
    analyzing: 'Evaluating risk exposure and preparing review priorities...',
    completed: 'Preparing your Legal Situation Map...',
    error: 'Analysis interrupted.',
  };

  const steps = [
    {
      number: 1,
      title: 'Reading Document',
      description: 'Inspecting document layout, structure, and isolated privacy session.',
      detail: 'Isolated Session',
    },
    {
      number: 2,
      title: 'Extracting Sections & Pages',
      description: 'Parsing multi-page document layout while preserving page offsets.',
      detail: 'Page Mapping',
    },
    {
      number: 3,
      title: 'Mapping Clauses',
      description: 'Identifying contractual provisions with verifiable source anchors.',
      detail: 'Clause Segmentation',
    },
    {
      number: 4,
      title: 'Finding Rights & Obligations',
      description: 'Categorizing affirmative duties, notice periods, and commercial terms.',
      detail: 'Situation Map',
    },
    {
      number: 5,
      title: 'Evaluating Review Priorities',
      description: 'Highlighting potential liabilities, asymmetric terms, and ambiguous clauses.',
      detail: 'Risk Radar',
    },
    {
      number: 6,
      title: 'Preparing Review Priorities',
      description: 'Connecting evidence citations and strategic consultation questions.',
      detail: 'Evidence Bound',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">
      {/* Animated Compass & Intelligence Header */}
      <div className="surface-card p-6 sm:p-8 text-center space-y-4 border-legal-800/90 bg-legal-900/90 shadow-card-elevated relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Compass Symbol */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-subtle-glow">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Analyzing your document</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {progressiveMessages[stage] || 'Analyzing your document...'}
          </h3>
          <p className="text-xs text-legal-400 truncate max-w-md mx-auto">
            {filename}
          </p>
        </div>
      </div>

      {/* Error state if pipeline crashed */}
      {stage === 'error' && (
        <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-800 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-100">Processing Failed</h4>
              <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                {error || 'We could not finish processing this document. Please verify the PDF format and try again.'}
              </p>
            </div>
          </div>
          {onRetry && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Processing</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6 Steps List */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => (
          <ProcessingStep
            key={step.number}
            number={step.number}
            title={step.title}
            description={step.description}
            state={getStepState(idx)}
            detail={step.detail}
          />
        ))}
      </div>

      {/* Footer Security Note */}
      <div className="p-4 rounded-2xl bg-legal-900/60 border border-legal-800/80 flex items-center justify-between text-xs text-legal-400">
        <span className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Isolated data container • Strictly zero model training</span>
        </span>
        <span className="text-amber-400/90 font-medium hidden sm:inline">
          Evidence Traceability
        </span>
      </div>
    </div>
  );
}
