import React from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

interface UploadProgressProps {
  progress: number; // 0 to 100
  filename: string;
}

export function UploadProgress({ progress, filename }: UploadProgressProps) {
  return (
    <div className="w-full legal-card p-6 border-legal-700 bg-legal-900/90 space-y-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-accent-amber animate-pulse" />
          <span className="font-semibold text-legal-200 truncate max-w-xs">
            Uploading {filename}...
          </span>
        </div>
        <span className="font-mono font-bold text-accent-amber">{progress}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-legal-950 overflow-hidden border border-legal-800">
        <div
          className="h-full bg-gradient-to-r from-accent-amber to-amber-400 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }}
        />
      </div>

      <p className="text-[11px] text-legal-400 font-mono text-center">
        Sanitizing document buffer and verifying PDF structure...
      </p>
    </div>
  );
}
