import React from 'react';
import { AlertOctagon, RotateCcw, FileQuestion } from 'lucide-react';

interface UploadErrorProps {
  message: string;
  onRetry: () => void;
  onSelectAnother: () => void;
}

export function UploadError({ message, onRetry, onSelectAnother }: UploadErrorProps) {
  return (
    <div className="w-full legal-card p-6 border-rose-800 bg-rose-950/40 space-y-4 text-left">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-700 flex items-center justify-center text-rose-300 shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-bold text-rose-100">Upload / Validation Error</h4>
          <p className="text-xs text-rose-200/90 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
        <button
          type="button"
          onClick={onSelectAnother}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-legal-900 hover:bg-legal-800 text-legal-300 text-xs font-medium border border-legal-700 transition-colors"
        >
          <FileQuestion className="w-3.5 h-3.5" />
          <span>Choose Another File</span>
        </button>
      </div>
    </div>
  );
}
