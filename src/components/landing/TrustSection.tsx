import React from 'react';
import { ShieldCheck, HelpCircle, AlertCircle, FileCheck, Lock, CheckCircle2 } from 'lucide-react';

export function TrustSection() {
  const trustFeatures = [
    {
      title: 'Evidence-Backed Findings',
      description: 'Conclusions directly link to the clause number, page, and excerpt from your document. If we cannot highlight the text, we do not assert the claim.',
      icon: FileCheck,
      badge: 'Grounded Traceability',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Explicit Uncertainty ("I Don\'t Know")',
      description: 'When the provided document lacks sufficient facts or context, the system states so openly instead of filling gaps from model memory.',
      icon: HelpCircle,
      badge: 'No Hallucinations',
      iconColor: 'text-blue-400',
    },
    {
      title: 'False-Premise Protection',
      description: 'If you ask a question assuming a legal conclusion (e.g., "Since this clause is illegal..."), Legal Compass challenges the premise first.',
      icon: AlertCircle,
      badge: 'Assumption Check',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Data & Privacy Isolation',
      description: 'Uploaded documents are treated strictly as data, not system instructions. We isolate sessions and enforce prompt injection defenses.',
      icon: Lock,
      badge: 'Privacy Isolated',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <section className="py-20 border-t border-legal-800/80 bg-legal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Safety & Verification
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Built for informed decisions, not blind trust.
            </h2>

            <p className="text-legal-300 text-base leading-relaxed">
              Legal documents are high-stakes. Rather than generating smooth but unverified summaries, Legal Compass prioritizes verifiable evidence, epistemic humility, and preparation for licensed human counsel.
            </p>

            <div className="p-4 rounded-xl bg-legal-900/90 border border-legal-800 space-y-1.5">
              <div className="text-xs font-semibold text-amber-400">
                Our Core Guarantee:
              </div>
              <p className="text-xs text-legal-300 leading-normal">
                "We do not replace the lawyer. We help the user arrive prepared."
              </p>
            </div>
          </div>

          {/* Right Trust Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="surface-card p-5 border-legal-800/80 bg-legal-900/70 hover:bg-legal-900 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-legal-850 border border-legal-800 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-medium text-legal-400 px-2.5 py-0.5 rounded-full bg-legal-950 border border-legal-800">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-legal-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
