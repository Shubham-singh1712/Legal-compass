'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, AlertCircle, FileText } from 'lucide-react';

interface DocumentDropzoneProps {
  onFileSelected: (file: File) => void;
  maxSizeBytes?: number; // default 15MB
}

export function DocumentDropzone({
  onFileSelected,
  maxSizeBytes = 15 * 1024 * 1024,
}: DocumentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxMb = Math.round(maxSizeBytes / (1024 * 1024));

  const validateAndProcessFile = (file: File) => {
    setError(null);

    // 1. Check extension & MIME
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Unsupported file format. Please upload a valid PDF document (.pdf).');
      return;
    }

    // 2. Check size
    if (file.size > maxSizeBytes) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${maxMb}MB.`);
      return;
    }

    if (file.size === 0) {
      setError('The selected file appears to be empty. Please choose a valid PDF document.');
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcessFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndProcessFile(selectedFile);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01] shadow-subtle-glow'
            : 'border-legal-750/80 bg-legal-900/60 hover:border-amber-500/40 hover:bg-legal-900/90 hover:shadow-card-elevated'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF Document"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto pointer-events-none">
          {/* Visual Icon with Glow */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              isDragging
                ? 'bg-amber-400 text-legal-950 shadow-subtle-glow'
                : 'bg-legal-850 border border-legal-750 text-amber-400 shadow-md'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isDragging ? 'Drop your PDF here' : 'Upload your agreement'}
            </h3>
            <p className="text-xs sm:text-sm text-legal-300">
              Drag and drop your PDF here, or click to browse files
            </p>
          </div>

          {/* Action button mock */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-legal-950 font-semibold text-xs transition-all shadow-sm">
              <FileText className="w-4 h-4" />
              <span>Choose a PDF Document</span>
            </span>
          </div>

          {/* Limits note */}
          <div className="text-[11px] text-legal-400 pt-1 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-legal-950 border border-legal-800">
              PDF format
            </span>
            <span>•</span>
            <span>Up to {maxMb} MB</span>
            <span>•</span>
            <span>Local & confidential</span>
          </div>
        </div>
      </div>

      {/* Validation Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-left">
            <div className="font-semibold text-rose-100">Upload Validation</div>
            <p className="text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

    </div>
  );
}
