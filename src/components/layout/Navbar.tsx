'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShieldCheck, Map, MessageSquare, FileCheck, Plus, Sparkles, GitCompareArrows } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const pathname = usePathname();

  // Extract documentId if on analysis, chat, or prepare route
  const match = pathname.match(/\/(analysis|chat|prepare)\/([^/]+)/);
  const activeDocId = match ? match[2] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-legal-800/80 bg-legal-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400/60 group-hover:scale-105 transition-all shadow-subtle-glow">
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wide text-white group-hover:text-amber-200 transition-colors">
                LEGAL COMPASS
              </span>
            </div>
            <p className="text-[11px] text-legal-400 font-sans tracking-tight hidden sm:block">
              AI Legal Intelligence
            </p>
          </div>
        </Link>

        {/* Center Navigation */}
        {activeDocId ? (
          <nav className="flex shrink-0 items-center gap-1 rounded-xl border border-legal-800/80 bg-legal-900/90 p-1 text-xs font-medium shadow-inner">
            <Link
              href={`/analysis/${activeDocId}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname.startsWith('/analysis')
                  ? 'bg-legal-800 text-white font-semibold shadow-sm border border-legal-700/80'
                  : 'text-legal-400 hover:text-legal-100 hover:bg-legal-850/50'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Situation Map</span>
            </Link>

            <Link
              href={`/chat/${activeDocId}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname.startsWith('/chat')
                  ? 'bg-legal-800 text-white font-semibold shadow-sm border border-legal-700/80'
                  : 'text-legal-400 hover:text-legal-100 hover:bg-legal-850/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Legal Chat</span>
            </Link>

            <Link
              href={`/prepare/${activeDocId}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname.startsWith('/prepare')
                  ? 'bg-legal-800 text-white font-semibold shadow-sm border border-legal-700/80'
                  : 'text-legal-400 hover:text-legal-100 hover:bg-legal-850/50'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Lawyer Prep</span>
            </Link>
          </nav>
        ) : (
          /* Global Journey Indicator */
          <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-legal-900/80 border border-legal-800/80 text-xs text-legal-400 shadow-sm">
            <span className="text-legal-200 font-medium">Understand</span>
            <span className="text-legal-600 text-[10px]">→</span>
            <span className="text-legal-200 font-medium">Verify</span>
            <span className="text-legal-600 text-[10px]">→</span>
            <span className="text-legal-200 font-medium">Assess</span>
            <span className="text-legal-600 text-[10px]">→</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Act
            </span>
          </div>
        )}

        {/* Right Action / Status */}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link href="/compare" className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${pathname.startsWith('/compare') ? 'border-amber-500/60 text-amber-300 bg-amber-500/10' : 'border-legal-800 text-legal-300 hover:text-white hover:border-legal-700'}`} title="Compare documents">
            <GitCompareArrows className="w-3.5 h-3.5" />
            <span>Compare</span>
          </Link>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Evidence Grounded</span>
          </div>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-legal-950 transition-all shadow-subtle-glow hover:bg-amber-400 hover:shadow-amber-500/25 active:scale-95 sm:px-3.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Document</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
