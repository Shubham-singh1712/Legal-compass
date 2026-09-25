'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  ArrowLeft,
  FileText,
  Scale,
  CheckSquare,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Zap,
  MessageSquare,
  FileCheck,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { SituationSummaryStats } from '@/components/situation-map/SituationSummaryStats';
import { LegalSituationMapDiagram } from '@/components/situation-map/LegalSituationMapDiagram';
import { DocumentOverviewCard } from '@/components/situation-map/DocumentOverviewCard';
import { RightsSection } from '@/components/situation-map/RightsSection';
import { ObligationsSection } from '@/components/situation-map/ObligationsSection';
import { DeadlinesSection } from '@/components/situation-map/DeadlinesSection';
import { ReviewPrioritiesSection } from '@/components/situation-map/ReviewPrioritiesSection';
import { ActionCenter } from '@/components/action/ActionCenter';
import { EvidenceDrawer } from '@/components/situation-map/EvidenceDrawer';
import { DocumentViewerModal } from '@/components/situation-map/DocumentViewerModal';
import { RiskThresholdModal } from '@/components/action/RiskThresholdModal';
import { AnalysisResult, Finding, FindingEvidence, Clause, UserRole, UserContext, DocumentType, Jurisdiction } from '@/types/legal';
import { applyRiskSensitivity, getAnalysisForDocument, RiskSensitivityMode } from '@/lib/analysisEngine';

