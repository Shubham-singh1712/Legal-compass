import React from 'react';
import { UserCheck, FileCode2, Globe, Check } from 'lucide-react';

interface ContextProgressProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
}

export function ContextProgress({ currentStep, onStepClick }: ContextProgressProps) {
  const steps = [
    { number: 1 as const, title: 'Your Role', icon: UserCheck },
    { number: 2 as const, title: 'Document Type', icon: FileCode2 },
    { number: 3 as const, title: 'Jurisdiction', icon: Globe },
  ];

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex items-center justify-between relative px-4">
        {/* Connecting Line */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-legal-800 -z-0" />
        <div
          className="absolute left-10 top-1/2 -translate-y-1/2 h-0.5 bg-amber-400 transition-all duration-500 -z-0"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
        />

        {steps.map((step) => {
          const isDone = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isDone && !isCurrent}
              onClick={() => isDone && onStepClick?.(step.number)}
              className={`flex flex-col items-center gap-2 group z-10 ${
                isDone ? 'cursor-pointer' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-emerald-glow'
                    : isCurrent
                    ? 'bg-amber-400 text-legal-950 ring-4 ring-amber-400/20 shadow-subtle-glow scale-105'
                    : 'bg-legal-900 border border-legal-750 text-legal-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : <span>0{step.number}</span>}
              </div>
              <span
                className={`text-xs font-medium tracking-tight transition-colors ${
                  isCurrent ? 'text-white font-semibold' : isDone ? 'text-legal-300' : 'text-legal-500'
                }`}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
