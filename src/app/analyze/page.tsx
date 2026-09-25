'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { DocumentDropzone } from '@/components/upload/DocumentDropzone';
import { FileCard } from '@/components/upload/FileCard';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { UploadError } from '@/components/upload/UploadError';
import { ContextProgress } from '@/components/context/ContextProgress';
import { RoleSelector } from '@/components/context/RoleSelector';
import { DocumentTypeSelector } from '@/components/context/DocumentTypeSelector';
import { JurisdictionSelector } from '@/components/context/JurisdictionSelector';
import { ProcessingPipeline, PipelineStage } from '@/components/processing/ProcessingPipeline';
import { CompletionCard } from '@/components/processing/CompletionCard';
import { UserContext, UserRole, DocumentType, Jurisdiction } from '@/types/legal';

type Step = 'upload' | 'context' | 'processing' | 'completed';

export default function AnalyzePage() {
  const router = useRouter();

  // Document & Upload State
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);
  const [documentId, setDocumentId] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Context State (3-step progressive)
  const [contextStep, setContextStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>('Employee');
  const [docType, setDocType] = useState<DocumentType | 'Not Sure'>('Employment Agreement');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('US - California');
  const [customRegion, setCustomRegion] = useState<string>('');

  // Processing State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('uploading');
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // 1. Handle File Upload (Real File)
  const handleFileSelected = async (selectedFile: File) => {
    setUploadError(null);
    setFile(selectedFile);
    setFilename(selectedFile.name);
    setFileSizeBytes(selectedFile.size);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress(45);
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setUploadProgress(100);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to validate uploaded document.');
      }

      setDocumentId(data.documentId);
      setFilename(data.filename);
      setPageCount(data.pageCount || 1);
      if (data.inferredRole) {
        setRole(data.inferredRole as UserRole);
      }
      if (data.detectedType) {
        setDocType(data.detectedType as DocumentType);
      }
      if (data.jurisdiction) {
        setJurisdiction(data.jurisdiction as Jurisdiction);
      }
      setIsUploading(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsUploading(false);
      setUploadError(err.message || 'Could not upload or validate PDF file.');
    }
  };

  // 3. Reset / Remove File
  const handleResetDocument = () => {
    setFile(null);
    setFilename('');
    setFileSizeBytes(0);
    setDocumentId('');
    setUploadError(null);
    setUploadProgress(0);
    setStep('upload');
    setContextStep(1);
  };

  // 4. Start Real/Visual Processing Pipeline
  const startProcessing = async () => {
    setStep('processing');
    setPipelineStage('uploading');
    setPipelineError(null);

    if (!documentId) {
      setPipelineStage('error');
      setPipelineError('No uploaded document is available for processing. Please upload the PDF again.');
      return;
    }

    try {
      const response = await fetch(`/api/analysis/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userContext),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'The document context could not be saved.');
      }
    } catch (error) {
      setPipelineStage('error');
      setPipelineError(error instanceof Error ? error.message : 'The document could not be prepared for analysis.');
      return;
    }

    const stages: PipelineStage[] = [
      'uploading',
      'extracting',
      'segmenting',
      'mapping',
      'analyzing',
      'completed',
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 1;
      if (currentIdx < stages.length) {
        setPipelineStage(stages[currentIdx]);
      } else {
        clearInterval(interval);
        setTimeout(() => setStep('completed'), 500);
      }
    }, 600);
  };

  const userContext: UserContext = {
    role,
    docType: docType === 'Not Sure' ? undefined : docType,
    jurisdiction,
    specificConcerns: customRegion,
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-6 border-b border-legal-800/80 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-legal-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>

        {/* Golden path badge */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`px-2.5 py-1 rounded-full transition-all ${step === 'upload' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-legal-500'}`}>
            01 Upload
          </span>
          <span className="text-legal-600 text-[10px]">→</span>
          <span className={`px-2.5 py-1 rounded-full transition-all ${step === 'context' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-legal-500'}`}>
            02 Context
          </span>
          <span className="text-legal-600 text-[10px]">→</span>
          <span className={`px-2.5 py-1 rounded-full transition-all ${step === 'processing' || step === 'completed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-legal-500'}`}>
            03 Intelligence
          </span>
        </div>
      </div>

      {/* STEP 1: UPLOAD SCREEN */}
      {step === 'upload' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start an intelligent review.
            </h1>
            <p className="text-sm text-legal-300 leading-relaxed">
              Upload any legal document to uncover key rights, obligations, hidden risks, and prepare for legal review.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {isUploading ? (
              <UploadProgress progress={uploadProgress} filename={filename} />
            ) : uploadError ? (
              <UploadError
                message={uploadError}
                onRetry={() => file && handleFileSelected(file)}
                onSelectAnother={handleResetDocument}
              />
            ) : filename ? (
              <div className="space-y-6 animate-fadeIn">
                <FileCard
                  filename={filename}
                  fileSizeBytes={fileSizeBytes}
                  pageCount={pageCount}
                  onRemove={handleResetDocument}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep('context')}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-legal-950 font-bold text-sm transition-all shadow-subtle-glow hover:shadow-amber-500/25 active:scale-95"
                  >
                    <span>Continue to Your Context</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <DocumentDropzone
                onFileSelected={handleFileSelected}
              />
            )}
          </div>
        </div>
      )}

      {/* STEP 2: USER CONTEXT COLLECTION */}
      {step === 'context' && (
        <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Review from your perspective.
            </h1>
            <p className="text-sm text-legal-300">
              This helps Legal Compass highlight what matters directly for your role and situation.
            </p>
          </div>

          {/* Stepper Progress */}
          <ContextProgress
            currentStep={contextStep}
            onStepClick={(s) => setContextStep(s)}
          />

          {/* Context sub-steps */}
          <div className="surface-card p-6 sm:p-8 border-legal-800/90 bg-legal-900/90 shadow-card-elevated">
            {contextStep === 1 && (
              <RoleSelector
                selectedRole={role}
                onSelectRole={(r) => {
                  setRole(r);
                }}
              />
            )}

            {contextStep === 2 && (
              <DocumentTypeSelector
                selectedType={docType}
                onSelectType={(t) => {
                  setDocType(t);
                }}
              />
            )}

            {contextStep === 3 && (
              <JurisdictionSelector
                selectedJurisdiction={jurisdiction}
                onSelectJurisdiction={(j) => {
                  setJurisdiction(j);
                }}
                customRegion={customRegion}
                onCustomRegionChange={setCustomRegion}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-legal-800/80">
              <button
                type="button"
                onClick={() => {
                  if (contextStep === 1) {
                    setStep('upload');
                  } else {
                    setContextStep((prev) => (prev - 1) as 1 | 2 | 3);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-legal-300 hover:text-white hover:bg-legal-800/80 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {contextStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setContextStep((prev) => (prev + 1) as 1 | 2 | 3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-legal-950 text-xs font-bold transition-all shadow-sm"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startProcessing}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-legal-950 text-xs font-bold transition-all shadow-subtle-glow hover:shadow-amber-500/25 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Begin Legal Intelligence Analysis</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PROCESSING PIPELINE */}
      {step === 'processing' && (
        <div className="animate-fadeIn">
          <ProcessingPipeline
            filename={filename}
            stage={pipelineStage}
            error={pipelineError}
            onRetry={startProcessing}
          />
        </div>
      )}

      {/* STEP 4: READY FOR ANALYSIS STATE */}
      {step === 'completed' && (
        <div className="animate-fadeIn">
          <CompletionCard
            filename={filename}
            userContext={userContext}
            onViewAnalysis={() => {
              const query = new URLSearchParams();
              if (role) query.set('role', role);
              if (docType && docType !== 'Not Sure') query.set('docType', docType);
              if (jurisdiction) query.set('jurisdiction', jurisdiction);
              if (customRegion) query.set('concerns', customRegion);
              const qs = query.toString() ? `?${query.toString()}` : '';
              if (documentId) router.push(`/analysis/${documentId}${qs}`);
            }}
            onReset={handleResetDocument}
          />
        </div>
      )}
    </div>
  );
}
