'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, X, CheckSquare, Zap, Bug, Bookmark, ChevronRight } from 'lucide-react';
import { IssueType } from '@/lib/types';

export default function CommandPalette() {
  const { isSearchOpen, setIsSearchOpen, issues, epics, setSelectedIssue, setActiveView } = useApp();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredIssues = issues.filter(i => 
    i.key.toLowerCase().includes(query.toLowerCase()) || 
    i.summary.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEpics = epics.filter(e => 
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  const typeIcons: Record<IssueType, React.ReactNode> = {
    STORY: <Bookmark className="w-3.5 h-3.5 text-emerald-600" />,
    TASK: <CheckSquare className="w-3.5 h-3.5 text-blue-600" />,
    BUG: <Bug className="w-3.5 h-3.5 text-red-600" />,
    EPIC: <Zap className="w-3.5 h-3.5 text-purple-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-jira-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-jira-border flex items-center space-x-3">
          <Search className="w-5 h-5 text-jira-subtle" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type an issue key (e.g. WEZ-101), summary, or keyword..."
            className="w-full text-sm outline-none text-jira-text placeholder:text-jira-subtle font-medium"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded hover:bg-slate-100 text-jira-subtle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Issues Group */}
          <div>
            <div className="px-3 py-1 text-[11px] font-bold text-jira-subtle uppercase tracking-wider">
              Issues ({filteredIssues.length})
            </div>
            {filteredIssues.length === 0 ? (
              <div className="px-3 py-2 text-xs text-jira-subtle">No matching issues</div>
            ) : (
              filteredIssues.slice(0, 6).map(issue => (
                <button
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssue(issue);
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center justify-between group transition"
                >
                  <div className="flex items-center space-x-2.5">
                    {typeIcons[issue.type]}
                    <span className="font-bold text-xs text-blue-600">{issue.key}</span>
                    <span className="text-xs text-jira-text font-medium truncate max-w-md">{issue.summary}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-jira-brand">
                    {issue.status}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Epics Group */}
          <div>
            <div className="px-3 py-1 text-[11px] font-bold text-jira-subtle uppercase tracking-wider">
              Epics ({filteredEpics.length})
            </div>
            {filteredEpics.map(epic => (
              <button
                key={epic.id}
                onClick={() => {
                  setActiveView('epics');
                  setIsSearchOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center justify-between group transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs text-jira-text font-semibold">{epic.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-jira-bg border-t border-jira-border flex items-center justify-between text-[11px] text-jira-subtle">
          <span>Navigate with mouse or Esc to close</span>
          <span>Tip: Press <kbd className="bg-white border px-1 rounded">C</kbd> anywhere to create an issue</span>
        </div>
      </div>
    </div>
  );
}
