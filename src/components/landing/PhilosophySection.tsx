import React from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

export function PhilosophySection() {
  const pillars = [
    {
      number: '01',
      title: 'Understand',
      tag: 'Deconstruct',
      description: 'Convert dense contractual prose into an intuitive Legal Situation Map: parties, roles, rights, and operational obligations.',
      icon: BookOpen,
      accentColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      hoverGlow: 'hover:border-blue-500/40 hover:shadow-blue-glow',
    },
    {
      number: '02',
      title: 'Verify',
      tag: 'Traceability',
      description: 'Every assertion points directly to the underlying clause, section title, and page offset. Zero ungrounded citations.',
      icon: ShieldCheck,
      accentColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      hoverGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-glow',
    },
    {
      number: '03',
      title: 'Assess',
      tag: 'Risk Radar',
      description: 'Prioritize provisions by practical exposure, asymmetric liabilities, and renewal deadlines with clear confidence levels.',
      icon: AlertTriangle,
      accentColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      hoverGlow: 'hover:border-amber-500/40 hover:shadow-subtle-glow',
    },
    {
      number: '04',
      title: 'Act',
      tag: 'Preparation',
      description: 'Generate structured lawyer consultation briefs with critical concerns, key dates, proof to gather, and targeted questions.',
      icon: FileText,
      accentColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      hoverGlow: 'hover:border-rose-500/40',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-legal-800/80 bg-legal-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-legal-900 border border-legal-800 text-xs font-medium text-amber-400">
            Product Philosophy
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How Legal Compass Navigates Contracts
          </h2>
          <p className="text-legal-300 text-base leading-relaxed">
            Not a generic chatbot or blind summarizer. A structured 4-stage pipeline that preserves evidence and epistemic honesty.
          </p>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`group relative surface-card p-6 border-legal-800/80 transition-all duration-300 hover:-translate-y-1 ${pillar.hoverGlow}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-semibold text-legal-400">
                    {pillar.number}
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-legal-950 text-legal-300 border border-legal-800">
                    {pillar.tag}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="space-y-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${pillar.iconBg} border flex items-center justify-center ${pillar.accentColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {pillar.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-legal-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
