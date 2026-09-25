'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, FileText, Minus, Plus, ShieldAlert } from 'lucide-react';
import { AnalysisResult, Clause } from '@/types/legal';

interface DocumentCompareViewProps {
  documents: AnalysisResult[];
}

const topics = ['payment', 'termination', 'ip', 'confidentiality', 'liability'];

function topicLabel(topic: string) {
  return topic === 'ip' ? 'IP & Deliverables' : topic.charAt(0).toUpperCase() + topic.slice(1);
}

function clauseForTopic(clauses: Clause[], topic: string) {
  return clauses.find((clause) => clause.category === topic);
}

export function DocumentCompareView({ documents }: DocumentCompareViewProps) {
  const [leftId, setLeftId] = useState(documents[0]?.document.id || '');
  const [rightId, setRightId] = useState(documents[1]?.document.id || documents[0]?.document.id || '');

  useEffect(() => {
    if (!leftId && documents[0]) setLeftId(documents[0].document.id);
    if (!rightId && documents[1]) setRightId(documents[1].document.id);
  }, [documents, leftId, rightId]);

  if (documents.length < 2) {
    return (
      <section className="surface-card p-8 text-center space-y-3">
        <FileText className="w-8 h-8 text-amber-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white">Two uploaded documents are required</h2>
        <p className="text-sm text-legal-400 max-w-md mx-auto">Upload at least two documents in this session before comparing clauses, risks, or obligations.</p>
      </section>
    );
  }

  const left = documents.find((item) => item.document.id === leftId) || documents[0];
  const right = documents.find((item) => item.document.id === rightId) || documents[1] || documents[0];

  const riskDelta = useMemo(() => {
    const leftTitles = new Set(left.findings.map((finding) => finding.title));
    const rightTitles = new Set(right.findings.map((finding) => finding.title));
    return {
      added: right.findings.filter((finding) => !leftTitles.has(finding.title)),
      removed: left.findings.filter((finding) => !rightTitles.has(finding.title)),
    };
  }, [left, right]);

  const obligationDelta = useMemo(() => {
    const key = (item: { actor: string; action: string }) => `${item.actor}:${item.action}`;
    const leftItems = new Set(left.situationMap.obligations.map(key));
    const rightItems = new Set(right.situationMap.obligations.map(key));
    return {
      added: right.situationMap.obligations.filter((item) => !leftItems.has(key(item))),
      removed: left.situationMap.obligations.filter((item) => !rightItems.has(key(item))),
    };
  }, [left, right]);

  return (
    <div className="space-y-6">
      <div className="surface-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label className="flex-1 space-y-1"><span className="text-[11px] uppercase tracking-wider text-legal-500">Document A</span><select value={leftId} onChange={(event) => setLeftId(event.target.value)} className="w-full bg-legal-950 border border-legal-800 rounded-lg px-3 py-2 text-sm text-white">{documents.map((item) => <option key={item.document.id} value={item.document.id}>{item.document.filename}</option>)}</select></label>
        <ArrowRight className="w-5 h-5 text-amber-400 self-center hidden sm:block" />
        <label className="flex-1 space-y-1"><span className="text-[11px] uppercase tracking-wider text-legal-500">Document B</span><select value={rightId} onChange={(event) => setRightId(event.target.value)} className="w-full bg-legal-950 border border-legal-800 rounded-lg px-3 py-2 text-sm text-white">{documents.map((item) => <option key={item.document.id} value={item.document.id}>{item.document.filename}</option>)}</select></label>
      </div>

      <section className="surface-card overflow-hidden">
        <div className="p-5 border-b border-legal-800"><p className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Clause alignment</p><h2 className="text-lg font-bold text-white mt-1">What changed by topic</h2></div>
        <div className="divide-y divide-legal-800">
          {topics.map((topic) => {
            const a = clauseForTopic(left.clauses, topic);
            const b = clauseForTopic(right.clauses, topic);
            const same = a?.text === b?.text;
            return <div key={topic} className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-legal-800"><div className="bg-legal-900 p-5"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-amber-300">{topicLabel(topic)}</span><span className="text-[11px] text-legal-500">A</span></div><p className="text-xs leading-relaxed text-legal-300">{a?.text || 'Topic not found in document.'}</p></div><div className={`bg-legal-900 p-5 ${!same ? 'border-l-2 border-amber-400' : ''}`}><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-amber-300">{topicLabel(topic)}</span><span className="text-[11px] text-legal-500">B {!same && 'Changed'}</span></div><p className="text-xs leading-relaxed text-legal-300">{b?.text || 'Topic not found in document.'}</p></div></div>;
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeltaPanel title="Risk changes" icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} added={riskDelta.added.map((item) => item.title)} removed={riskDelta.removed.map((item) => item.title)} />
        <DeltaPanel title="Obligation changes" icon={<FileText className="w-4 h-4 text-blue-400" />} added={obligationDelta.added.map((item) => `${item.actor}: ${item.action}`)} removed={obligationDelta.removed.map((item) => `${item.actor}: ${item.action}`)} />
      </div>
    </div>
  );
}

function DeltaPanel({ title, icon, added, removed }: { title: string; icon: React.ReactNode; added: string[]; removed: string[] }) {
  return <section className="surface-card p-5 space-y-4"><h2 className="flex items-center gap-2 text-sm font-semibold text-white">{icon}{title}</h2><div className="space-y-2">{added.map((item) => <div key={`added-${item}`} className="flex gap-2 text-xs text-emerald-300"><Plus className="w-3.5 h-3.5 shrink-0" />{item}</div>)}{removed.map((item) => <div key={`removed-${item}`} className="flex gap-2 text-xs text-rose-300"><Minus className="w-3.5 h-3.5 shrink-0" />{item}</div>)}{added.length === 0 && removed.length === 0 && <div className="flex gap-2 text-xs text-legal-400"><Check className="w-3.5 h-3.5 text-emerald-400" />No detected changes.</div>}</div></section>;
}