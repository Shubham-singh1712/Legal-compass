'use client';

import React, { useState, useMemo } from 'react';
import { X, FileText, Search, ShieldCheck, ChevronRight, Filter, BookOpen } from 'lucide-react';
import { Clause } from '@/types/legal';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  clauses: Clause[];
  onSelectClause: (clause: Clause) => void;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  filename,
  clauses,
  onSelectClause,
}: DocumentViewerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All topics' },
    { id: 'payment', label: 'Payment' },
    { id: 'termination', label: 'Termination' },
    { id: 'ip', label: 'IP & Deliverables' },
    { id: 'confidentiality', label: 'Confidentiality' },
    { id: 'liability', label: 'Liability' },
  ];

  // Unique pages
  const pages = useMemo(() => {
    const p = Array.from(new Set(clauses.map((c) => c.pageNumber))).sort((a, b) => a - b);
    return p;
  }, [clauses]);

  const filteredClauses = useMemo(() => {
    return clauses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clauseNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPage = selectedPage === 'all' || c.pageNumber === selectedPage;
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;

      return matchesSearch && matchesPage && matchesCategory;
    });
  }, [clauses, searchQuery, selectedPage, selectedCategory]);

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) => part.toLowerCase() === searchQuery.trim().toLowerCase()
      ? <mark key={index} className="bg-amber-300 text-legal-950 rounded px-0.5">{part}</mark>
      : part);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-legal-950 border border-legal-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left z-10">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-legal-800 flex items-center justify-between bg-legal-900/80">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-serif font-bold text-white truncate max-w-sm sm:max-w-md">
                  {filename}
                </h3>
                <span className="badge-epistemic-doc hidden sm:inline-flex items-center gap-1 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{clauses.length} Grounded Clauses</span>
                </span>
              </div>
              <p className="text-xs text-legal-400 mt-0.5">
                Authentic extracted legal passages segmented by page & clause ID
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-legal-400 hover:text-white hover:bg-legal-850 transition-colors shrink-0"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Page Filter Controls */}
        <div className="p-4 border-b border-legal-850 bg-legal-900/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-legal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clauses by keyword or section ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-legal-950 border border-legal-800 text-xs text-legal-100 placeholder-legal-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          {pages.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <span className="text-legal-400 text-xs flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3 h-3" />
                <span>Page:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedPage('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedPage === 'all'
                    ? 'bg-brand-gold text-legal-950 font-semibold'
                    : 'bg-legal-900 text-legal-400 hover:text-white hover:bg-legal-850 border border-legal-800'
                }`}
              >
                All ({clauses.length})
              </button>
              {pages.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPage(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                    selectedPage === p
                      ? 'bg-brand-gold text-legal-950 font-semibold'
                      : 'bg-legal-900 text-legal-400 hover:text-white hover:bg-legal-850 border border-legal-800'
                  }`}
                >
                  P.{p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-b border-legal-850 bg-legal-950/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] uppercase tracking-wider text-legal-500 shrink-0">Topic</span>
          {categories.map((category) => (
            <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id ? 'bg-amber-400 text-legal-950' : 'border border-legal-800 bg-legal-900 text-legal-400 hover:text-white'}`}>
              {category.label}
            </button>
          ))}
        </div>

        {/* Clauses List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="surface-card p-5 rounded-xl border border-legal-800/90 hover:border-brand-gold/40 transition-all space-y-3 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                      {clause.clauseNumber ? `Sec. ${clause.clauseNumber}` : 'Clause'}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {highlightText(clause.title)}
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-mono text-legal-400 px-2.5 py-1 rounded-md bg-legal-900 border border-legal-800 shrink-0">
                  Page {clause.pageNumber}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-legal-900/80 border border-legal-800 text-legal-200 font-serif text-xs leading-relaxed italic relative">
                "{highlightText(clause.text)}"
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectClause(clause);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-gold hover:text-white hover:bg-brand-gold/10 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Inspect Evidence & Legal Impact</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredClauses.length === 0 && (
            <div className="text-center py-16 text-legal-400 space-y-2">
              <p className="text-sm font-medium text-legal-300">No matching clauses found</p>
              <p className="text-xs text-legal-500">
                Try adjusting your search keywords or clear page filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
