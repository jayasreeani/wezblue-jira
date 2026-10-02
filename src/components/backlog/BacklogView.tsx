'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Issue, Sprint, IssueType } from '@/lib/types';
import { 
  Bookmark, CheckSquare, Bug, Zap, Plus, 
  Play, CheckCircle2, ChevronDown, ChevronRight, MoreHorizontal, ArrowRight, Clock, Calendar, FileSpreadsheet 
} from 'lucide-react';

export default function BacklogView() {
  const { 
    issues, sprints, currentProject, updateIssue, 
    setSelectedIssue, setIsCreateModalOpen, setIsBulkUploadOpen, permissions, refreshData, showToast 
  } = useApp();

  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({
    'sprint-24': true,
    'sprint-25': true,
    'backlog': true,
  });

  const [newSprintName, setNewSprintName] = useState('');
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedSprints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const typeIcons: Record<IssueType, React.ReactNode> = {
    STORY: <Bookmark className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
    TASK: <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />,
    BUG: <Bug className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />,
    EPIC: <Zap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />,
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;

    try {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          name: newSprintName.trim(),
        }),
      });
      if (res.ok) {
        showToast('Sprint created successfully', 'success');
        setNewSprintName('');
        setIsCreatingSprint(false);
        refreshData();
      }
    } catch (err) {
      showToast('Failed to create sprint', 'error');
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      const res = await fetch(`/api/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START' }),
      });
      if (res.ok) {
        showToast('Sprint is now ACTIVE!', 'success');
        refreshData();
      }
    } catch (err) {
      showToast('Failed to start sprint', 'error');
    }
  };

  const handleMoveIssueToSprint = async (issueId: string, sprintId: string | null) => {
    await updateIssue(issueId, { sprintId: sprintId || undefined });
  };

  const backlogIssues = issues.filter(i => !i.sprintId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Backlog & Sprint Grooming</h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            Plan upcoming sprints, groom backlog user stories, and estimate team capacity.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {permissions.canCreateSprint && (
            <button
              onClick={() => setIsCreatingSprint(true)}
              className="px-3.5 py-1.5 bg-white border border-jira-border hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md shadow-xs transition"
            >
              + Create Sprint
            </button>
          )}
          {permissions.canCreateIssue && (
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-md shadow-xs transition"
              title="Bulk Upload User Stories via Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Excel</span>
            </button>
          )}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Create Sprint Dialog */}
      {isCreatingSprint && (
        <form onSubmit={handleCreateSprint} className="p-4 bg-white rounded-xl border border-jira-brand shadow-sm flex items-center space-x-3">
          <input
            type="text"
            required
            autoFocus
            value={newSprintName}
            onChange={e => setNewSprintName(e.target.value)}
            placeholder="Sprint Name (e.g. Wezblue Sprint 26 - Microservices V2)"
            className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-jira-brand text-white text-xs font-bold rounded hover:bg-jira-brandHover"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingSprint(false)}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Sprints Containers */}
      <div className="space-y-5">
        {sprints.map(sprint => {
          const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
          const totalPts = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
          const totalHours = sprintIssues.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);
          const loggedHours = sprintIssues.reduce((sum, i) => sum + (i.actualHours || 0), 0);
          const isExpanded = expandedSprints[sprint.id] ?? true;

          return (
            <div key={sprint.id} className="bg-white rounded-xl border border-jira-border shadow-xs overflow-hidden">
              {/* Sprint Container Header */}
              <div className="p-3.5 bg-slate-50 border-b border-jira-border flex items-center justify-between select-none">
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => toggleExpand(sprint.id)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <span className="font-bold text-xs text-jira-text">{sprint.name}</span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    sprint.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sprint.status === 'COMPLETED'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sprint.status}
                  </span>

                  <span className="text-xs text-slate-400 font-medium">
                    ({sprintIssues.length} issues • {totalPts} pts • {loggedHours}/{totalHours}h)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {sprint.status === 'FUTURE' && permissions.canStartCompleteSprint && (
                    <button
                      onClick={() => handleStartSprint(sprint.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded flex items-center space-x-1 shadow-xs transition"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Sprint</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sprint Issues List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {sprintIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className="p-3 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer transition text-xs group"
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-4">
                        {typeIcons[issue.type]}
                        <span className="font-bold text-blue-600 text-xs flex-shrink-0">{issue.key}</span>
                        <span className="font-medium text-jira-text truncate">{issue.summary}</span>
                        
                        {issue.phase && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                            {issue.phase}
                          </span>
                        )}

                        {issue.feature && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 flex-shrink-0 max-w-[140px] truncate" title={`Feature: ${issue.feature}`}>
                            📁 {issue.feature}
                          </span>
                        )}

                        {issue.parentStory && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate flex items-center space-x-1 flex-shrink-0">
                            <Bookmark className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                            <span>Story: {issue.parentStory.key}</span>
                          </span>
                        )}

                        {issue.epic && (
                          <span
                            style={{ backgroundColor: issue.epic.color + '20', color: issue.epic.color }}
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase truncate max-w-[120px]"
                          >
                            ⚡ {issue.epic.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        {issue.plannedCompletionDate && (
                          <span className="text-[10px] font-medium text-slate-500 hidden md:flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Target: {new Date(issue.plannedCompletionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </span>
                        )}

                        {issue.estimatedHours ? (
                          <span 
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center space-x-1"
                            title={`Logged: ${issue.actualHours || 0}h / Estimated: ${issue.estimatedHours}h`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{issue.actualHours || 0}/{issue.estimatedHours}h</span>
                          </span>
                        ) : null}

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {issue.status.replace('_', ' ')}
                        </span>

                        {issue.storyPoints !== undefined && (
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold flex items-center justify-center border border-slate-200">
                            {issue.storyPoints}
                          </span>
                        )}

                        {issue.assignee && (
                          <img
                            src={issue.assignee.avatar}
                            alt={issue.assignee.name}
                            title={issue.assignee.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        )}

                        {/* Move back to Backlog dropdown or button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveIssueToSprint(issue.id, null);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-800 font-semibold px-2 py-1 rounded hover:bg-slate-200 transition"
                          title="Move to Product Backlog"
                        >
                          Move to Backlog
                        </button>
                      </div>
                    </div>
                  ))}

                  {sprintIssues.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 font-medium">
                      Plan this sprint by dragging or moving issues from the Backlog bucket below.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Backlog Section */}
        <div className="bg-white rounded-xl border border-jira-border shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-jira-border flex items-center justify-between select-none">
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => toggleExpand('backlog')}
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
              >
                {expandedSprints['backlog'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <span className="font-bold text-xs text-jira-text">Product Backlog</span>
              <span className="text-xs text-slate-400 font-medium">
                ({backlogIssues.length} issues)
              </span>
            </div>
          </div>

          {expandedSprints['backlog'] && (
            <div className="divide-y divide-slate-100">
              {backlogIssues.map(issue => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="p-3 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer transition text-xs group"
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-4">
                    {typeIcons[issue.type]}
                    <span className="font-bold text-blue-600 text-xs flex-shrink-0">{issue.key}</span>
                    <span className="font-medium text-jira-text truncate">{issue.summary}</span>

                    {issue.phase && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                        {issue.phase}
                      </span>
                    )}

                    {issue.feature && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 flex-shrink-0 max-w-[140px] truncate" title={`Feature: ${issue.feature}`}>
                        📁 {issue.feature}
                      </span>
                    )}

                    {issue.parentStory && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate flex items-center space-x-1 flex-shrink-0">
                        <Bookmark className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                        <span>Story: {issue.parentStory.key}</span>
                      </span>
                    )}

                    {issue.epic && (
                      <span
                        style={{ backgroundColor: issue.epic.color + '20', color: issue.epic.color }}
                        className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase truncate max-w-[120px]"
                      >
                        ⚡ {issue.epic.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {issue.plannedCompletionDate && (
                      <span className="text-[10px] font-medium text-slate-500 hidden md:flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Target: {new Date(issue.plannedCompletionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </span>
                    )}

                    {issue.estimatedHours ? (
                      <span 
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center space-x-1"
                        title={`Logged: ${issue.actualHours || 0}h / Estimated: ${issue.estimatedHours}h`}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>{issue.actualHours || 0}/{issue.estimatedHours}h</span>
                      </span>
                    ) : null}

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {issue.status.replace('_', ' ')}
                    </span>

                    {/* Move to Active or Upcoming Sprint Selector */}
                    {sprints.length > 0 && (
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleMoveIssueToSprint(issue.id, e.target.value)}
                        defaultValue=""
                        className="text-[10px] px-2 py-1 rounded border border-slate-200 bg-white font-semibold text-jira-brand cursor-pointer outline-none"
                      >
                        <option value="" disabled>Move to Sprint...</option>
                        {sprints.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}

              {backlogIssues.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  Backlog is clean! All issues are currently scheduled in active or future sprints.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
