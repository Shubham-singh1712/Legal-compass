'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  FileText,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Scale,
  CheckCircle2,
  Info,
  CornerDownRight,
  User,
  Compass,
} from 'lucide-react';
import { EvidenceDrawer } from '@/components/situation-map/EvidenceDrawer';
import { DocumentViewerModal } from '@/components/situation-map/DocumentViewerModal';
import { AnalysisResult, FindingEvidence } from '@/types/legal';
import { getAnalysisForDocument } from '@/lib/analysisEngine';
import { generateGroundedResponse, ChatEngineResponse } from '@/lib/chatEngine';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseObj?: ChatEngineResponse;
  timestamp: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.documentId as string;

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Evidence Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerEvidence, setDrawerEvidence] = useState<FindingEvidence | null>(null);
  const [drawerInterpretation, setDrawerInterpretation] = useState<string | undefined>();
  const [drawerWhyItMatters, setDrawerWhyItMatters] = useState<string | undefined>();
  const [drawerSuggestedQuestion, setDrawerSuggestedQuestion] = useState<string | undefined>();
  const [drawerLimitation, setDrawerLimitation] = useState<string | undefined>();
  const [drawerConfidence, setDrawerConfidence] = useState<number>(0.92);

  // Document Full View Modal State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // Helper to initialize chat with data
    function initChat(data: AnalysisResult) {
      if (!isMounted) return;
      setAnalysisData(data);
      const initialResp = generateGroundedResponse(documentId, 'Overview of agreement');
      setMessages([
        {
          id: 'welcome_msg',
          sender: 'assistant',
          text: `I've analyzed all ${data.clauses.length} clauses in **${data.document.filename}**. Every answer is strictly grounded in the document text with page citations and uncertainty notices. What would you like to clarify?`,
          responseObj: initialResp,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }

    // 1. Load local data immediately — prevents blank/loading state
    try {
      const localData = getAnalysisForDocument(documentId);
      initChat(localData);
    } catch (err) {
      console.error('Local analysis load failed for chat:', err);
    }

    // 2. Silently refresh from API if uploaded document exists
    async function refreshFromApi() {
      try {
        const res = await fetch(`/api/analysis/${documentId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            initChat(json.data);
          }
        }
      } catch (e) {
        // Silent — local data already shown
      }
    }
    refreshFromApi();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: MessageItem = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const responseObj = generateGroundedResponse(documentId, query);
      const assistantMsg: MessageItem = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: responseObj.answer,
        responseObj,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 500);
  };

  const handleOpenEvidence = (ev: FindingEvidence, title: string, interp?: string, why?: string, lim?: string) => {
    setDrawerTitle(title);
    setDrawerEvidence(ev);
    setDrawerInterpretation(interp || ev.excerpt);
    setDrawerWhyItMatters(why || 'Verify how this provision impacts your position under the document.');
    setDrawerSuggestedQuestion('Does this provision match your expectations for this contract?');
    setDrawerLimitation(lim || 'Document text represents what is written. Local statutes may apply.');
    setDrawerConfidence(0.95);
    setDrawerOpen(true);
  };

  if (!analysisData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Document Not Found</h2>
        <Link href="/analyze" className="px-5 py-2.5 rounded-xl bg-brand-gold text-legal-950 font-bold text-sm">
          Upload New Document
        </Link>
      </div>
    );
  }

  const starterQuestions = [
    { label: 'Notice Period', query: 'What notice period is required for termination?' },
    { label: 'Key Obligations', query: 'What are my primary obligations under this agreement?' },
    { label: 'Penalties & Fees', query: 'Are there any penalty fees or late charges?' },
    { label: 'Premise Check', query: 'Since this clause is illegal, can I ignore it?' },
  ];

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header Context Bar */}
      <div className="surface-card p-4 sm:p-5 rounded-2xl border border-legal-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href={`/analysis/${documentId}`}
            className="p-2.5 rounded-xl bg-legal-900 border border-legal-800 text-legal-400 hover:text-white hover:bg-legal-850 transition-colors shrink-0"
            title="Back to Situation Map"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-gold">
                Legal Intelligence Chat
              </span>
              <span className="badge-epistemic-doc hidden sm:inline-flex">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Evidence Grounded</span>
              </span>
              <span className="text-xs text-legal-400 flex items-center gap-1">
                <User className="w-3 h-3 text-legal-400" />
                <span>Role: <strong className="text-legal-200">{analysisData.document.userContext.role}</strong></span>
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight truncate mt-1">
              {analysisData.document.filename}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsDocModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-legal-900 border border-legal-800 hover:border-legal-700 text-xs font-semibold text-legal-200 hover:text-white transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-brand-gold" />
            <span>Full Document Clauses</span>
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask:</span>
        </span>
        {starterQuestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.query)}
            className="px-3.5 py-2 rounded-xl bg-legal-900/80 border border-legal-800 hover:border-brand-gold/40 hover:bg-legal-850 text-legal-300 hover:text-white transition-all shrink-0 text-left text-xs font-medium"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 bg-legal-950/60 border border-legal-800/80 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6 min-h-[460px] max-h-[640px] shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const resp = msg.responseObj;

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
              <div className="flex items-center gap-2 text-xs text-legal-400 font-mono">
                <span>{isUser ? 'You' : 'Legal Compass'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {isUser ? (
                <div className="max-w-lg p-4 rounded-2xl rounded-tr-sm bg-brand-gold text-legal-950 font-medium text-sm shadow-md leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-3xl w-full surface-card p-6 rounded-2xl border border-legal-800/90 shadow-xl space-y-5 text-left">
                  {/* False Premise Warning Alert */}
                  {resp?.premiseWarning && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-amber-100 flex items-center gap-2">
                          <span>Premise Verification Notice</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-300">
                            {resp.premiseState}
                          </span>
                        </div>
                        <p className="text-amber-200/90">
                          {resp.premiseWarning}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. DIRECT ANSWER */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Direct Answer</span>
                      </span>
                      <span className="badge-epistemic-doc text-xs">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{resp?.epistemicLabel || 'Document Grounded'}</span>
                      </span>
                    </div>
                    <p className="text-sm text-legal-100 font-medium leading-relaxed">
                      {msg.text}
                    </p>
                  </div>

                  {/* 2. DOCUMENT EVIDENCE SECTION */}
                  {resp?.evidence && resp.evidence.length > 0 && (
                    <div className="space-y-2.5 pt-4 border-t border-legal-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Exact Quoted Document Evidence</span>
                        </span>
                        <span className="text-xs text-legal-400 font-mono">Verifiable Passage</span>
                      </div>

                      {resp.evidence.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          onClick={() => handleOpenEvidence(ev, ev.clauseIdentifier, ev.excerpt, resp.whyThisAnswer, resp.limitation)}
                          className="p-4 rounded-xl bg-legal-900/90 border border-emerald-500/20 hover:border-emerald-500/50 text-legal-200 cursor-pointer transition-all group flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-2">
                              <span>{ev.clauseIdentifier}</span>
                              <span className="text-legal-400 font-normal">Page {ev.pageNumber}</span>
                            </div>
                            <p className="text-xs font-serif italic text-legal-300 leading-relaxed pr-2">
                              "{ev.excerpt}"
                            </p>
                          </div>
                          <span className="text-xs font-medium text-brand-gold shrink-0 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                            Inspect →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. WHY THIS ANSWER (CONTEXT) */}
                  {resp?.whyThisAnswer && (
                    <div className="space-y-1.5 pt-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                        Legal Context & Application
                      </span>
                      <p className="text-xs text-legal-300 leading-relaxed">
                        {resp.whyThisAnswer}
                      </p>
                    </div>
                  )}

                  {/* 4. LIMITATION & UNCERTAINTY */}
                  {resp?.limitation && (
                    <div className="p-3.5 rounded-xl bg-legal-900/70 border border-legal-800 text-xs text-legal-400 leading-relaxed flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-legal-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-legal-300 font-medium">Document Limitation: </strong>
                        <span>{resp.limitation}</span>
                      </div>
                    </div>
                  )}

                  {/* 5. SUGGESTED NEXT QUESTIONS */}
                  {resp?.suggestedFollowUp && resp.suggestedFollowUp.length > 0 && (
                    <div className="pt-3 border-t border-legal-800 space-y-2">
                      <span className="text-xs text-legal-400 flex items-center gap-1.5 font-medium">
                        <CornerDownRight className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Suggested follow-up questions:</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {resp.suggestedFollowUp.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            type="button"
                            onClick={() => handleSendMessage(fu)}
                            className="px-3 py-1.5 rounded-lg bg-legal-900 border border-legal-750 hover:border-brand-gold/40 text-xs text-legal-300 hover:text-white transition-colors"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-legal-300 p-4 rounded-xl surface-card border border-legal-800 w-fit">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
            <span>Scanning document clauses and validating evidence citations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Ask anything about your agreement (e.g., 'What is my notice period?', 'Are there penalty fees?')..."
          className="w-full pl-5 pr-14 py-4 rounded-2xl bg-legal-900 border border-legal-750 text-white text-sm placeholder:text-legal-500 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all shadow-inner"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim()}
          className="absolute right-2.5 top-2.5 p-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-light disabled:opacity-30 disabled:hover:bg-brand-gold text-legal-950 font-bold transition-all shadow-md"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Slide-over Evidence Drawer & Document Modal */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        evidence={drawerEvidence}
        interpretation={drawerInterpretation}
        whyItMatters={drawerWhyItMatters}
        suggestedQuestion={drawerSuggestedQuestion}
        limitation={drawerLimitation}
        confidence={drawerConfidence}
      />

      <DocumentViewerModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        filename={analysisData.document.filename}
        clauses={analysisData.clauses}
        onSelectClause={(c) => {
          handleOpenEvidence(
            {
              clauseIdentifier: c.clauseNumber ? `Section ${c.clauseNumber} — ${c.title}` : c.title,
              pageNumber: c.pageNumber,
              excerpt: c.text,
            },
            c.title,
            c.text
          );
        }}
      />
    </div>
  );
}
