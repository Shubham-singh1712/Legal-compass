'use client';

import React from 'react';
import { X, ShieldAlert, Scale, Gauge } from 'lucide-react';
import { RiskSensitivityMode } from '@/lib/analysisEngine';

interface RiskThresholdModalProps {
  isOpen: boolean;
  value: RiskSensitivityMode;
  onChange: (value: RiskSensitivityMode) => void;
  onClose: () => void;
}

const modes: Array<{ id: RiskSensitivityMode; label: string; description: string; icon: React.ElementType }> = [
  { id: 'strict', label: 'Strict', description: 'Elevates longer payment windows, broad IP transfers, and multi-year confidentiality terms.', icon: ShieldAlert },
  { id: 'standard', label: 'Standard', description: 'Uses the default commercial risk rubric from the document analysis engine.', icon: Scale },
  { id: 'flexible', label: 'Flexible', description: 'Keeps high attention for severe liability caps and immediate termination exposure.', icon: Gauge },
];

export function RiskThresholdModal({ isOpen, value, onChange, onClose }: RiskThresholdModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="risk-sensitivity-title">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close risk sensitivity dialog" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg surface-card p-6 sm:p-7 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Review controls</p>
            <h2 id="risk-sensitivity-title" className="text-xl font-bold text-white mt-1">Risk sensitivity</h2>
            <p className="text-xs text-legal-400 mt-1">Change prioritization without re-uploading or changing document evidence.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-legal-400 hover:text-white hover:bg-legal-800" title="Close risk sensitivity dialog"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-2">
          {modes.map(({ id, label, description, icon: Icon }) => (
            <button key={id} type="button" onClick={() => { onChange(id); onClose(); }} className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${value === id ? 'border-amber-500/70 bg-amber-500/10' : 'border-legal-800 bg-legal-950/60 hover:border-legal-700'}`}>
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${value === id ? 'text-amber-300' : 'text-legal-400'}`} />
              <span><span className="block text-sm font-semibold text-white">{label}</span><span className="block text-xs leading-relaxed text-legal-400 mt-1">{description}</span></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}