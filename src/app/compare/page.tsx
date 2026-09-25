'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitCompareArrows } from 'lucide-react';
import { DocumentCompareView } from '@/components/compare/DocumentCompareView';
import { AnalysisResult } from '@/types/legal';

export default function ComparePage() {
  const [documents, setDocuments] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadDocuments() {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) return;
        const payload = await response.json();
        if (mounted) setDocuments(payload.data || []);
      } catch {
        // The empty state explains that uploaded documents are unavailable.
      }
    }
    loadDocuments();
    return () => { mounted = false; };
  }, []);

  return <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-7 animate-fadeIn"><div className="flex items-center gap-3 pb-5 border-b border-legal-800"><Link href="/analyze" className="p-2 rounded-lg bg-legal-900 border border-legal-800 text-legal-400 hover:text-white" title="Back to documents"><ArrowLeft className="w-4 h-4" /></Link><div><p className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Document workspace</p><h1 className="text-2xl font-bold text-white flex items-center gap-2"><GitCompareArrows className="w-6 h-6 text-amber-400" />Compare documents</h1><p className="text-xs text-legal-400 mt-1">Align clauses and surface risks, protections, and duties that changed.</p></div></div><DocumentCompareView documents={documents} /></div>;
}