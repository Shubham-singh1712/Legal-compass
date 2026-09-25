import React from 'react';
import { Jurisdiction } from '@/types/legal';
import { Globe, Info, CheckCircle2 } from 'lucide-react';

interface JurisdictionSelectorProps {
  selectedJurisdiction: Jurisdiction;
  onSelectJurisdiction: (jurisdiction: Jurisdiction) => void;
  customRegion?: string;
  onCustomRegionChange?: (region: string) => void;
}

export function JurisdictionSelector({
  selectedJurisdiction,
  onSelectJurisdiction,
}: JurisdictionSelectorProps) {
  const commonJurisdictions: Array<{
    value: Jurisdiction;
    label: string;
    sublabel: string;
  }> = [
    {
      value: 'US - California',
      label: 'United States — California',
      sublabel: 'Strict non-compete bans, strong employee privacy & wage compliance standards.',
    },
    {
      value: 'US - New York',
      label: 'United States — New York',
      sublabel: 'Commercial hub, strict freelance payment protections & statutory wage notice rules.',
    },
    {
      value: 'US - Delaware',
      label: 'United States — Delaware / Corporate',
      sublabel: 'Standard baseline for venture capital, technology startups & commercial contracts.',
    },
    {
      value: 'United Kingdom',
      label: 'United Kingdom (England & Wales)',
      sublabel: 'Common law doctrine, UK statutory employee rights & GDPR compliance framework.',
    },
    {
      value: 'European Union',
      label: 'European Union / General Civil',
      sublabel: 'High consumer protections, worker statutory baselines & strict GDPR privacy.',
    },
    {
      value: 'India',
      label: 'India',
      sublabel: 'Indian Contract Act 1872, Section 27 trade restraint principles & statutory notice.',
    },
    {
      value: 'General / Unknown',
      label: 'General / Unspecified Jurisdiction',
      sublabel: 'Evaluate contract provisions on universal plain-language commercial terms.',
    },
  ];

  return (
    <div className="w-full space-y-5">
      <div className="text-left space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Where does this document apply?</h3>
        <p className="text-xs sm:text-sm text-legal-300">
          Select the governing law or applicable region if specified in the agreement.
        </p>
      </div>

      {/* Jurisdictions list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[320px] overflow-y-auto pr-1">
        {commonJurisdictions.map((item) => {
          const isSelected = selectedJurisdiction === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelectJurisdiction(item.value)}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/10 shadow-subtle-glow -translate-y-0.5'
                  : 'border-legal-800/80 bg-legal-900/60 hover:bg-legal-850 hover:border-legal-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 text-legal-950 font-bold shadow-sm'
                    : 'bg-legal-850 text-legal-300 border border-legal-750'
                }`}
              >
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                    {item.label}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
                <p className="text-xs text-legal-400 mt-1 leading-relaxed line-clamp-2">
                  {item.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Why we ask note */}
      <div className="p-4 rounded-2xl bg-legal-900/90 border border-legal-800/80 flex items-start gap-3 text-xs text-legal-300 text-left">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5">
          <strong className="text-white font-medium">Why we ask:</strong>
          <p className="text-legal-400 text-xs leading-relaxed">
            Statutory enforceability (such as post-employment restrictions, security deposit return deadlines, or mandatory notice) varies across jurisdictions. Specifying jurisdiction helps identify relevant questions for your attorney consultation.
          </p>
        </div>
      </div>
    </div>
  );
}
