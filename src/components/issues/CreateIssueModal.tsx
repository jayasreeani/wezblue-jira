'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { IssueType, Priority, BugSeverity } from '@/lib/types';
import { X, Bookmark, CheckSquare, Bug, Zap } from 'lucide-react';

export default function CreateIssueModal() {
  const { 
    isCreateModalOpen, setIsCreateModalOpen, currentProject, 
    users, epics, sprints, issues, createIssue, createEpic 
  } = useApp();

  const [type, setType] = useState<IssueType>('STORY');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [severity, setSeverity] = useState<BugSeverity>('MAJOR');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [estimatedHours, setEstimatedHours] = useState<number>(8);
  const [parentStoryId, setParentStoryId] = useState<string>('');
  const [plannedCompletionDate, setPlannedCompletionDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [epicId, setEpicId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>('');
  const [reproduceSteps, setReproduceSteps] = useState('');
  const [environment, setEnvironment] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [feature, setFeature] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [phase, setPhase] = useState('MVP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateModalOpen) return null;

  const userStories = issues.filter(i => i.type === 'STORY' && i.projectId === currentProject.id);
  const existingFeatures = Array.from(
    new Set(
      issues
        .filter(i => i.projectId === currentProject.id && i.feature)
        .map(i => i.feature as string)
    )
  );

  const linkedStory = userStories.find(us => us.id === parentStoryId);
  const linkedStoryEpic = linkedStory?.epic || (linkedStory?.epicId ? epics.find(e => e.id === linkedStory.epicId) : null);

  const handleParentStoryChange = (storyId: string) => {
    setParentStoryId(storyId);
    if (storyId) {
      const parent = issues.find(i => i.id === storyId);
      if (parent) {
        if (parent.epicId) setEpicId(parent.epicId);
        if (parent.feature) setFeature(parent.feature);
        if (parent.phase) setPhase(parent.phase);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !plannedCompletionDate) return;

    setIsSubmitting(true);

    if (type === 'EPIC') {
      await createEpic({
        projectId: currentProject.id,
        name: summary.trim(),
        summary: description.trim(),
        color: '#8777d9',
      });
    }

    await createIssue({
      projectId: currentProject.id,
      type,
      summary,
      description,
      priority,
      severity: type === 'BUG' ? severity : undefined,
      storyPoints: Number(storyPoints),
      estimatedHours: Number(estimatedHours),
      remainingHours: Number(estimatedHours),
      actualHours: 0,
      parentStoryId: (type === 'TASK' || type === 'BUG') ? (parentStoryId || undefined) : undefined,
      assigneeId: assigneeId || undefined,
      epicId: epicId || undefined,
      feature: feature.trim() || undefined,
      acceptanceCriteria: type === 'STORY' ? (acceptanceCriteria.trim() || undefined) : undefined,
      phase: phase || 'MVP',
      sprintId: sprintId || undefined,
      figmaUrl: figmaUrl.trim() || undefined,
      plannedCompletionDate: new Date(plannedCompletionDate).toISOString(),
      reproduceSteps: type === 'BUG' ? reproduceSteps : undefined,
      environment: type === 'BUG' ? environment : undefined,
    });
    setIsSubmitting(false);
    setIsCreateModalOpen(false);

    // Reset form
    setSummary('');
    setDescription('');
    setFeature('');
    setAcceptanceCriteria('');
    setPhase('MVP');
    setReproduceSteps('');
    setFigmaUrl('');
    setParentStoryId('');
  };

  const typeConfig: Record<IssueType, { label: string; icon: React.ReactNode; color: string }> = {
    STORY: { label: 'Story', icon: <Bookmark className="w-4 h-4 text-emerald-600" />, color: 'border-emerald-500' },
    TASK: { label: 'Task', icon: <CheckSquare className="w-4 h-4 text-blue-600" />, color: 'border-blue-500' },
    BUG: { label: 'Bug', icon: <Bug className="w-4 h-4 text-red-600" />, color: 'border-red-500' },
    EPIC: { label: 'Epic', icon: <Zap className="w-4 h-4 text-purple-600" />, color: 'border-purple-500' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-jira-border flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-jira-border flex items-center justify-between bg-jira-bg">
          <div>
            <h2 className="text-lg font-bold text-jira-text">Create Issue</h2>
            <p className="text-xs text-jira-subtle mt-0.5">Project: {currentProject.name} ({currentProject.key})</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1 rounded hover:bg-slate-200 text-jira-subtle transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Issue Type Selector (Story, Task, Bug) */}
          <div>
            <label className="block text-xs font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['STORY', 'TASK', 'BUG', 'EPIC'] as IssueType[]).map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs font-bold transition ${
                    type === t
                      ? 'bg-blue-50/80 border-jira-brand text-jira-brand shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {typeConfig[t].icon}
                  <span>{typeConfig[t].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link Task / Bug to a User Story */}
          {(type === 'TASK' || type === 'BUG') && (
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Link to User Story (Parent Requirement)
              </label>
              <select
                value={parentStoryId}
                onChange={e => handleParentStoryChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-emerald-300 rounded-lg bg-white outline-none font-medium text-emerald-950"
              >
                <option value="">None (Independent {type === 'TASK' ? 'Task' : 'Defect'})</option>
                {userStories.map(us => (
                  <option key={us.id} value={us.id}>
                    📖 {us.key}: {us.summary}
                  </option>
                ))}
              </select>

              {linkedStoryEpic && (
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded">
                  <Zap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Epic & Feature automatically mapped from Story</span>
                </div>
              )}
            </div>
          )}

          {/* Epic & Feature Mapping for User Story */}
          {type === 'STORY' && (
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2.5">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
                <span>Agile Hierarchy: Epic ➔ Feature</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Story Hierarchy</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Parent Epic <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={epicId}
                    onChange={e => setEpicId(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-emerald-300 rounded bg-white outline-none font-medium"
                  >
                    <option value="">Select Parent Epic...</option>
                    {epics.map(ep => (
                      <option key={ep.id} value={ep.id}>⚡ {ep.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Feature Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={feature}
                    onChange={e => setFeature(e.target.value)}
                    placeholder="e.g. Login via mobile OTP / email"
                    list="features-list"
                    className="w-full text-xs px-2.5 py-1.5 border border-emerald-300 rounded bg-white outline-none font-semibold text-slate-800"
                  />
                  <datalist id="features-list">
                    {existingFeatures.map((f, idx) => (
                      <option key={idx} value={f} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          )}

          {/* User Story Narrative / Summary */}
          <div>
            <label className="block text-xs font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
              {type === 'STORY' ? 'User Story Narrative' : 'Summary'} <span className="text-red-500">*</span>
            </label>
            {type === 'STORY' ? (
              <textarea
                rows={2}
                required
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="As a [role], I want [goal], so that [benefit]..."
                className="w-full text-sm px-3 py-2 border border-jira-border rounded-lg outline-none focus:border-jira-brand focus:ring-2 focus:ring-blue-100 transition font-medium"
              />
            ) : (
              <input
                type="text"
                required
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="e.g. Implement refresh token rotation service worker"
                className="w-full text-sm px-3 py-2 border border-jira-border rounded-lg outline-none focus:border-jira-brand focus:ring-2 focus:ring-blue-100 transition font-medium"
              />
            )}
          </div>

          {/* Dedicated Acceptance Criteria for User Stories */}
          {type === 'STORY' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-jira-subtle uppercase tracking-wider">
                  Acceptance Criteria (Given / When / Then)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!acceptanceCriteria) {
                      setAcceptanceCriteria(
                        "1. Given I enter a registered mobile/email, when I request a code, then a 6-digit OTP is sent within 30 seconds and expires after 5 minutes\n" +
                        "2. Given I enter a wrong OTP 5 times, when I try again, then login is blocked for 15 minutes and I see a clear message\n" +
                        "3. Given I enter an unregistered number, when I request a code, then I am told to use my invite or request to join a society\n" +
                        "4. Given I choose 'remember this device', when I reopen the app within 30 days, then I stay logged in"
                      );
                    }
                  }}
                  className="text-[10px] text-jira-brand hover:underline font-bold"
                >
                  ⚡ Insert Example Criteria
                </button>
              </div>
              <textarea
                rows={4}
                value={acceptanceCriteria}
                onChange={e => setAcceptanceCriteria(e.target.value)}
                placeholder={"1. Given [context], when [action], then [outcome]\n2. Given [context], when [action], then [outcome]"}
                className="w-full text-xs font-mono p-3 border border-jira-border rounded-lg outline-none focus:border-jira-brand focus:ring-2 focus:ring-blue-100 transition leading-relaxed"
              />
            </div>
          )}

          {/* Additional Description / Scope Notes */}
          <div>
            <label className="block text-xs font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
              {type === 'STORY' ? 'Additional Scope Notes / Context' : 'Description'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                type === 'STORY'
                  ? 'Any additional design dependencies, security considerations, or context...'
                  : type === 'BUG'
                  ? 'Describe the defect, observed vs expected behavior, and customer impact...'
                  : 'Describe the task requirements, technical scope, and implementation details...'
              }
              className="w-full text-sm px-3 py-2 border border-jira-border rounded-lg outline-none focus:border-jira-brand focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Bug-Specific Fields */}
          {type === 'BUG' && (
            <div className="p-4 bg-red-50/50 border border-red-200 rounded-lg space-y-3">
              <div className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Bug Details & Reproduction
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as BugSeverity)}
                    className="w-full text-xs px-2.5 py-1.5 border border-red-300 rounded bg-white outline-none font-medium"
                  >
                    <option value="CRITICAL">Critical (Blocks release)</option>
                    <option value="MAJOR">Major (Core flow broken)</option>
                    <option value="MINOR">Minor (Workaround exists)</option>
                    <option value="TRIVIAL">Trivial (UI/Cosmetic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Environment</label>
                  <input
                    type="text"
                    value={environment}
                    onChange={e => setEnvironment(e.target.value)}
                    placeholder="e.g. Production US-East, Chrome 129"
                    className="w-full text-xs px-2.5 py-1.5 border border-red-300 rounded bg-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Steps to Reproduce</label>
                <textarea
                  rows={2}
                  value={reproduceSteps}
                  onChange={e => setReproduceSteps(e.target.value)}
                  placeholder="1. Navigate to ...&#10;2. Click on ...&#10;3. Observe crash ..."
                  className="w-full text-xs px-2.5 py-1.5 border border-red-300 rounded bg-white outline-none"
                />
              </div>
            </div>
          )}

          {/* Figma Design Link */}
          <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded bg-purple-600 text-white font-black text-[10px] flex items-center justify-center">F</span>
                <span>Figma Design / Prototype Link</span>
              </label>
              <span className="text-[10px] text-purple-600 font-semibold">Optional</span>
            </div>
            <input
              type="url"
              value={figmaUrl}
              onChange={e => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/design/... or https://www.figma.com/file/..."
              className="w-full text-xs px-3 py-2 border border-purple-300 rounded-lg bg-white outline-none focus:border-purple-600 font-medium"
            />
            <p className="text-[10px] text-slate-500">
              Paste a Figma file, frame, or prototype URL to automatically attach interactive design specs.
            </p>
          </div>

          {/* Planned Completion Date & Estimation */}
          <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-lg space-y-3">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Planning & Estimation (Hours & Story Points)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Target Phase
                </label>
                <select
                  value={phase}
                  onChange={e => setPhase(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none font-bold text-emerald-800"
                >
                  <option value="MVP">MVP (Initial Release)</option>
                  <option value="Phase 1">Phase 1</option>
                  <option value="Phase 2">Phase 2</option>
                  <option value="Phase 3">Phase 3</option>
                  <option value="Post-MVP">Post-MVP</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Planned Completion <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={plannedCompletionDate}
                  onChange={e => setPlannedCompletionDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={estimatedHours}
                  onChange={e => setEstimatedHours(Number(e.target.value))}
                  placeholder="e.g. 8"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none font-bold text-jira-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Story Points
                </label>
                <select
                  value={storyPoints}
                  onChange={e => setStoryPoints(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white outline-none font-bold"
                >
                  <option value={1}>1 Point</option>
                  <option value={2}>2 Points</option>
                  <option value={3}>3 Points</option>
                  <option value={5}>5 Points</option>
                  <option value={8}>8 Points</option>
                  <option value={13}>13 Points</option>
                </select>
              </div>
            </div>
          </div>

          {/* Meta Grid: Priority, Sprint, Epic, Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full text-xs px-3 py-2 border border-jira-border rounded-lg bg-white outline-none font-medium"
              >
                <option value="HIGHEST">Highest (P0)</option>
                <option value="HIGH">High (P1)</option>
                <option value="MEDIUM">Medium (P2)</option>
                <option value="LOW">Low (P3)</option>
                <option value="LOWEST">Lowest (P4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-jira-border rounded-lg bg-white outline-none font-medium"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Sprint
              </label>
              <select
                value={sprintId}
                onChange={e => setSprintId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-jira-border rounded-lg bg-white outline-none font-medium"
              >
                <option value="">Product Backlog</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
              </select>
            </div>

            {type !== 'STORY' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-jira-subtle uppercase tracking-wider">
                    Linked Epic
                  </label>
                  {linkedStoryEpic && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ⚡ Auto-mapped from Story
                    </span>
                  )}
                </div>
                <select
                  value={epicId}
                  onChange={e => setEpicId(e.target.value)}
                  className={`w-full text-xs px-3 py-2 border rounded-lg bg-white outline-none font-medium ${
                    linkedStoryEpic ? 'border-emerald-300 bg-emerald-50/20' : 'border-jira-border'
                  }`}
                >
                  <option value="">None</option>
                  {epics.map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-jira-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !summary.trim() || !plannedCompletionDate}
              className="px-5 py-2 text-xs font-bold text-white bg-jira-brand hover:bg-jira-brandHover rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
