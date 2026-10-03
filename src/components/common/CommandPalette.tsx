'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, X, CheckSquare, Zap, Bug, Bookmark, 
  ChevronRight, BookOpen, Layers, Clock, ArrowRight, CornerDownLeft 
} from 'lucide-react';
import { IssueType } from '@/lib/types';

export default function CommandPalette() {
  const { 
    isSearchOpen, setIsSearchOpen, issues, epics, docs, 
    setSelectedIssue, setActiveView, openDocInConfluence 
  } = useApp();
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'ALL' | 'ISSUES' | 'EPICS' | 'DOCS'>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setCategory('ALL');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredIssues = issues.filter(i => 
    !q || 
    i.key.toLowerCase().includes(q) || 
    i.summary.toLowerCase().includes(q) ||
    (i.feature && i.feature.toLowerCase().includes(q)) ||
    (i.phase && i.phase.toLowerCase().includes(q))
  );

  const filteredEpics = epics.filter(e => 
    !q || 
    e.name.toLowerCase().includes(q) ||
    (e.summary && e.summary.toLowerCase().includes(q))
  );

  const filteredDocs = (docs || []).filter(d => 
    !q || 
    d.title.toLowerCase().includes(q) ||
    d.content.toLowerCase().includes(q) ||
    (d.excerpt && d.excerpt.toLowerCase().includes(q))
  );

  const typeIcons: Record<IssueType, React.ReactNode> = {
    STORY: <Bookmark className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
    TASK: <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />,
    BUG: <Bug className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />,
    EPIC: <Zap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />,
  };

  const showIssues = category === 'ALL' || category === 'ISSUES';
  const showEpics = category === 'ALL' || category === 'EPICS';
  const showDocs = category === 'ALL' || category === 'DOCS';

  const totalResults = 
    (showIssues ? filteredIssues.length : 0) + 
    (showEpics ? filteredEpics.length : 0) + 
    (showDocs ? filteredDocs.length : 0);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-jira-border overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-jira-border flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-jira-brand flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Jira issues (e.g. WEZ-101), Epics, or Confluence docs..."
            className="w-full text-sm outline-none text-jira-text placeholder:text-slate-400 font-medium bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 rounded transition"
          >
            ESC
          </button>
        </div>

        {/* Filter Categories Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-jira-border flex items-center space-x-2 text-xs font-semibold overflow-x-auto select-none">
          <button
            onClick={() => setCategory('ALL')}
            className={`px-2.5 py-1 rounded-md transition ${
              category === 'ALL'
                ? 'bg-jira-brand text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setCategory('ISSUES')}
            className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1.5 ${
              category === 'ISSUES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>Issues</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${category === 'ISSUES' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
              {filteredIssues.length}
            </span>
          </button>
          <button
            onClick={() => setCategory('EPICS')}
            className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1.5 ${
              category === 'EPICS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>Epics</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${category === 'EPICS' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
              {filteredEpics.length}
            </span>
          </button>
          <button
            onClick={() => setCategory('DOCS')}
            className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1.5 ${
              category === 'DOCS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Confluence Docs</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${category === 'DOCS' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
              {filteredDocs.length}
            </span>
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[55vh]">
          {totalResults === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No matching results found</p>
              <p className="text-xs text-slate-400">
                {query ? `No items found matching "${query}". Try another key or summary.` : 'No issues or documentation available in this workspace yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Issues Group */}
              {showIssues && filteredIssues.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
                    <span>Issues & User Stories</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{filteredIssues.length} matches</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredIssues.slice(0, 8).map(issue => (
                      <button
                        key={issue.id}
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 flex items-center justify-between group transition"
                      >
                        <div className="flex-1 min-w-0 flex items-center space-x-2.5 pr-3">
                          {typeIcons[issue.type]}
                          <span className="font-bold text-xs text-blue-600 flex-shrink-0">{issue.key}</span>
                          <span className="text-xs text-jira-text font-medium truncate min-w-0">{issue.summary}</span>
                          
                          {issue.phase && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                              {issue.phase}
                            </span>
                          )}

                          {issue.feature && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 flex-shrink-0 truncate max-w-[120px]">
                              📁 {issue.feature}
                            </span>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center space-x-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {issue.status.replace('_', ' ')}
                          </span>
                          {issue.assignee && (
                            <img
                              src={issue.assignee.avatar}
                              alt={issue.assignee.name}
                              title={issue.assignee.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Epics Group */}
              {showEpics && filteredEpics.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
                    <span>Strategic Epics & Themes</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{filteredEpics.length} matches</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredEpics.map(epic => (
                      <button
                        key={epic.id}
                        onClick={() => {
                          setActiveView('epics');
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 flex items-center justify-between group transition"
                      >
                        <div className="flex-1 min-w-0 flex items-center space-x-2.5 pr-3">
                          <div 
                            style={{ backgroundColor: epic.color }}
                            className="w-5 h-5 rounded-md text-white flex items-center justify-center flex-shrink-0 shadow-2xs"
                          >
                            <Zap className="w-3 h-3 fill-current" />
                          </div>
                          <span className="text-xs text-jira-text font-bold truncate min-w-0">{epic.name}</span>
                          {epic.summary && (
                            <span className="text-[11px] text-slate-400 truncate min-w-0">- {epic.summary}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400 group-hover:text-purple-600 transition flex-shrink-0 text-xs font-semibold">
                          <span>View Epic</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confluence Docs Group */}
              {showDocs && filteredDocs.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
                    <span>Confluence Documentation</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{filteredDocs.length} matches</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredDocs.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          if (openDocInConfluence) {
                            openDocInConfluence(doc.id);
                          } else {
                            setActiveView('confluence');
                          }
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 flex items-center justify-between group transition"
                      >
                        <div className="flex-1 min-w-0 flex items-center space-x-2.5 pr-3">
                          <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-xs text-jira-text font-bold truncate min-w-0">{doc.title}</span>
                          {doc.category && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex-shrink-0">
                              {doc.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400 group-hover:text-indigo-600 transition flex-shrink-0 text-xs font-semibold">
                          <span>Read Doc</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-jira-border flex items-center justify-between text-[11px] text-jira-subtle select-none">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="bg-white border border-slate-200 px-1 rounded shadow-2xs font-mono">ESC</kbd>
              <span>to close</span>
            </span>
            <span className="hidden sm:inline-flex items-center space-x-1">
              <kbd className="bg-white border border-slate-200 px-1 rounded shadow-2xs font-mono">C</kbd>
              <span>to create issue</span>
            </span>
          </div>
          <span className="font-semibold text-jira-brand">
            Wezblue Enterprise Jira & Confluence
          </span>
        </div>
      </div>
    </div>
  );
}
