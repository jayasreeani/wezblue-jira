'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Issue, IssueStatus, IssueType, Priority } from '@/lib/types';
import { 
  Bookmark, CheckSquare, Bug, Zap, Search, 
  Filter, CheckCircle2, User as UserIcon, Plus, Clock, Calendar 
} from 'lucide-react';

export default function KanbanBoard() {
  const { 
    issues, currentProject, moveIssueStatus, 
    setSelectedIssue, setIsCreateModalOpen, currentUser, users, permissions 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [showBacklogCol, setShowBacklogCol] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  // Exact 6 flow stages requested: To do, In Progress, Under Review, In QA, In Stakeholder validation, Done
  const baseColumns: { id: IssueStatus; title: string; color: string }[] = [
    { id: 'TODO', title: 'TO DO', color: 'border-blue-400' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: 'border-amber-400' },
    { id: 'UNDER_REVIEW', title: 'UNDER REVIEW', color: 'border-purple-400' },
    { id: 'IN_QA', title: 'IN QA', color: 'border-indigo-400' },
    { id: 'IN_STAKEHOLDER_VALIDATION', title: 'IN STAKEHOLDER VALIDATION', color: 'border-pink-400' },
    { id: 'DONE', title: 'DONE', color: 'border-emerald-400' },
  ];

  const columns = showBacklogCol 
    ? [{ id: 'BACKLOG' as IssueStatus, title: 'BACKLOG', color: 'border-slate-300' }, ...baseColumns]
    : baseColumns;

  const typeIcons: Record<IssueType, React.ReactNode> = {
    STORY: <Bookmark className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
    TASK: <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />,
    BUG: <Bug className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />,
    EPIC: <Zap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />,
  };

  const priorityBadges: Record<Priority, { label: string; color: string }> = {
    HIGHEST: { label: 'P0', color: 'text-red-700 bg-red-100' },
    HIGH: { label: 'P1', color: 'text-orange-700 bg-orange-100' },
    MEDIUM: { label: 'P2', color: 'text-yellow-700 bg-yellow-100' },
    LOW: { label: 'P3', color: 'text-blue-700 bg-blue-100' },
    LOWEST: { label: 'P4', color: 'text-slate-600 bg-slate-100' },
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (onlyMyIssues && issue.assigneeId !== currentUser.id) return false;
    if (selectedType !== 'ALL' && issue.type !== selectedType) return false;
    if (selectedAssignee !== 'ALL' && issue.assigneeId !== selectedAssignee) return false;
    if (selectedPhase !== 'ALL' && (issue.phase || 'MVP') !== selectedPhase) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        issue.key.toLowerCase().includes(q) ||
        issue.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedIssueId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      await moveIssueStatus(issueId, targetStatus);
    }
    setDraggedIssueId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100/50">
      {/* Board Header & Controls */}
      <div className="p-4 bg-white border-b border-jira-border space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Kanban Board</h1>
            <p className="text-xs text-jira-subtle mt-0.5">
              Flow: To Do ➔ In Progress ➔ Under Review ➔ In QA ➔ In Stakeholder Validation ➔ Done
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBacklogCol(!showBacklogCol)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                showBacklogCol ? 'bg-slate-800 text-white' : 'bg-white border-jira-border text-slate-700 hover:bg-slate-50'
              }`}
            >
              {showBacklogCol ? 'Hide Backlog' : 'Show Backlog Column'}
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-md shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Issue</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-jira-subtle absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by keyword..."
                className="pl-8 pr-3 py-1.5 bg-jira-bg border border-jira-border rounded-md text-xs outline-none focus:border-jira-brand font-medium w-48"
              />
            </div>

            <button
              onClick={() => setOnlyMyIssues(!onlyMyIssues)}
              className={`px-3 py-1.5 rounded-md font-semibold border transition ${
                onlyMyIssues
                  ? 'bg-blue-100 border-jira-brand text-jira-brand'
                  : 'bg-white border-jira-border text-slate-700 hover:bg-slate-50'
              }`}
            >
              Only My Issues
            </button>

            <div className="flex items-center bg-jira-bg p-0.5 rounded-md border border-jira-border">
              {['ALL', 'STORY', 'TASK', 'BUG'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    selectedType === t
                      ? 'bg-white text-jira-brand shadow-xs'
                      : 'text-slate-600 hover:text-jira-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1 pl-1">
              <button
                onClick={() => setSelectedAssignee('ALL')}
                className={`text-[11px] font-bold px-2 py-1 rounded border transition ${
                  selectedAssignee === 'ALL' ? 'bg-slate-200 border-slate-300' : 'bg-white border-jira-border'
                }`}
              >
                All
              </button>
              {users.map(u => (
                <img
                  key={u.id}
                  src={u.avatar}
                  alt={u.name}
                  title={u.name}
                  onClick={() => setSelectedAssignee(selectedAssignee === u.id ? 'ALL' : u.id)}
                  className={`w-6 h-6 rounded-full object-cover cursor-pointer border-2 transition ${
                    selectedAssignee === u.id ? 'border-jira-brand ring-2 ring-blue-200 scale-110' : 'border-white hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            {/* Phase Filter */}
            <div className="flex items-center space-x-1.5 bg-jira-bg px-2 py-1 rounded-md border border-jira-border">
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

          <div className="text-xs text-jira-subtle font-medium">
            Showing <span className="font-bold text-jira-text">{filteredIssues.length}</span> issues
          </div>
        </div>
      </div>

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto p-4 flex space-x-3.5">
        {columns.map(col => {
          const colIssues = filteredIssues.filter(i => i.status === col.id);
          const totalPoints = colIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
          const totalHours = colIssues.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              className="w-72 flex-shrink-0 flex flex-col bg-slate-200/60 rounded-xl border border-jira-border/80 max-h-full"
            >
              {/* Column Header */}
              <div className="p-3 flex items-center justify-between border-b border-jira-border bg-slate-200/80 rounded-t-xl select-none">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs tracking-wider text-slate-700 truncate max-w-[150px]">
                    {col.title}
                  </span>
                  <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-300/80 text-slate-800">
                    {colIssues.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 bg-white/70 px-1.5 py-0.5 rounded">
                  {totalHours > 0 && <span>{totalHours}h</span>}
                  {totalHours > 0 && totalPoints > 0 && <span>•</span>}
                  {totalPoints > 0 && <span>{totalPoints} pts</span>}
                </div>
              </div>

              {/* Cards List */}
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

                    {/* Summary */}
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

                    {/* Bottom Row: Hours & Story Points & Assignee */}
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

                      {issue.assignee ? (
                        <img
                          src={issue.assignee.avatar}
                          alt={issue.assignee.name}
                          title={issue.assignee.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                          <UserIcon className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Fast Status Transition Stepper on Card */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-1.5">
                        <select
                          value={issue.status}
                          onChange={async (e) => {
                            e.stopPropagation();
                            await moveIssueStatus(issue.id, e.target.value as IssueStatus);
                          }}
                          disabled={!permissions.canTransitionIssueStatus}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 outline-none hover:bg-slate-100 cursor-pointer max-w-[130px] truncate"
                          title="Change Issue Status"
                        >
                          <option value="BACKLOG">BACKLOG</option>
                          <option value="TODO">TO DO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="UNDER_REVIEW">UNDER REVIEW</option>
                          <option value="IN_QA">IN QA</option>
                          <option value="IN_STAKEHOLDER_VALIDATION">STAKEHOLDER</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </div>

                      {issue.status !== 'DONE' && permissions.canTransitionIssueStatus && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const flow: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'IN_QA', 'IN_STAKEHOLDER_VALIDATION', 'DONE'];
                            const curIdx = flow.indexOf(issue.status);
                            const nextStatus = curIdx >= 0 && curIdx < flow.length - 1 ? flow[curIdx + 1] : 'IN_PROGRESS';
                            await moveIssueStatus(issue.id, nextStatus);
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-jira-brand rounded border border-blue-200 transition flex items-center space-x-0.5 shadow-2xs"
                          title="Advance to next workflow stage"
                        >
                          <span>Next</span>
                          <span>➔</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colIssues.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-300/70 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">
                    Drop issue here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