type ActiveTab = 'overview' | 'map' | 'rights' | 'obligations' | 'deadlines' | 'review' | 'action';

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = params?.documentId as string;

  const queryRole = searchParams?.get('role') as UserRole | null;
  const queryDocType = searchParams?.get('docType') as DocumentType | null;
  const queryJurisdiction = searchParams?.get('jurisdiction') as Jurisdiction | null;
  const queryConcerns = searchParams?.get('concerns') || undefined;

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Evidence Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerEvidence, setDrawerEvidence] = useState<FindingEvidence | null>(null);
  const [drawerInterpretation, setDrawerInterpretation] = useState<string | undefined>();
  const [drawerWhyItMatters, setDrawerWhyItMatters] = useState<string | undefined>();
  const [drawerSuggestedQuestion, setDrawerSuggestedQuestion] = useState<string | undefined>();
  const [drawerLimitation, setDrawerLimitation] = useState<string | undefined>();
  const [drawerConfidence, setDrawerConfidence] = useState<number>(0.92);

  // Document Full View Modal State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [riskSensitivity, setRiskSensitivity] = useState<RiskSensitivityMode>('standard');
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalysis() {
      const userOverride: UserContext | undefined = queryRole
        ? {
            role: queryRole,
            docType: queryDocType || undefined,
            jurisdiction: queryJurisdiction || undefined,
            specificConcerns: queryConcerns,
          }
        : undefined;

      // 1. Check local analysis engine (instant for fixtures and cached docs)
      try {
        const localData = getAnalysisForDocument(documentId, userOverride);
        if (localData && localData.document.processingStatus === 'completed') {
          if (isMounted) {
            setAnalysisData(localData);
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn('Local analysis error:', err);
      }

      // 2. Fetch from live API for uploaded documents & freshness
      try {
        const q = new URLSearchParams();
        if (queryRole) q.set('role', queryRole);
        if (queryDocType) q.set('docType', queryDocType);
        if (queryJurisdiction) q.set('jurisdiction', queryJurisdiction);
        if (queryConcerns) q.set('concerns', queryConcerns);
        const qs = q.toString() ? `?${q.toString()}` : '';

        const res = await fetch(`/api/analysis/${documentId}${qs}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setAnalysisData(json.data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback already rendered if available
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, [documentId, queryRole, queryDocType, queryJurisdiction, queryConcerns]);

  // Handler to open evidence drawer from finding object
  const handleSelectFindingEvidence = (finding: Finding) => {
    setDrawerTitle(finding.title);
    setDrawerEvidence(finding.evidence);
    setDrawerInterpretation(finding.whatItSays);
    setDrawerWhyItMatters(finding.whyItMatters);
    setDrawerSuggestedQuestion(finding.suggestedQuestion);
    setDrawerLimitation(finding.limitation);
    setDrawerConfidence(finding.confidence);
    setDrawerOpen(true);
  };

  // Handler to open evidence drawer from arbitrary clause reference
  const handleSelectGenericEvidence = (
    evidence: FindingEvidence,
    title: string,
    interpretation: string
  ) => {
    setDrawerTitle(title);
    setDrawerEvidence(evidence);
    setDrawerInterpretation(interpretation);
    setDrawerWhyItMatters('Review this clause to confirm how rights or obligations apply directly to your situation.');
    setDrawerSuggestedQuestion('Does this provision match the standard commercial expectations for this agreement?');
    setDrawerLimitation('The text represents what is written in the contract. Local statutes or labor laws may supersede specific clauses.');
    setDrawerConfidence(0.95);
    setDrawerOpen(true);
  };

  // Handler to switch role perspective interactively
  const handleRoleChange = async (newRole: UserRole) => {
    if (!analysisData) return;
    try {
      const updatedContext: UserContext = {
        ...analysisData.document.userContext,
        role: newRole,
      };
      // 1. Immediately update locally with real grounded engine
      const updated = getAnalysisForDocument(documentId, updatedContext);
      setAnalysisData(updated);

      // 2. Persist to API session store
      fetch(`/api/analysis/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContext),
      }).catch((err) => console.warn('Role update sync warning:', err));
    } catch (e) {
      console.error('Role update error:', e);
    }
  };

  // Handler when clicking a clause in the full document viewer
  const handleSelectClauseFromViewer = (clause: Clause) => {
    handleSelectGenericEvidence(
      {
        clauseIdentifier: clause.clauseNumber ? `Section ${clause.clauseNumber} — ${clause.title}` : clause.title,
        pageNumber: clause.pageNumber,
        excerpt: clause.text,
      },
      clause.title,
      clause.text
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-sm text-legal-300">Loading Legal Situation Map...</p>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Document Not Found</h2>
        <p className="text-xs text-legal-400">
          The requested document analysis could not be retrieved or has expired.
        </p>
        <Link
          href="/analyze"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-legal-950 font-bold text-xs shadow-md transition-all"
        >
          Upload New Document
        </Link>
      </div>
    );
  }

  const { document, situationMap, findings, clauses, prepBrief } = analysisData;
  const adjustedFindings = applyRiskSensitivity(findings, riskSensitivity);
  const userRole = document.userContext?.role || 'Reviewer';

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn text-left">
      {/* Top Header & Context Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-legal-800/80">
        <div className="flex items-center gap-3.5">
          <Link
            href="/analyze"
            className="p-2 rounded-xl bg-legal-900 border border-legal-800 text-legal-400 hover:text-white hover:border-legal-700 transition-colors"
            title="Upload another document"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Legal Intelligence Workspace
              </span>
              <span className="text-legal-600">•</span>
              <span className="badge-epistemic-doc">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Evidence Grounded</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              {document.filename}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/chat/${documentId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 text-xs font-semibold border border-blue-800/60 transition-all shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Legal Chat</span>
          </Link>

          <Link
            href={`/prepare/${documentId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 text-xs font-semibold border border-emerald-800/60 transition-all shadow-sm"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lawyer Prep</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDocModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-legal-900 hover:bg-legal-850 text-legal-200 text-xs font-semibold border border-legal-800 hover:border-legal-700 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">View Clauses ({clauses.length})</span>
          </button>
        </div>
      </div>

      {/* Human-Centric Position Banner */}
      <div className="surface-elevated p-5 sm:p-6 border-legal-800/80 bg-gradient-to-r from-legal-900 via-legal-850 to-legal-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Your Position
            </span>
            <span className="text-legal-600">•</span>
            <label htmlFor="perspective-select" className="text-xs text-legal-400">
              Perspective:
            </label>
            <select
              id="perspective-select"
              value={userRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-legal-950/90 border border-legal-700 text-amber-300 text-xs font-semibold rounded-lg px-2 py-0.5 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer hover:border-legal-600"
            >
              <option value="Freelancer">Freelancer</option>
              <option value="Client">Client</option>
              <option value="Employee">Employee</option>
              <option value="Employer">Employer</option>
              <option value="Tenant">Tenant</option>
              <option value="Landlord">Landlord</option>
              <option value="Vendor">Vendor</option>
              <option value="Consumer">Consumer</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Other">Other / Reviewer</option>
            </select>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            You are reviewing this as a <span className="text-amber-300 underline underline-offset-4">{userRole}</span>.
          </h2>
          <p className="text-xs text-legal-300">
            {situationMap.keyRights.length} rights • {situationMap.obligations.length} obligations • {situationMap.importantDates.length} deadlines • {findings.length} items need attention
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-legal-950 border border-legal-800 text-legal-300">
            Jurisdiction: <strong className="text-blue-300">{document.userContext?.jurisdiction || 'General'}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-legal-950 border border-legal-800 text-legal-300">
            Type: <strong className="text-white">{document.userContext?.docType || 'Agreement'}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-legal-950 border border-legal-800 text-legal-400">
            {document.pageCount} Pages
          </span>
        </div>
      </div>

      {/* 4 Summary Stats Tiles */}
      <SituationSummaryStats
        rightsCount={situationMap.keyRights.length}
        obligationsCount={situationMap.obligations.length}
        deadlinesCount={situationMap.importantDates.length}
        reviewItemsCount={findings.length}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-legal-800/80 pb-3 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-legal-800 text-white font-semibold shadow-sm border border-legal-700'
              : 'text-legal-400 hover:text-white hover:bg-legal-900/60'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'map'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
              : 'text-legal-400 hover:text-white hover:bg-legal-900/60'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Visual Situation Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'rights'
              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/60 font-semibold shadow-sm'
              : 'text-legal-400 hover:text-white hover:bg-legal-900/60'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Key Rights ({situationMap.keyRights.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('obligations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'obligations'
              ? 'bg-blue-950/80 text-blue-200 border border-blue-800/60 font-semibold shadow-sm'
              : 'text-legal-400 hover:text-white hover:bg-legal-900/60'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-blue-400" />
          <span>Obligations ({situationMap.obligations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deadlines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'deadlines'
              ? 'bg-amber-950/80 text-amber-200 border border-amber-800/60 font-semibold shadow-sm'
              : 'text-legal-400 hover:text-white hover:bg-legal-900/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Deadlines ({situationMap.importantDates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'review'
              ? 'bg-rose-950/80 text-rose-200 border border-rose-800/60 font-semibold shadow-sm'
              : 'text-legal-400 hover:text-white hover:bg-legal-900/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Review Items ({findings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('action')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'action'
              ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60 font-semibold shadow-sm'
              : 'text-legal-400 hover:text-white hover:bg-legal-900/60'
          }`}
        >
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Action Center</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DocumentOverviewCard
              overview={situationMap.overview}
              missingProtections={situationMap.missingOrUnclearProtections}
            />
            <LegalSituationMapDiagram
              rightsCount={situationMap.keyRights.length}
              obligationsCount={situationMap.obligations.length}
              risksCount={findings.length}
              deadlinesCount={situationMap.importantDates.length}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <LegalSituationMapDiagram
            rightsCount={situationMap.keyRights.length}
            obligationsCount={situationMap.obligations.length}
            risksCount={findings.length}
            deadlinesCount={situationMap.importantDates.length}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'rights' && (
          <RightsSection
            rights={situationMap.keyRights}
            onSelectEvidence={handleSelectGenericEvidence}
          />
        )}

        {activeTab === 'obligations' && (
          <ObligationsSection
            obligations={situationMap.obligations}
            onSelectEvidence={handleSelectGenericEvidence}
          />
        )}

        {activeTab === 'deadlines' && (
          <DeadlinesSection
            deadlines={situationMap.importantDates}
            onSelectEvidence={handleSelectGenericEvidence}
          />
        )}

        {activeTab === 'review' && (
          <ReviewPrioritiesSection
            findings={adjustedFindings}
            onSelectEvidence={handleSelectFindingEvidence}
            sensitivity={riskSensitivity}
            onOpenSensitivity={() => setIsRiskModalOpen(true)}
          />
        )}

        {activeTab === 'action' && (
          <ActionCenter
            deadlines={situationMap.importantDates}
            actionItems={prepBrief.actionChecklist}
            onAskLawyerClick={() => router.push(`/prepare/${documentId}`)}
          />
        )}
      </div>

      {/* Interactive Evidence Slide-over Drawer */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        evidence={drawerEvidence}
        interpretation={drawerInterpretation}
        whyItMatters={drawerWhyItMatters}
        suggestedQuestion={drawerSuggestedQuestion}
        limitation={drawerLimitation}
        confidence={drawerConfidence}
      />

      {/* Full Document Reader Modal */}
      <DocumentViewerModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        filename={document.filename}
        clauses={clauses}
        onSelectClause={handleSelectClauseFromViewer}
      />

      <RiskThresholdModal
        isOpen={isRiskModalOpen}
        value={riskSensitivity}
        onChange={setRiskSensitivity}
        onClose={() => setIsRiskModalOpen(false)}
      />
    </div>
  );
}
