import React from 'react';
import { DocumentType } from '@/types/legal';
import {
  FileBadge,
  Home,
  Briefcase,
  FileLock,
  Building,
  ScrollText,
  FileQuestion,
  CheckCircle2,
} from 'lucide-react';

interface DocumentTypeSelectorProps {
  selectedType?: DocumentType | 'Not Sure';
  onSelectType: (docType: DocumentType | 'Not Sure') => void;
}

export function DocumentTypeSelector({
  selectedType,
  onSelectType,
}: DocumentTypeSelectorProps) {
  const docTypes: Array<{
    type: DocumentType | 'Not Sure';
    title: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      type: 'Employment Agreement',
      title: 'Employment Agreement',
      description: 'Understand compensation, notice periods, non-competes, IP assignments & benefits.',
      icon: FileBadge,
    },
    {
      type: 'Residential Rental Agreement',
      title: 'Rental / Lease Agreement',
      description: 'Review rent terms, security deposits, maintenance duties, renewal rules & tenant obligations.',
      icon: Home,
    },
    {
      type: 'Freelance / Services Agreement',
      title: 'Freelance / Contractor Contract',
      description: 'Check payment milestones, deliverable scope, IP ownership transfer & liability caps.',
      icon: Briefcase,
    },
    {
      type: 'Non-Disclosure Agreement (NDA)',
      title: 'NDA / Confidentiality',
      description: 'Review mutual or unilateral obligations, definition of confidential data & exceptions.',
      icon: FileLock,
    },
    {
      type: 'Commercial Contract',
      title: 'Commercial / Vendor Agreement',
      description: 'Review B2B supply agreements, software licenses (SaaS), service level guarantees & indemnities.',
      icon: Building,
    },
    {
      type: 'Terms & Policy',
      title: 'Terms of Service / Privacy Policy',
      description: 'Understand platform user obligations, data privacy boundaries, auto-renewals & dispute clauses.',
      icon: ScrollText,
    },
    {
      type: 'Not Sure',
      title: 'Not Sure / Auto-Detect',
      description: 'Let Legal Compass detect the document structure and clause types automatically.',
      icon: FileQuestion,
    },
  ];

  return (
    <div className="w-full space-y-5">
      <div className="text-left space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">What type of document is this?</h3>
        <p className="text-xs sm:text-sm text-legal-300">
          Selecting a type optimizes clause identification benchmarks. You can also pick "Not Sure".
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[390px] overflow-y-auto pr-1">
        {docTypes.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectType(item.type)}
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
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                    {item.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
                <p className="text-xs text-legal-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
