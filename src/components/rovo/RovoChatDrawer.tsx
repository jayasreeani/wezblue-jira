'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { RovoSource } from '@/lib/types';
import { 
  Sparkles, X, RotateCcw, Send, ExternalLink, 
  FileText, CheckCircle2, ChevronRight, Bot, User, 
  Layers, Tag, BookOpen, AlertCircle, HelpCircle, ArrowUpRight
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "What are our mobile OTP login acceptance criteria?",
  "What are the blockers or open bugs in Sprint 24?",
  "Summarize the Architecture RFC for SSO",
  "What is the burndown status of Wezblue Sprint 24?",
  "What is the workload and remaining hours for Alex Rivera?",
];

export default function RovoChatDrawer() {
  const { 
    isRovoOpen, setIsRovoOpen, rovoMessages, isRovoLoading, 
    askRovo, clearRovoChat, setSelectedIssue, issues, 
    openDocInConfluence, docs 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isRovoOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isRovoOpen, rovoMessages, isRovoLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isRovoLoading) return;
    const msg = inputMessage.trim();
    setInputMessage('');
    await askRovo(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Parses ticket codes [WEZ-xxx] and doc tags [Doc: ...] into interactive buttons
  const renderInteractiveText = (text: string) => {
    // Regex splits by [WEZ-xxx] and [Doc: ...]
    const parts = text.split(/(\[WEZ-\d+\]|\[Doc:[^\]]+\])/g);

    return parts.map((part, i) => {
      const ticketMatch = part.match(/^\[(WEZ-\d+)\]$/);
      if (ticketMatch) {
        const key = ticketMatch[1];
        const issue = issues.find(iss => iss.key.toUpperCase() === key.toUpperCase());
        return (
          <button
            key={i}
            onClick={() => {
              if (issue) setSelectedIssue(issue);
            }}
            className="inline-flex items-center space-x-1 mx-1 px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-mono text-[11px] font-bold border border-blue-300 transition shadow-2xs"
            title={`View Jira issue ${key}`}
          >
            <span>{key}</span>
            <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
          </button>
        );
      }

      const docMatch = part.match(/^\[Doc:\s*([^\]]+)\]$/);
      if (docMatch) {
        const title = docMatch[1].trim();
        const doc = docs.find(d => d.title.toLowerCase().includes(title.toLowerCase()));
        return (
          <button
            key={i}
            onClick={() => {
              if (doc) openDocInConfluence(doc);
              else openDocInConfluence(title);
            }}
            className="inline-flex items-center space-x-1 mx-1 px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold text-[11px] border border-purple-300 transition shadow-2xs"
            title={`Open Confluence page "${title}"`}
          >
            <BookOpen className="w-2.5 h-2.5 text-purple-700" />
            <span>Doc: {title.slice(0, 28)}{title.length > 28 ? '...' : ''}</span>
            <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
          </button>
        );
      }

      return <span key={i}>{part}</span>;
    });
  };

  // Helper to render markdown bubbles
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCode = false;
    let codeLines: string[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCode) {
          elements.push(
            <pre key={`code-${idx}`} className="bg-slate-900 text-emerald-300 p-2.5 rounded-md font-mono text-xs my-2 overflow-x-auto shadow-inner">
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
          codeLines = [];
          inCode = false;
        } else {
          inCode = true;
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} className="font-bold text-sm text-jira-text mt-3 mb-1.5">{renderInteractiveText(line.slice(4))}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={idx} className="font-semibold text-xs text-slate-800 mt-2 mb-1">{renderInteractiveText(line.slice(5))}</h4>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={idx} className="flex items-start space-x-1.5 pl-2 py-0.5 text-xs text-slate-700">
            <span className="text-jira-brand font-bold">•</span>
            <span className="leading-relaxed">{renderInteractiveText(line.slice(2))}</span>
          </div>
        );
      } else if (line.startsWith('> [!TIP]')) {
        elements.push(
          <div key={idx} className="border-l-2 border-emerald-500 bg-emerald-50/70 p-2 rounded-r text-[11px] text-emerald-900 my-1.5 font-medium">
            💡 {renderInteractiveText(line.replace('> [!TIP]', '').trim())}
          </div>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <div key={idx} className="border-l-2 border-jira-brand bg-blue-50/50 p-2 rounded-r text-[11px] text-slate-700 my-1 italic">
            {renderInteractiveText(line.slice(2))}
          </div>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <div key={idx} className="flex items-start space-x-1.5 pl-2 py-0.5 text-xs text-slate-700">
            <span className="font-semibold text-jira-brand">{line.split('.')[0]}.</span>
            <span className="leading-relaxed">{renderInteractiveText(line.slice(line.indexOf('.') + 1).trim())}</span>
          </div>
        );
      } else if (line.startsWith('---')) {
        elements.push(<hr key={idx} className="my-2 border-jira-border" />);
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={idx} className="text-xs text-slate-700 my-1 leading-relaxed">
            {renderInteractiveText(line)}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Trigger (always visible when closed) */}
      {!isRovoOpen && (
        <button
          onClick={() => setIsRovoOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 select-none group"
          title="Open WezAI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="tracking-wide">Ask WezAI</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] uppercase font-semibold">AI</span>
        </button>
      )}

      {/* Slide-over Assistant Drawer */}
      {isRovoOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-jira-border flex flex-col select-none animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-jira-border bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4 text-yellow-200" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm tracking-tight text-white">WezAI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    AI ASSISTANT
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cross-referencing Jira & Confluence</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={clearRovoChat}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsRovoOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                title="Close WezAI"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-jira-border">
            <div className="text-[10px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <HelpCircle className="w-3 h-3 text-jira-brand" />
              <span>Suggested Queries</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => askRovo(prompt)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-jira-brand text-[11px] font-medium whitespace-nowrap transition shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {rovoMessages.map(msg => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 px-1">
                    {isAssistant ? (
                      <>
                        <div className="w-4 h-4 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                          W
                        </div>
                        <span className="text-[11px] font-bold text-jira-text">WezAI</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold text-jira-text">You</span>
                        <div className="w-4 h-4 rounded bg-slate-700 text-white flex items-center justify-center text-[10px]">
                          U
                        </div>
                      </>
                    )}
                    <span className="text-[10px] text-jira-subtle">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[92%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isAssistant
                        ? 'bg-white border border-jira-border text-slate-800 rounded-tl-sm'
                        : 'bg-jira-brand text-white rounded-tr-sm'
                    }`}
                  >
                    {isAssistant ? (
                      renderMessageContent(msg.content)
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {/* Sources Consulted Drawer */}
                  {isAssistant && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pl-2 max-w-[92%]">
                      <div className="p-2 rounded-lg bg-slate-100/80 border border-slate-200 text-[11px] space-y-1">
                        <div className="font-bold text-slate-600 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sources Grounded ({msg.sources.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.sources.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (s.type === 'jira') {
                                  const issue = issues.find(i => i.id === s.id || i.key === s.keyOrTitle);
                                  if (issue) setSelectedIssue(issue);
                                } else {
                                  openDocInConfluence(s.id);
                                }
                              }}
                              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                                s.type === 'jira'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                                  : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                              }`}
                              title={s.snippet || s.keyOrTitle}
                            >
                              {s.type === 'jira' ? (
                                <Tag className="w-2.5 h-2.5 text-blue-600" />
                              ) : (
                                <FileText className="w-2.5 h-2.5 text-purple-600" />
                              )}
                              <span>{s.keyOrTitle}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isRovoLoading && (
              <div className="flex items-center space-x-2 text-xs text-jira-brand p-3 bg-white rounded-xl border border-jira-border shadow-xs w-fit">
                <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
                <span className="font-semibold animate-pulse">
                  WezAI is analyzing Jira tickets & Confluence docs...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white border-t border-jira-border">
            <form onSubmit={handleSend} className="relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask WezAI anything across Jira tickets & Confluence docs..."
                className="w-full pl-3 pr-10 py-2 text-xs text-slate-800 border border-jira-border rounded-xl focus:outline-none focus:ring-2 focus:ring-jira-brand resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isRovoLoading}
                className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-jira-brand disabled:bg-slate-200 text-white disabled:text-slate-400 transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between px-1 mt-1.5 text-[10px] text-jira-subtle">
              <span>Press <kbd className="font-mono bg-slate-100 px-1 py-0.2 rounded border">Enter</kbd> to send</span>
              <span className="text-jira-brand font-medium">Wezblue AI Engine</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
