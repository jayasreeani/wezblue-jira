'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { IssueStatus, IssueType, Priority } from '@/lib/types';
import { 
  Bookmark, CheckSquare, Bug, Zap, Calendar, 
  CheckCircle, CheckCircle2, Plus, Sparkles, Check, ChevronRight, Clock 
} from 'lucide-react';

export default function ScrumBoard() {
  const { 
    issues, sprints, currentProject, moveIssueStatus, 
    setSelectedIssue, setIsCreateModalOpen, permissions, refreshData, showToast 
  } = useApp();

  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');

  // Active sprint
  const activeSprint = sprints.find(s => s.status === 'ACTIVE') || sprints[0];
  const activeIssues = issues.filter(i => {
    if (i.sprintId !== activeSprint?.id) return false;
    if (selectedPhase !== 'ALL' && (i.phase || 'MVP') !== selectedPhase) return false;
    return true;
  });

  // Exact 6 flow stages requested: To do, In Progress, Under Review, In QA, In Stakeholder validation, Done
  const columns: { id: IssueStatus; title: string; color: string }[] = [
    { id: 'TODO', title: 'TO DO', color: 'border-blue-400' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: 'border-amber-400' },
    { id: 'UNDER_REVIEW', title: 'UNDER REVIEW', color: 'border-purple-400' },
    { id: 'IN_QA', title: 'IN QA', color: 'border-indigo-400' },
    { id: 'IN_STAKEHOLDER_VALIDATION', title: 'IN STAKEHOLDER VALIDATION', color: 'border-pink-400' },
    { id: 'DONE', title: 'DONE', color: 'border-emerald-400' },
  ];

  const totalPoints = activeIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = activeIssues.filter(i => i.status === 'DONE').reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const progressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const totalEstHours = activeIssues.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);
  const totalActualHours = activeIssues.reduce((sum, i) => sum + (i.actualHours || 0), 0);
  const totalRemainingHours = activeIssues.reduce((sum, i) => sum + (i.remainingHours ?? i.estimatedHours ?? 0), 0);

  const priorityBadges: Record<Priority, { label: string; color: string }> = {
    HIGHEST: { label: 'P0', color: 'text-red-700 bg-red-100' },
    HIGH: { label: 'P1', color: 'text-orange-700 bg-orange-100' },
    MEDIUM: { label: 'P2', color: 'text-yellow-700 bg-yellow-100' },
    LOW: { label: 'P3', color: 'text-blue-700 bg-blue-100' },
    LOWEST: { label: 'P4', color: 'text-slate-600 bg-slate-100' },
  };

  const typeIcons: Record<IssueType, React.ReactNode> = {
    STORY: <Bookmark className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
    TASK: <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />,
    BUG: <Bug className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />,
    EPIC: <Zap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />,
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedIssueId(id);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      await moveIssueStatus(issueId, targetStatus);
    }
    setDraggedIssueId(null);
  };

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    try {
      const res = await fetch(`/api/sprints/${activeSprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPLETE' }),
      });
      if (res.ok) {
        showToast(`Sprint ${activeSprint.name} completed! Velocity: ${donePoints} pts`, 'success');
        setIsCompleteModalOpen(false);
        refreshData();
      }
    } catch (err) {
      showToast('Failed to complete sprint', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100/50">
      {/* Active Sprint Header */}
      <div className="p-4 bg-white border-b border-jira-border space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                ACTIVE SPRINT
              </span>
              <h1 className="text-xl font-extrabold text-jira-text tracking-tight">
                {activeSprint ? activeSprint.name : 'No Active Sprint'}
              </h1>
            </div>
            {activeSprint?.goal && (
              <p className="text-xs text-jira-subtle mt-1 font-medium">
                🎯 Goal: {activeSprint.goal}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {permissions.canStartCompleteSprint && activeSprint && (
              <button
                onClick={() => setIsCompleteModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md shadow-xs transition"
              >
                Complete Sprint
              </button>
            )}
            {permissions.canCreateIssue && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-md shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Issue</span>
              </button>
            )}
          </div>
        </div>

        {/* Sprint Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Ends Oct 6, 2026 (4 days left)</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">Sprint Health:</span>
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-extrabold text-emerald-700">{progressPercent}%</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 font-semibold text-xs">
            <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <span className="text-slate-500">Points:</span>
              <span className="text-slate-800">{totalPoints} committed</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">{donePoints} done</span>
            </div>

            <div className="flex items-center space-x-2 bg-blue-50/60 px-2 py-1 rounded border border-blue-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500">Hours:</span>
              <span className="text-blue-900 font-bold">{totalEstHours}h est</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">{totalActualHours}h logged</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{totalRemainingHours}h rem</span>
            </div>

            {/* Phase Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phase:</span>
              <select
                value={selectedPhase}
                onChange={e => setSelectedPhase(e.target.value)}
                className="text-xs bg-transparent font-bold text-emerald-800 outline-none cursor-pointer"
              >
                <option value="ALL">All Phases</option>
                <option value="MVP">MVP</option>
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option>
                <option value="Post-MVP">Post-MVP</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto p-4 flex space-x-3.5">
        {columns.map(col => {
          const colIssues = activeIssues.filter(i => i.status === col.id);
          const colPoints = colIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
          const colHours = colIssues.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);

          return (
            <div
              key={col.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.id)}
              className="w-72 flex-shrink-0 flex flex-col bg-slate-200/60 rounded-xl border border-jira-border/80 max-h-full"
            >
              <div className="p-3 flex items-center justify-between border-b border-jira-border bg-slate-200/80 rounded-t-xl select-none">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs tracking-wider text-slate-700 truncate max-w-[140px]">{col.title}</span>
                  <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-300 text-slate-800">
                    {colIssues.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 bg-white/70 px-1.5 py-0.5 rounded">
                  {colHours > 0 && <span>{colHours}h</span>}
                  {colHours > 0 && colPoints > 0 && <span>•</span>}
                  {colPoints > 0 && <span>{colPoints} pts</span>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {colIssues.map(issue => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={e => handleDragStart(e, issue.id)}
                    onClick={() => setSelectedIssue(issue)}
                    className="p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition space-y-2 group"
                  >
                    {/* Top Row: Type & Key & Phase */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {typeIcons[issue.type]}
                        <span className="font-extrabold text-[11px] text-blue-600 group-hover:underline truncate">
                          {issue.key}
                        </span>
                        {issue.phase && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                            {issue.phase}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${priorityBadges[issue.priority].color}`}>
                        {priorityBadges[issue.priority].label}
                      </span>
                    </div>

                    {/* Feature Badge if assigned */}
                    {issue.feature && (
                      <div className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate" title={`Feature: ${issue.feature}`}>
                        📁 <span className="font-semibold text-blue-600">Feat:</span> {issue.feature}
                      </div>
                    )}

                    {/* Linked User Story Tag for Task / Bug */}
                    {issue.parentStory && (
                      <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate flex items-center space-x-1">
                        <Bookmark className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">Story: {issue.parentStory.key}</span>
                      </div>
                    )}

                    <p className="text-xs font-semibold text-jira-text leading-snug line-clamp-3">
                      {issue.summary}
                    </p>

                    {/* Planned Completion Date */}
                    {issue.plannedCompletionDate && (
                      <div className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Target: {new Date(issue.plannedCompletionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}

                    {/* Actual Completion Date if DONE */}
                    {issue.status === 'DONE' && issue.actualCompletionDate && (
                      <div className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed: {new Date(issue.actualCompletionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}

                    {/* Figma Design Specs Tag */}
                    {issue.figmaUrl && (
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 w-fit">
                        <span className="w-3 h-3 rounded bg-purple-600 text-white font-black text-[8px] flex items-center justify-center">F</span>
                        <span>Figma Specs</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        {issue.estimatedHours ? (
                          <span 
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200"
                            title={`Logged: ${issue.actualHours || 0}h / Estimated: ${issue.estimatedHours}h`}
                          >
                            ⏱️ {issue.actualHours || 0}/{issue.estimatedHours}h
                          </span>
                        ) : null}

                        {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                          <span 
                            className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-200"
                            title="Story Points"
                          >
                            {issue.storyPoints}
                          </span>
                        )}
                      </div>

                      {issue.assignee && (
                        <img
                          src={issue.assignee.avatar}
                          alt={issue.assignee.name}
                          title={issue.assignee.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-200"
                        />
                      )}
                    </div>
                  </div>
                ))}

                {colIssues.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-300/70 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">
                    Drop active issue here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Sprint Dialog Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4">
            <h2 className="text-base font-bold text-jira-text">Complete {activeSprint?.name}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This sprint contains:
              <br />• <b>{activeIssues.filter(i => i.status === 'DONE').length} completed issues</b> ({donePoints} story points)
              <br />• <b>{activeIssues.filter(i => i.status !== 'DONE').length} open issues</b> ({totalPoints - donePoints} story points)
            </p>

            <div className="text-xs text-slate-600">
              Open issues will automatically carry over to the Product Backlog or next upcoming sprint.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSprint}
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded shadow-xs"
              >
                Confirm & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
