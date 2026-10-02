'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Zap, Plus, CheckCircle2, ListTodo, Bookmark, Bug, CheckSquare } from 'lucide-react';
import { IssueType } from '@/lib/types';

export default function EpicsView() {
  const { epics, issues, currentProject, setSelectedIssue, permissions, refreshData, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [color, setColor] = useState('#8777d9');

  const typeIcons: Record<IssueType, React.ReactNode> = {
    STORY: <Bookmark className="w-3 h-3 text-emerald-600" />,
    TASK: <CheckSquare className="w-3 h-3 text-blue-600" />,
    BUG: <Bug className="w-3 h-3 text-red-600" />,
    EPIC: <Zap className="w-3 h-3 text-purple-600" />,
  };

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/epics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          name: name.trim(),
          summary: summary.trim(),
          color,
        }),
      });
      if (res.ok) {
        showToast('Epic created successfully', 'success');
        setName('');
        setSummary('');
        setIsModalOpen(false);
        refreshData();
      }
    } catch (err) {
      showToast('Failed to create epic', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Epics & Product Roadmap</h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            High-level initiatives, strategic themes, and cross-sprint milestone tracking.
          </p>
        </div>

        {permissions.canCreateIssue && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Epic</span>
          </button>
        )}
      </div>

      {/* Epics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {epics.map(epic => {
          const childIssues = issues.filter(i => i.epicId === epic.id);
          const totalPoints = childIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
          const doneIssues = childIssues.filter(i => i.status === 'DONE');
          const donePoints = doneIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
          const percent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : (childIssues.length > 0 && doneIssues.length === childIssues.length ? 100 : 0);

          return (
            <div
              key={epic.id}
              className="bg-white rounded-xl border border-jira-border shadow-xs hover:shadow-md transition p-5 space-y-4"
            >
              {/* Epic Title & Color Pill */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    style={{ backgroundColor: epic.color }}
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-jira-text">{epic.name}</h3>
                    <span className="text-[11px] text-slate-500">{childIssues.length} linked issues</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  percent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {percent === 100 ? 'COMPLETED' : 'IN PROGRESS'}
                </span>
              </div>

              {epic.summary && (
                <p className="text-xs text-slate-600 leading-relaxed">{epic.summary}</p>
              )}

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Completion</span>
                  <span className="text-jira-text">{percent}% ({donePoints}/{totalPoints} pts)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    style={{ width: `${percent}%`, backgroundColor: epic.color }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Child Issues Quick List */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1">
                  Linked Issues
                </div>
                {childIssues.slice(0, 4).map(child => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedIssue(child)}
                    className="p-1.5 rounded hover:bg-slate-50 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      {typeIcons[child.type]}
                      <span className="font-bold text-blue-600 text-[11px]">{child.key}</span>
                      <span className="text-slate-700 truncate">{child.summary}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {child.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Epic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateEpic} className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4">
            <h2 className="text-base font-bold text-jira-text">Create New Epic</h2>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Epic Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Zero-Trust Gateway Integration"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Strategic Summary</label>
              <textarea
                rows={3}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Describe business outcomes, high-level deliverables..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Color Theme</label>
              <div className="flex items-center space-x-2">
                {['#8777d9', '#0052cc', '#36b37e', '#ff8b00', '#ff5630', '#00b8d9'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded shadow-xs"
              >
                Create Epic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
