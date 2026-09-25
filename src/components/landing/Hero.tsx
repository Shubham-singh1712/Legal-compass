import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-section relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden py-16 md:py-20"
    >
      {/* ── Dark-mode ambient glow blobs (hidden in light mode via CSS) ── */}
      <div
        aria-hidden="true"
        className="hero-glow-blob absolute left-[10%] top-[22%] h-[32rem] w-[32rem] rounded-full pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hero-glow-blob-sm absolute right-[15%] bottom-[20%] h-[20rem] w-[20rem] rounded-full pointer-events-none"
      />

      {/* ── Light-mode ambient glow (hidden in dark mode via CSS) ── */}
      <div
        aria-hidden="true"
        className="hero-light-glow absolute inset-0 pointer-events-none"
      />

      {/* ── Central editorial content block ── */}
      <div className="relative z-10 w-full mx-auto px-6 sm:px-10 lg:px-16 max-w-4xl">
        {/* Eyebrow */}
        <div className="mb-8 flex flex-wrap items-center gap-3 hero-eyebrow">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] hero-eyebrow-text">
            <Compass className="w-4 h-4 hero-eyebrow-icon" />
            <span>Legal Intelligence Workspace</span>
          </div>
          <span className="h-1 w-1 rounded-full hero-eyebrow-dot" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium hero-evidence-text">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Evidence Grounded
          </span>
        </div>

        {/* Headline + supporting copy + CTAs */}
        <div className="relative">
          {/* Per-headline ambient warmth (theme-aware via CSS) */}
          <div
            aria-hidden="true"
            className="hero-headline-glow absolute -left-8 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full pointer-events-none"
          />

          <h1 className="text-5xl font-extrabold leading-[1.03] tracking-tight hero-headline sm:text-6xl md:text-7xl lg:text-[4.75rem]">
            <span className="block hero-headline-line">Turn an unfamiliar</span>
            <span className="block hero-headline-line [animation-delay:120ms]">agreement into a</span>
            <span className="gold-gradient-text hero-highlight-line block [animation-delay:240ms]">
              defensible next step.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed hero-supporting-text sm:text-lg hero-supporting-copy">
            Upload the document. See what it says, where it says it, and what
            deserves attention before anyone signs.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center hero-cta">
            <Link
              href="/analyze"
              id="hero-cta-analyze"
              className="hero-btn-primary inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-center text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Analyze a Document</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              id="hero-cta-how-it-works"
              className="hero-btn-secondary inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-center text-sm font-medium transition-all"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
