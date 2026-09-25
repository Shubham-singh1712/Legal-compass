import React from 'react';
import { FileText, CheckCircle2, X } from 'lucide-react';

interface FileCardProps {
  filename: string;
  fileSizeBytes: number;
  pageCount?: number;
  onRemove: () => void;
}

export function FileCard({
  filename,
  fileSizeBytes,
  pageCount = 1,
  onRemove,
}: FileCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full surface-card p-5 sm:p-6 border-legal-800/90 bg-legal-900/90 shadow-card-elevated text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon & Details */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-subtle-glow">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white truncate max-w-[260px] sm:max-w-md">
                {filename}
              </span>
              <span className="badge-epistemic-doc shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready to analyze</span>
              </span>
            </div>
            <div className="text-xs text-legal-400 flex items-center gap-2.5">
              <span>{pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</span>
              <span>•</span>
              <span>{formatSize(fileSizeBytes)}</span>
              <span>•</span>
              <span className="text-amber-400/90 font-medium">PDF Verified</span>
            </div>
          </div>
        </div>

        {/* Right: Remove / Change action */}
        <button
          type="button"
          onClick={onRemove}
          className="self-end sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-legal-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all"
          title="Remove or replace document"
        >
          <X className="w-4 h-4" />
          <span>Change file</span>
        </button>
      </div>
    </div>
  );
}
