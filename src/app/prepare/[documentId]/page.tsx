'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileCheck,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  HelpCircle,
  FileText,
  User,
  Scale,
  Sparkles,
  CheckSquare,
  Briefcase,
} from 'lucide-react';
import { AnalysisResult } from '@/types/legal';
import { getAnalysisForDocument } from '@/lib/analysisEngine';
import { getLegalAuthorityContext } from '@/lib/authorityEngine';

export default function LawyerPrepPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.documentId as string;

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Load local data immediately — prevents blank/loading state
    try {
      const localData = getAnalysisForDocument(documentId);
      if (isMounted) setAnalysisData(localData);
    } catch (err) {
      console.error('Local analysis load failed for prep brief:', err);
    }

    // 2. Silently refresh from API if uploaded document exists
    async function refreshFromApi() {
      try {
        const res = await fetch(`/api/analysis/${documentId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setAnalysisData(json.data);
          }
        }
      } catch (e) {
        // Silent — local data already shown
      }
    }
    refreshFromApi();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBrief = () => {
    if (!analysisData) return;
    const { document, prepBrief, situationMap } = analysisData;

    const briefText = `LEGAL COMPASS — PROFESSIONAL CONSULTATION BRIEF
=====================================================
Document: ${document.filename}
Client Role: ${document.userContext.role}
Jurisdiction: ${document.userContext.jurisdiction || 'General'}
Generated: ${new Date(prepBrief.generatedAt).toLocaleDateString()}

1. EXECUTIVE SITUATION SUMMARY
-----------------------------------------------------
${prepBrief.documentSummary}

2. KEY RISKS & PRIORITY REVIEW ITEMS
-----------------------------------------------------
${prepBrief.topConcerns.map(c => `• [${c.priority.toUpperCase()}] ${c.issue}\n  Why it matters: ${c.whyItMatters}\n  Evidence Citation: ${c.evidenceCitation}`).join('\n\n')}

3. CRITICAL DATES & DEADLINES
-----------------------------------------------------
${situationMap.importantDates.map(d => `• ${d.event}: ${d.dateOrPeriod} (Ref: ${d.sourceClause}, Page ${d.page})`).join('\n')}

4. STRATEGIC QUESTIONS FOR COUNSEL
-----------------------------------------------------
${prepBrief.questionsForLawyer.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

5. DOCUMENTS & EVIDENCE TO BRING
-----------------------------------------------------
${prepBrief.documentsAndProofToBring.map(d => `[ ] ${d}`).join('\n')}

-----------------------------------------------------
Notice: This brief is an informational consultation tool prepared by Legal Compass for client consultation preparation. It does not constitute formal legal advice.
`;

    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!analysisData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Document Brief Not Found</h2>
        <Link href="/analyze" className="px-5 py-2.5 rounded-xl bg-brand-gold text-legal-950 font-bold text-sm">
          Upload New Document
        </Link>
      </div>
    );
  }

  const { document, situationMap, findings, prepBrief } = analysisData;

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Action Bar (Print / Export) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-legal-800 print:hidden">
        <div className="flex items-center gap-3.5">
          <Link
            href={`/analysis/${documentId}`}
            className="p-2.5 rounded-xl bg-legal-900 border border-legal-800 text-legal-400 hover:text-white hover:bg-legal-850 transition-colors"
            title="Back to Situation Map"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-gold">
                Consultation Ready Deliverable
              </span>
              <span className="badge-epistemic-doc hidden sm:inline-flex">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evidence Grounded</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight mt-1">
              Legal Review Brief
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyBrief}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-legal-900 border border-legal-750 text-legal-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-gold" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Plain Text Brief'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-primary"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Consultation Brief Document Shell */}
      <div className="surface-card p-6 sm:p-10 rounded-2xl border border-legal-800/90 shadow-2xl space-y-8 text-left print:bg-white print:text-black print:p-0 print:shadow-none print:border-none">
        {/* Header Metadata */}
        <div className="pb-6 border-b border-legal-800 print:border-gray-300 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-brand-gold print:text-amber-800 font-medium">
                <Briefcase className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider">Legal Review Brief</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white print:text-black mt-1">
                {document.filename}
              </h2>
              <p className="text-xs text-legal-400 print:text-gray-600 mt-0.5">
                Prepared for consultation with {document.userContext.jurisdiction || 'jurisdiction'} legal counsel
              </p>
            </div>
            <div className="text-xs font-mono text-legal-400 print:text-gray-500 sm:text-right">
              <div>Generated: {new Date(prepBrief.generatedAt).toLocaleDateString()}</div>
              <div className="text-[11px] text-emerald-400 print:text-emerald-700">Grounded against document text</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-legal-950/80 border border-legal-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-legal-400 print:text-gray-500 block text-xs uppercase font-medium">Target Document</span>
              <strong className="text-white print:text-black text-sm font-serif">{document.filename}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-legal-950/80 border border-legal-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-legal-400 print:text-gray-500 block text-xs uppercase font-medium">Your Position</span>
              <strong className="text-brand-gold print:text-amber-800 text-sm font-serif">{document.userContext.role}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-legal-950/80 border border-legal-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-legal-400 print:text-gray-500 block text-xs uppercase font-medium">Governing Law</span>
              <strong className="text-blue-300 print:text-blue-800 text-sm font-serif">{document.userContext.jurisdiction || 'General'}</strong>
            </div>
          </div>
        </div>

        {/* 1. Situation Summary */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-gold print:text-amber-800 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>1. Executive Situation Summary</span>
          </h3>
          <div className="p-4 rounded-xl bg-legal-950/60 border border-legal-800/80 print:bg-gray-50 print:border-gray-300 text-sm text-legal-200 print:text-gray-800 leading-relaxed font-normal">
            {prepBrief.documentSummary}
          </div>
        </div>

        {/* 2. Top Review Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-gold print:text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 print:text-rose-700" />
            <span>2. Key Risks & Priority Review Items</span>
          </h3>

          <div className="space-y-3">
            {prepBrief.topConcerns.map((concern, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-legal-950/80 border border-legal-800 print:bg-gray-50 print:border-gray-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white print:text-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {concern.issue}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 print:bg-gray-200 print:text-gray-800 font-semibold">
                    {concern.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-legal-300 print:text-gray-700 leading-relaxed">
                  {concern.whyItMatters}
                </p>

                <div className="text-xs font-mono text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
                  <span className="text-legal-400 font-normal">Citation:</span>
                  <span>{concern.evidenceCitation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Important Timelines */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-gold print:text-amber-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>3. Critical Dates & Deadlines</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-legal-800 print:border-gray-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-legal-950 text-legal-400 print:bg-gray-100 print:text-gray-700 font-medium uppercase border-b border-legal-800 print:border-gray-300">
                <tr>
                  <th className="p-3.5">Event / Trigger</th>
                  <th className="p-3.5">Required Window</th>
                  <th className="p-3.5">Source Clause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-legal-850 print:divide-gray-200">
                {situationMap.importantDates.map((item, idx) => (
                  <tr key={idx} className="hover:bg-legal-900/50 print:hover:bg-transparent">
                    <td className="p-3.5 font-medium text-white print:text-black">{item.event}</td>
                    <td className="p-3.5 font-mono text-amber-300 print:text-amber-800">{item.dateOrPeriod}</td>
                    <td className="p-3.5 font-mono text-legal-400 print:text-gray-600">{item.sourceClause} (P.{item.page})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Strategic Questions for Your Lawyer */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-gold print:text-amber-800 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>4. Recommended Questions for Your Lawyer</span>
          </h3>

          <div className="space-y-2.5">
            {prepBrief.questionsForLawyer.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-legal-950/80 border border-legal-800 print:bg-gray-50 print:border-gray-300 text-sm text-white print:text-black font-serif italic flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-gold/15 text-brand-gold print:bg-gray-200 print:text-black flex items-center justify-center text-xs font-bold font-sans shrink-0 not-italic mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">"{q}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. What to Bring to Consultation */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-gold print:text-amber-800 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>5. Documents & Evidence To Bring</span>
          </h3>

          <div className="p-4 rounded-xl bg-legal-950/60 border border-legal-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            {prepBrief.documentsAndProofToBring.map((docItem, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-legal-200 print:text-gray-800">
                <div className="w-4 h-4 rounded border border-legal-700 bg-legal-900 print:border-gray-400 flex items-center justify-center text-[10px] shrink-0" />
                <span>{docItem}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Separate Document Facts vs User Facts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-legal-800 print:border-gray-300 text-xs">
          <div className="p-4 rounded-xl bg-legal-950/80 border border-legal-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            <span className="font-semibold uppercase tracking-wider text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Extracted Document Facts</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-legal-300 print:text-gray-700">
              <li>{situationMap.overview.documentPurpose}</li>
              <li>Governing Law: {situationMap.overview.governingLaw}</li>
              <li>{situationMap.overview.termLength}</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-legal-950/80 border border-legal-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            <span className="font-semibold uppercase tracking-wider text-amber-300 print:text-amber-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>User-Provided Position Facts</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-legal-300 print:text-gray-700">
              <li>Client Role: {document.userContext.role}</li>
              <li>Stated Jurisdiction: {document.userContext.jurisdiction || 'General'}</li>
              <li>Goal: Negotiation Preparation & Risk Mitigation</li>
            </ul>
          </div>
        </div>

        {/* Footer Legal Disclaimer */}
        <div className="pt-4 border-t border-legal-800 print:border-gray-300 text-xs text-legal-400 print:text-gray-600 leading-relaxed text-center">
          <strong className="text-legal-300 print:text-black">Notice: </strong>
          This document brief is an informational consultation instrument generated by Legal Compass. It is designed to assist you in preparing for a consultation with a qualified attorney and does not constitute formal legal advice or an attorney-client relationship.
        </div>
      </div>
    </div>
  );
}
