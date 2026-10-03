'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { IssueStatus, Priority, IssueType, WorkLog } from '@/lib/types';
import { 
  X, Trash2, CheckSquare, Plus, MessageSquare, 
  History, Paperclip, Send, Bookmark, Bug, Zap, AlertCircle, 
  FileText, Clock, Calendar, CheckCircle2, ChevronRight, Timer, ArrowUpRight,
  ExternalLink, Copy, Check, Eye, EyeOff, BookOpen, Sparkles 
} from 'lucide-react';

export default function IssueDetailDrawer() {
  const { 
    selectedIssue, setSelectedIssue, updateIssue, deleteIssue, moveIssueStatus,
    users, sprints, epics, issues, permissions, currentProject, currentUser, showToast,
    docs, openDocInConfluence, setIsRovoOpen, askRovo
  } = useApp();

  const [activeTab, setActiveTab] = useState<'comments' | 'worklogs' | 'activity'>('comments');
  const [commentText, setCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isLinkingDoc, setIsLinkingDoc] = useState(false);
  const [selectedDocToLink, setSelectedDocToLink] = useState('');

  // Acceptance criteria & Feature & Phase edit states
  const [isEditingAC, setIsEditingAC] = useState(false);
  const [acText, setAcText] = useState('');
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [featureText, setFeatureText] = useState('');

  // Figma state
  const [isEditingFigma, setIsEditingFigma] = useState(false);
  const [figmaInput, setFigmaInput] = useState('');
  const [showFigmaEmbed, setShowFigmaEmbed] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Work logging modal/state
  const [isLogWorkOpen, setIsLogWorkOpen] = useState(false);
  const [logHours, setLogHours] = useState<number>(2);
  const [logComment, setLogComment] = useState('');

  useEffect(() => {
    if (selectedIssue) {
      setSummaryText(selectedIssue.summary);
      setAcText(selectedIssue.acceptanceCriteria || '');
      setFeatureText(selectedIssue.feature || '');
    }
  }, [selectedIssue]);

  if (!selectedIssue) return null;

  const userStories = issues.filter(i => i.type === 'STORY' && i.projectId === currentProject.id);
  const linkedChildIssues = issues.filter(i => i.parentStoryId === selectedIssue.id);

  const handleStatusChange = async (newStatus: IssueStatus) => {
    setSelectedIssue({ ...selectedIssue, status: newStatus });
    await moveIssueStatus(selectedIssue.id, newStatus);
  };

  const handleAssigneeChange = async (userId: string) => {
    await updateIssue(selectedIssue.id, { assigneeId: userId || undefined });
  };

  const handlePriorityChange = async (priority: Priority) => {
    await updateIssue(selectedIssue.id, { priority });
  };

  const handleSprintChange = async (sprintId: string) => {
    await updateIssue(selectedIssue.id, { sprintId: sprintId || undefined });
  };

  const handleParentStoryChange = async (storyId: string) => {
    let targetEpicId = selectedIssue.epicId;
    let targetFeature = selectedIssue.feature;
    let targetPhase = selectedIssue.phase;
    if (storyId) {
      const parent = issues.find(i => i.id === storyId);
      if (parent) {
        if (parent.epicId) targetEpicId = parent.epicId;
        if (parent.feature) targetFeature = parent.feature;
        if (parent.phase) targetPhase = parent.phase;
      }
    }
    const updated = await updateIssue(selectedIssue.id, { 
      parentStoryId: storyId || undefined,
      epicId: targetEpicId || undefined,
      feature: targetFeature || undefined,
      phase: targetPhase || undefined,
    });
    if (updated) {
      setSelectedIssue(updated);
      const parent = storyId ? issues.find(i => i.id === storyId) : null;
      if (parent) {
        showToast(`Linked to ${parent.key} — Epic, Feature & Phase mapped from Story!`, 'success');
      }
    }
  };

  const handleSaveAC = async () => {
    const updated = await updateIssue(selectedIssue.id, { acceptanceCriteria: acText.trim() || undefined });
    if (updated) setSelectedIssue(updated);
    setIsEditingAC(false);
    showToast('Acceptance criteria updated', 'success');
  };

  const handleSaveFeature = async (val?: string) => {
    const fVal = (val !== undefined ? val : featureText).trim();
    const updated = await updateIssue(selectedIssue.id, { feature: fVal || undefined });
    if (updated) setSelectedIssue(updated);
    setIsEditingFeature(false);
    showToast('Feature updated', 'success');
  };

  const handlePhaseChange = async (phase: string) => {
    const updated = await updateIssue(selectedIssue.id, { phase });
    if (updated) setSelectedIssue(updated);
    showToast(`Phase updated to ${phase}`, 'success');
  };

  const handlePlannedDateChange = async (dateStr: string) => {
    await updateIssue(selectedIssue.id, { 
      plannedCompletionDate: dateStr ? new Date(dateStr).toISOString() : undefined 
    });
  };

  const handleEstimatedHoursChange = async (hours: number) => {
    const remaining = Math.max(0, hours - (selectedIssue.actualHours || 0));
    await updateIssue(selectedIssue.id, { 
      estimatedHours: hours,
      remainingHours: remaining,
    });
  };

  const handleSaveSummary = async () => {
    if (summaryText.trim() && summaryText !== selectedIssue.summary) {
      await updateIssue(selectedIssue.id, { summary: summaryText });
    }
    setIsEditingSummary(false);
  };

  const handleSaveFigmaUrl = async (urlToSave?: string) => {
    const finalUrl = (urlToSave !== undefined ? urlToSave : figmaInput).trim();
    await updateIssue(selectedIssue.id, { figmaUrl: finalUrl || undefined });
    setSelectedIssue({ ...selectedIssue, figmaUrl: finalUrl || undefined });
    setIsEditingFigma(false);
    setFigmaInput('');
    showToast(finalUrl ? 'Figma design linked successfully!' : 'Figma design detached', 'success');
  };

  const handleCopyFigmaLink = () => {
    if (selectedIssue.figmaUrl) {
      navigator.clipboard?.writeText(selectedIssue.figmaUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast('Figma link copied to clipboard', 'info');
    }
  };

  const handleLogWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logHours || logHours <= 0) return;

    try {
      const res = await fetch('/api/worklogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          hours: Number(logHours),
          comment: logComment.trim() || 'Daily progress update',
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setSelectedIssue(data.issue);
        setIsLogWorkOpen(false);
        setLogHours(2);
        setLogComment('');
        showToast(`${logHours} hrs logged. Remaining hours adjusted!`, 'success');
      }
    } catch (err) {
      showToast('Failed to log work', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: selectedIssue.id, content: commentText }),
      });
      const data = await res.json();
      if (data.comment) {
        setSelectedIssue({
          ...selectedIssue,
          comments: [...(selectedIssue.comments || []), data.comment],
        });
        setCommentText('');
        showToast('Comment posted', 'success');
      }
    } catch (err) {
      showToast('Failed to add comment', 'error');
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: 'sub-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updatedSubtasks = [...(selectedIssue.subtasks || []), newSubtask];

    await updateIssue(selectedIssue.id, { subtasks: updatedSubtasks });
    setSelectedIssue({ ...selectedIssue, subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
    showToast('Subtask added', 'success');
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    const updatedSubtasks = (selectedIssue.subtasks || []).map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    await updateIssue(selectedIssue.id, { subtasks: updatedSubtasks });
    setSelectedIssue({ ...selectedIssue, subtasks: updatedSubtasks });
  };

  const linkedConfluenceDocs = (docs || []).filter(d => 
    (d.linkedIssueKeys || []).some(k => k.toUpperCase() === selectedIssue?.key.toUpperCase()) ||
    (selectedIssue?.linkedDocIds || []).includes(d.id)
  );

  const handleLinkConfluenceDoc = async () => {
    if (!selectedDocToLink || !selectedIssue) return;
    const currentDocIds = selectedIssue.linkedDocIds || [];
    if (!currentDocIds.includes(selectedDocToLink)) {
      const updated = await updateIssue(selectedIssue.id, {
        linkedDocIds: [...currentDocIds, selectedDocToLink],
      });
      if (updated) {
        setSelectedIssue(updated);
        showToast('Linked to Confluence documentation page', 'success');
      }
    }
    setIsLinkingDoc(false);
    setSelectedDocToLink('');
  };

  const handleAttachMockFile = async () => {
    const filenames = ['architecture-v2.pdf', 'crash-dump-log.txt', 'wireframe-spec.png', 'tokens-schema.json'];
    const chosen = filenames[Math.floor(Math.random() * filenames.length)];

    try {
      const res = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          filename: chosen,
          fileSize: Math.floor(Math.random() * 800000) + 12000,
          fileType: 'application/octet-stream',
          fileUrl: '#',
        }),
      });
      const data = await res.json();
      if (data.attachment) {
        setSelectedIssue({
          ...selectedIssue,
          attachments: [...(selectedIssue.attachments || []), data.attachment],
        });
        showToast(`Attached ${chosen}`, 'success');
      }
    } catch (err) {
      showToast('Failed to attach file', 'error');
    }
  };

  const typeConfig: Record<IssueType, { label: string; icon: React.ReactNode }> = {
    STORY: { label: 'Story', icon: <Bookmark className="w-4 h-4 text-emerald-600" /> },
    TASK: { label: 'Task', icon: <CheckSquare className="w-4 h-4 text-blue-600" /> },
    BUG: { label: 'Bug', icon: <Bug className="w-4 h-4 text-red-600" /> },
    EPIC: { label: 'Epic', icon: <Zap className="w-4 h-4 text-purple-600" /> },
  };

  const statusColors: Record<IssueStatus, string> = {
    BACKLOG: 'bg-slate-100 text-slate-700 border-slate-300',
    TODO: 'bg-slate-200 text-slate-800 border-slate-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
    UNDER_REVIEW: 'bg-amber-100 text-amber-800 border-amber-300',
    IN_QA: 'bg-purple-100 text-purple-800 border-purple-300',
    IN_STAKEHOLDER_VALIDATION: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    DONE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  // Hours progress
  const estHours = selectedIssue.estimatedHours || 0;
  const actHours = selectedIssue.actualHours || 0;
  const remHours = selectedIssue.remainingHours !== undefined ? selectedIssue.remainingHours : Math.max(0, estHours - actHours);
  const hoursPct = estHours > 0 ? Math.min(100, Math.round((actHours / estHours) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl border-l border-jira-border flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="h-14 px-6 border-b border-jira-border flex items-center justify-between bg-jira-bg">
          <div className="flex items-center space-x-2 text-xs flex-wrap overflow-hidden py-1">
            <span className="flex items-center space-x-1.5 font-semibold text-jira-subtle flex-shrink-0">
              {typeConfig[selectedIssue.type]?.icon}
              <span>{currentProject.key}</span>
            </span>

            {/* Epic in breadcrumb if mapped */}
            {(selectedIssue.epic || (selectedIssue.epicId && epics.find(e => e.id === selectedIssue.epicId))) && (
              <>
                <span className="text-slate-300">/</span>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200 flex-shrink-0 max-w-[130px] truncate" title={selectedIssue.epic?.name || epics.find(e => e.id === selectedIssue.epicId)?.name}>
                  <Zap className="w-3 h-3 text-purple-600 flex-shrink-0" />
                  <span className="truncate">{selectedIssue.epic?.name || epics.find(e => e.id === selectedIssue.epicId)?.name}</span>
                </span>
              </>
            )}

            {/* Feature in breadcrumb if mapped */}
            {selectedIssue.feature && (
              <>
                <span className="text-slate-300">/</span>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200 flex-shrink-0 max-w-[150px] truncate" title={selectedIssue.feature}>
                  <span className="text-[10px] text-blue-500 uppercase font-semibold">Feat:</span>
                  <span className="truncate">{selectedIssue.feature}</span>
                </span>
              </>
            )}

            {/* Parent Story Tag for Task / Bug */}
            {selectedIssue.parentStory && (
              <>
                <span className="text-slate-300">/</span>
                <span 
                  onClick={() => setSelectedIssue(selectedIssue.parentStory || null)}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition flex-shrink-0"
                  title="Click to view parent User Story"
                >
                  <Bookmark className="w-3 h-3 text-emerald-600" />
                  <span>Story: {selectedIssue.parentStory.key}</span>
                </span>
              </>
            )}

            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-jira-brand flex-shrink-0">{selectedIssue.key}</span>

            {/* Target Phase Badge */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs flex-shrink-0">
              {selectedIssue.phase || 'MVP'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsRovoOpen(true);
                askRovo(`Tell me everything about Jira issue [${selectedIssue.key}] and any linked Confluence specifications, blockers, and progress.`);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-2xs"
              title="Ask WezAI about this ticket"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Ask WezAI</span>
            </button>

            {permissions.canDeleteIssue && (
              <button
                onClick={() => deleteIssue(selectedIssue.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                title="Delete Issue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSelectedIssue(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body (Two Columns) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-jira-border">
          {/* Left Column: Details & Collaboration (7 cols) */}
          <div className="md:col-span-8 p-6 space-y-6">
            {/* Title / Summary */}
            <div>
              {isEditingSummary ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={summaryText}
                    onChange={e => setSummaryText(e.target.value)}
                    className="w-full text-base font-bold p-2 border border-jira-brand rounded outline-none"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveSummary}
                      className="px-2.5 py-1 bg-jira-brand text-white text-xs font-bold rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setSummaryText(selectedIssue.summary);
                        setIsEditingSummary(false);
                      }}
                      className="px-2.5 py-1 text-slate-600 text-xs font-bold rounded hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h1
                  onClick={() => permissions.canEditIssue && setIsEditingSummary(true)}
                  className={`text-lg font-bold text-jira-text hover:bg-slate-100/70 p-1.5 -ml-1.5 rounded cursor-pointer leading-snug ${
                    !permissions.canEditIssue ? 'cursor-default hover:bg-transparent' : ''
                  }`}
                  title={permissions.canEditIssue ? 'Click to edit summary' : undefined}
                >
                  {selectedIssue.summary}
                </h1>
              )}
            </div>

            {/* Dedicated Acceptance Criteria Panel (Given / When / Then) */}
            {selectedIssue.type === 'STORY' && (
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                      Acceptance Criteria (Given / When / Then)
                    </h3>
                  </div>
                  {permissions.canEditIssue && !isEditingAC && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAC(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                    >
                      Edit Criteria
                    </button>
                  )}
                </div>

                {isEditingAC ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Numbered Given / When / Then scenarios:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAcText(
                            "1. Given I enter a registered mobile/email, when I request a code, then a 6-digit OTP is sent within 30 seconds and expires after 5 minutes\n" +
                            "2. Given I enter a wrong OTP 5 times, when I try again, then login is blocked for 15 minutes and I see a clear message\n" +
                            "3. Given I enter an unregistered number, when I request a code, then I am told to use my invite or request to join a society\n" +
                            "4. Given I choose 'remember this device', when I reopen the app within 30 days, then I stay logged in"
                          );
                        }}
                        className="text-[10px] text-emerald-700 hover:underline font-bold"
                      >
                        ⚡ Insert Standard Criteria
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={acText}
                      onChange={e => setAcText(e.target.value)}
                      placeholder="1. Given [context], when [action], then [outcome]&#10;2. Given [context], when [action], then [outcome]"
                      className="w-full text-xs font-mono p-3 border border-emerald-300 rounded-lg outline-none focus:border-emerald-600 bg-white leading-relaxed"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSaveAC}
                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                      >
                        Save Criteria
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAcText(selectedIssue.acceptanceCriteria || '');
                          setIsEditingAC(false);
                        }}
                        className="px-3 py-1 text-slate-600 text-xs font-bold rounded hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {selectedIssue.acceptanceCriteria ? (
                      <div className="space-y-2">
                        {selectedIssue.acceptanceCriteria.split('\n').filter(Boolean).map((line, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-lg border border-emerald-200/80 shadow-xs flex items-start space-x-2.5 text-xs">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center flex-shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="text-slate-800 leading-relaxed font-medium">
                              {line.replace(/^\d+[\.\)]\s*/, '')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-lg border border-dashed border-emerald-200 text-center">
                        <p className="text-xs text-slate-400 mb-2">No acceptance criteria specified yet.</p>
                        {permissions.canEditIssue && (
                          <button
                            type="button"
                            onClick={() => setIsEditingAC(true)}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-xs font-bold hover:bg-emerald-100"
                          >
                            + Add Acceptance Criteria
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description / Scope Notes */}
            <div>
              <h3 className="text-xs font-bold text-jira-subtle uppercase tracking-wider mb-2">
                {selectedIssue.type === 'STORY' ? 'Scope Notes & Context' : 'Description'}
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {selectedIssue.description || 'No additional scope notes provided.'}
              </div>
            </div>

            {/* If Story: Show Linked Tasks & Defects breakdown */}
            {selectedIssue.type === 'STORY' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckSquare className="w-4 h-4 text-jira-brand" />
                    <span>Linked Tasks & Defects ({linkedChildIssues.length})</span>
                  </h3>
                </div>

                {linkedChildIssues.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No tasks or bugs are currently linked to this user story.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {linkedChildIssues.map(child => (
                      <div
                        key={child.id}
                        onClick={() => setSelectedIssue(child)}
                        className="p-2 bg-white rounded-lg border border-slate-200 hover:border-jira-brand flex items-center justify-between cursor-pointer transition text-xs shadow-xs"
                      >
                        <div className="flex items-center space-x-2 truncate pr-2">
                          {typeConfig[child.type]?.icon}
                          <span className="font-bold text-blue-600">{child.key}</span>
                          <span className="text-slate-800 truncate">{child.summary}</span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[child.status]}`}>
                            {child.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {child.actualHours || 0}/{child.estimatedHours || 0} hrs
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bug Specific section */}
            {selectedIssue.type === 'BUG' && (
              <div className="p-4 bg-red-50/60 border border-red-200 rounded-lg space-y-2 text-xs">
                <div className="font-bold text-red-800 uppercase tracking-wide flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Bug Diagnostics</span>
                </div>
                {selectedIssue.environment && (
                  <div>
                    <span className="font-semibold text-slate-700">Environment: </span>
                    <span className="text-slate-600">{selectedIssue.environment}</span>
                  </div>
                )}
                {selectedIssue.reproduceSteps && (
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Reproduction Steps:</span>
                    <pre className="p-2 bg-white rounded border border-red-200 text-[11px] text-slate-700 font-mono whitespace-pre-wrap">
                      {selectedIssue.reproduceSteps}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Subtasks Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-jira-subtle uppercase tracking-wider">
                  Checklist Subtasks ({(selectedIssue.subtasks || []).filter(s => s.completed).length}/{(selectedIssue.subtasks || []).length})
                </h3>
              </div>

              <div className="space-y-1.5">
                {(selectedIssue.subtasks || []).map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleToggleSubtask(s.id)}
                    className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 transition text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={s.completed}
                      readOnly
                      className="rounded text-jira-brand focus:ring-0 cursor-pointer"
                    />
                    <span className={`flex-1 ${s.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                      {s.title}
                    </span>
                  </div>
                ))}

                {permissions.canEditIssue && (
                  <form onSubmit={handleAddSubtask} className="flex items-center space-x-2 pt-1.5">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      placeholder="+ Add a subtask item and press Enter..."
                      className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-jira-brand"
                    />
                  </form>
                )}
              </div>
            </div>

            {/* Figma Design Specs & Interactive Prototypes */}
            <div className="p-4 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50 border border-purple-200/80 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 flex items-center justify-center text-white font-black text-[11px] shadow-xs">
                    F
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">
                      Figma Design Specs & Prototypes
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedIssue.figmaUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowFigmaEmbed(!showFigmaEmbed)}
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-100/70 hover:bg-purple-200/70 transition"
                      >
                        {showFigmaEmbed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showFigmaEmbed ? 'Hide Embed' : 'View Embed'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFigmaInput(selectedIssue.figmaUrl || '');
                          setIsEditingFigma(true);
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    permissions.canEditIssue && (
                      <button
                        type="button"
                        onClick={() => setIsEditingFigma(true)}
                        className="text-xs text-purple-700 hover:text-purple-900 hover:underline flex items-center space-x-1 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Link Figma Design</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Editing or Attaching Figma Link */}
              {isEditingFigma && (
                <div className="p-3 bg-white rounded-lg border border-purple-300 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Enter Figma File or Frame URL:</span>
                    <button
                      type="button"
                      onClick={() => handleSaveFigmaUrl('https://www.figma.com/design/sample-enterprise-system/Enterprise-UI-System-Wireframes')}
                      className="text-[10px] text-purple-700 hover:underline font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200"
                    >
                      ⚡ Insert Sample Wireframe
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={figmaInput}
                      onChange={e => setFigmaInput(e.target.value)}
                      placeholder="https://www.figma.com/design/... or https://www.figma.com/file/..."
                      className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-md outline-none focus:border-purple-600 font-medium"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveFigmaUrl()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-md shadow-xs transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingFigma(false);
                        setFigmaInput('');
                      }}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-md"
                    >
                      Cancel
                    </button>
                    {selectedIssue.figmaUrl && (
                      <button
                        type="button"
                        onClick={() => handleSaveFigmaUrl('')}
                        className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-md"
                      >
                        Detach
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Attached Figma Display */}
              {selectedIssue.figmaUrl && !isEditingFigma && (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-purple-200/80 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-700 font-black text-xs border border-purple-200">
                        FIG
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-800 truncate flex items-center space-x-1.5">
                          <span className="truncate">
                            {selectedIssue.figmaUrl.split('/').pop()?.replace(/-/g, ' ') || 'Figma Design File'}
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded">
                            LIVE
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {selectedIssue.figmaUrl}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyFigmaLink}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 transition"
                        title="Copy Figma Link"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={selectedIssue.figmaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition"
                      >
                        <span>Open in Figma</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Interactive Embed iframe */}
                  {showFigmaEmbed && (
                    <div className="rounded-lg overflow-hidden border border-purple-200 bg-slate-900 shadow-sm relative group">
                      <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300 border-b border-slate-700 font-mono">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Figma Live Viewport (Inspect & Pan Enabled)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">Click canvas to interact</span>
                      </div>
                      <iframe
                        src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(selectedIssue.figmaUrl)}`}
                        className="w-full h-80 bg-white"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

              {!selectedIssue.figmaUrl && !isEditingFigma && (
                <div
                  onClick={() => setIsEditingFigma(true)}
                  className="border-2 border-dashed border-purple-200/90 hover:border-purple-500 rounded-lg p-3.5 text-center cursor-pointer hover:bg-purple-50/40 transition group space-y-1"
                >
                  <p className="text-xs font-bold text-purple-900 group-hover:text-purple-950">
                    No Figma design attached to this issue
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Click here to attach a Figma file, design token frame, or clickable prototype.
                  </p>
                </div>
              )}
            </div>

            {/* Linked Confluence Documentation Section */}
            <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      Linked Confluence Docs ({linkedConfluenceDocs.length})
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLinkingDoc(!isLinkingDoc)}
                  className="text-xs text-purple-700 hover:text-purple-900 hover:underline flex items-center space-x-1 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Doc</span>
                </button>
              </div>

              {/* Doc Picker Dropdown */}
              {isLinkingDoc && (
                <div className="p-3 bg-white rounded-lg border border-purple-300 shadow-sm space-y-2">
                  <div className="text-xs font-bold text-slate-700">Select a Confluence page to link:</div>
                  <div className="flex space-x-2">
                    <select
                      value={selectedDocToLink}
                      onChange={e => setSelectedDocToLink(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-md outline-none focus:border-purple-600 bg-white"
                    >
                      <option value="">-- Choose documentation page --</option>
                      {docs.map(d => (
                        <option key={d.id} value={d.id}>
                          [{d.category}] {d.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleLinkConfluenceDoc}
                      disabled={!selectedDocToLink}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-md shadow-xs transition"
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLinkingDoc(false);
                        setSelectedDocToLink('');
                      }}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Linked Docs List */}
              {linkedConfluenceDocs.length > 0 ? (
                <div className="space-y-2">
                  {linkedConfluenceDocs.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => openDocInConfluence(doc)}
                      className="p-3 bg-white hover:bg-purple-50/80 rounded-lg border border-purple-200 cursor-pointer transition flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-3">
                        <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900 flex items-center space-x-1.5 truncate">
                            <span className="truncate">{doc.title}</span>
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                              {doc.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {doc.excerpt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0 text-purple-700 text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>Open Doc</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLinkingDoc && (
                <div
                  onClick={() => setIsLinkingDoc(true)}
                  className="border-2 border-dashed border-purple-200/90 hover:border-purple-500 rounded-lg p-3 text-center cursor-pointer hover:bg-purple-50/40 transition group"
                >
                  <p className="text-xs font-bold text-purple-900 group-hover:text-purple-950">
                    No Confluence documentation linked yet
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click here to link an Architecture RFC, PRD, or Runbook.
                  </p>
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-jira-subtle uppercase tracking-wider">
                  Attachments ({(selectedIssue.attachments || []).length})
                </h3>
                <button
                  type="button"
                  onClick={handleAttachMockFile}
                  className="text-xs text-jira-brand hover:underline flex items-center space-x-1 font-semibold"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach File</span>
                </button>
              </div>

              {(selectedIssue.attachments || []).length === 0 ? (
                <div
                  onClick={handleAttachMockFile}
                  className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-jira-brand hover:bg-blue-50/30 transition text-xs text-jira-subtle"
                >
                  Drop files here or click to browse
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(selectedIssue.attachments || []).map(att => (
                    <div key={att.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center space-x-2 text-xs">
                      <FileText className="w-4 h-4 text-jira-brand flex-shrink-0" />
                      <div className="truncate flex-1">
                        <div className="font-semibold text-slate-800 truncate">{att.filename}</div>
                        <div className="text-[10px] text-slate-400">{Math.round(att.fileSize / 1024)} KB</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabbed Activity, Comments, and Work Logs */}
            <div className="pt-4 border-t border-jira-border">
              <div className="flex items-center space-x-4 border-b border-jira-border pb-2 mb-4">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`text-xs font-bold flex items-center space-x-1.5 pb-1 border-b-2 transition ${
                    activeTab === 'comments' ? 'border-jira-brand text-jira-brand' : 'border-transparent text-slate-500'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({(selectedIssue.comments || []).length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('worklogs')}
                  className={`text-xs font-bold flex items-center space-x-1.5 pb-1 border-b-2 transition ${
                    activeTab === 'worklogs' ? 'border-jira-brand text-jira-brand' : 'border-transparent text-slate-500'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Work Logs & Daily Updates ({(selectedIssue.workLogs || []).length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`text-xs font-bold flex items-center space-x-1.5 pb-1 border-b-2 transition ${
                    activeTab === 'activity' ? 'border-jira-brand text-jira-brand' : 'border-transparent text-slate-500'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History & Audit</span>
                </button>
              </div>

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="flex space-x-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <textarea
                        rows={2}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment... (Type @ to mention team members)"
                        className="w-full text-xs p-2.5 border border-jira-border rounded-lg outline-none focus:border-jira-brand"
                      />
                      {commentText.trim() && (
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-jira-brand text-white text-xs font-bold rounded-md hover:bg-jira-brandHover transition flex items-center space-x-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>Save Comment</span>
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="space-y-3 pt-2">
                    {(selectedIssue.comments || []).map(comm => (
                      <div key={comm.id} className="flex space-x-2.5 text-xs">
                        <img
                          src={comm.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={comm.author?.name || 'User'}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-jira-text">{comm.author?.name || 'Team Member'}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comm.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{comm.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'worklogs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Total Time Logged: <b className="text-jira-brand">{actHours} hrs</b>
                    </span>
                    <button
                      onClick={() => setIsLogWorkOpen(true)}
                      className="px-3 py-1 bg-jira-brand text-white text-xs font-bold rounded hover:bg-jira-brandHover flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Daily Work</span>
                    </button>
                  </div>

                  {(selectedIssue.workLogs || []).length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-400">
                      No hours logged yet. Use &ldquo;Log Daily Work&rdquo; to record progress and automatically reduce remaining hours.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(selectedIssue.workLogs || []).map(wl => (
                        <div key={wl.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3 text-xs">
                          <Clock className="w-4 h-4 text-jira-brand mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-jira-text">{wl.user?.name || currentUser.name}</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">
                                {wl.hours} hrs spent
                              </span>
                            </div>
                            {wl.comment && (
                              <p className="text-slate-600 mt-1 leading-relaxed">{wl.comment}</p>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1">
                              Logged: {new Date(wl.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <span className="font-semibold text-slate-800">{selectedIssue.reporter?.name || 'User'}</span>
                      <span>created this issue</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(selectedIssue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedIssue.actualCompletionDate && (
                      <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed on {new Date(selectedIssue.actualCompletionDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Workflow, Dates, Estimation & Work Logging (4 cols) */}
          <div className="md:col-span-4 p-6 bg-slate-50/50 space-y-5 text-xs">
            {/* Status Transition Selector (6 Flow Stages) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider">
                  Workflow Status
                </label>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flow</span>
              </div>
              <select
                value={selectedIssue.status}
                onChange={e => handleStatusChange(e.target.value as IssueStatus)}
                disabled={!permissions.canTransitionIssueStatus}
                className={`w-full py-2 px-2.5 rounded-md font-extrabold border outline-none cursor-pointer shadow-xs ${statusColors[selectedIssue.status]}`}
              >
                <option value="BACKLOG">BACKLOG</option>
                <option value="TODO">TO DO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="IN_QA">IN QA</option>
                <option value="IN_STAKEHOLDER_VALIDATION">IN STAKEHOLDER VALIDATION</option>
                <option value="DONE">DONE</option>
              </select>

              {/* Fast 1-Click Workflow Stepper */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Fast Transition Stepper</span>
                  {selectedIssue.status !== 'DONE' && permissions.canTransitionIssueStatus && (
                    <button
                      type="button"
                      onClick={() => {
                        const flow: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'IN_QA', 'IN_STAKEHOLDER_VALIDATION', 'DONE'];
                        const curIdx = flow.indexOf(selectedIssue.status);
                        const nextStatus = curIdx >= 0 && curIdx < flow.length - 1 ? flow[curIdx + 1] : 'IN_PROGRESS';
                        handleStatusChange(nextStatus);
                      }}
                      className="text-[10px] font-bold text-jira-brand hover:underline flex items-center space-x-0.5"
                    >
                      <span>Next Step ➔</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'TODO' as IssueStatus, label: 'To Do', color: 'border-blue-300 hover:bg-blue-50 text-blue-800' },
                    { id: 'IN_PROGRESS' as IssueStatus, label: 'In Progress', color: 'border-amber-300 hover:bg-amber-50 text-amber-800' },
                    { id: 'UNDER_REVIEW' as IssueStatus, label: 'Under Review', color: 'border-purple-300 hover:bg-purple-50 text-purple-800' },
                    { id: 'IN_QA' as IssueStatus, label: 'In QA', color: 'border-indigo-300 hover:bg-indigo-50 text-indigo-800' },
                    { id: 'IN_STAKEHOLDER_VALIDATION' as IssueStatus, label: 'Stakeholder Valid.', color: 'border-pink-300 hover:bg-pink-50 text-pink-800' },
                    { id: 'DONE' as IssueStatus, label: 'Done ✓', color: 'border-emerald-300 hover:bg-emerald-50 text-emerald-800' },
                  ].map(step => {
                    const isActive = selectedIssue.status === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStatusChange(step.id)}
                        disabled={!permissions.canTransitionIssueStatus}
                        className={`px-2 py-1.5 rounded text-[10px] font-extrabold border text-left truncate transition ${
                          isActive 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-800' 
                            : `bg-slate-50 text-slate-700 ${step.color}`
                        }`}
                        title={`Move to ${step.label}`}
                      >
                        {isActive ? '● ' : ''}{step.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Link to Parent User Story (for Task or Bug) */}
            {(selectedIssue.type === 'TASK' || selectedIssue.type === 'BUG') && (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1.5">
                <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                  Linked User Story
                </label>
                <select
                  value={selectedIssue.parentStoryId || ''}
                  onChange={e => handleParentStoryChange(e.target.value)}
                  disabled={!permissions.canEditIssue}
                  className="w-full py-1.5 px-2 rounded-md border border-emerald-300 bg-white font-semibold text-emerald-950 outline-none truncate"
                >
                  <option value="">None (Independent)</option>
                  {userStories.map(us => (
                    <option key={us.id} value={us.id}>
                      📖 {us.key}: {us.summary}
                    </option>
                  ))}
                </select>

                {selectedIssue.parentStory?.epic && (
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded">
                    <Zap className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>Epic automatically mapped: <b>{selectedIssue.parentStory.epic.name}</b></span>
                  </div>
                )}
              </div>
            )}

            {/* Feature Attribute */}
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                  Feature
                </label>
                {selectedIssue.parentStory?.feature && (
                  <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                    ⚡ Inherited
                  </span>
                )}
              </div>
              {isEditingFeature ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={featureText}
                    onChange={e => setFeatureText(e.target.value)}
                    list="drawer-features-list"
                    placeholder="e.g. Login via mobile OTP / email"
                    className="w-full text-xs p-1.5 border border-blue-300 rounded bg-white font-semibold outline-none"
                    autoFocus
                  />
                  <datalist id="drawer-features-list">
                    {Array.from(new Set(issues.filter(i => i.projectId === currentProject.id && i.feature).map(i => i.feature as string))).map((f, i) => (
                      <option key={i} value={f} />
                    ))}
                  </datalist>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSaveFeature()}
                      className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeatureText(selectedIssue.feature || '');
                        setIsEditingFeature(false);
                      }}
                      className="px-2.5 py-1 text-slate-600 text-[11px] font-bold rounded hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => permissions.canEditIssue && setIsEditingFeature(true)}
                  className={`p-1.5 bg-white rounded border border-blue-200 font-bold text-blue-900 text-xs truncate ${
                    permissions.canEditIssue ? 'cursor-pointer hover:border-blue-400' : ''
                  }`}
                  title={permissions.canEditIssue ? 'Click to edit feature' : undefined}
                >
                  {selectedIssue.feature || <span className="text-slate-400 italic font-normal">None assigned</span>}
                </div>
              )}
            </div>

            {/* Target Release Phase */}
            <div>
              <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Target Release Phase
              </label>
              <select
                value={selectedIssue.phase || 'MVP'}
                onChange={e => handlePhaseChange(e.target.value)}
                disabled={!permissions.canEditIssue}
                className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white font-bold text-emerald-800 outline-none"
              >
                <option value="MVP">MVP (Initial Release)</option>
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option>
                <option value="Post-MVP">Post-MVP</option>
              </select>
            </div>

            {/* Estimation & Work Progress Panel */}
            <div className="p-4 bg-white rounded-xl border border-jira-border shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Timer className="w-4 h-4 text-jira-brand" />
                  <span>Time Tracking & Hours</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogWorkOpen(true)}
                  className="text-[11px] text-jira-brand hover:underline font-bold"
                >
                  + Log Hours
                </button>
              </div>

              {/* Hours Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-600">Logged: <b className="text-slate-900">{actHours} hrs</b></span>
                  <span className="text-slate-600">Remaining: <b className="text-amber-700">{remHours} hrs</b></span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    style={{ width: `${hoursPct}%` }}
                    className="h-full bg-jira-brand rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedIssue.estimatedHours || ''}
                    onChange={e => handleEstimatedHoursChange(Number(e.target.value))}
                    disabled={!permissions.canEditIssue}
                    placeholder="0 hrs"
                    className="w-full p-1.5 border border-slate-200 rounded font-bold text-jira-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Actual Hours Spent</label>
                  <div className="p-1.5 bg-slate-100 rounded border border-slate-200 font-bold text-slate-800">
                    {actHours} hrs
                  </div>
                </div>
              </div>

              {/* Story Points */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estimated Points</label>
                  <input
                    type="number"
                    value={selectedIssue.storyPoints || ''}
                    onChange={e => updateIssue(selectedIssue.id, { storyPoints: Number(e.target.value) })}
                    disabled={!permissions.canEditIssue}
                    placeholder="Pts"
                    className="w-full p-1.5 border border-slate-200 rounded font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Actual Points</label>
                  <input
                    type="number"
                    value={selectedIssue.actualPoints ?? (selectedIssue.status === 'DONE' ? selectedIssue.storyPoints || 0 : '')}
                    onChange={e => updateIssue(selectedIssue.id, { actualPoints: Number(e.target.value) })}
                    disabled={!permissions.canEditIssue}
                    placeholder="Actual Pts"
                    className="w-full p-1.5 border border-slate-200 rounded font-bold text-emerald-700 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Target & Completion Dates */}
            <div className="p-4 bg-white rounded-xl border border-jira-border shadow-xs space-y-3">
              <span className="font-extrabold text-xs text-slate-800 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Completion Dates</span>
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Planned Completion Date
                </label>
                <input
                  type="date"
                  value={selectedIssue.plannedCompletionDate ? selectedIssue.plannedCompletionDate.split('T')[0] : ''}
                  onChange={e => handlePlannedDateChange(e.target.value)}
                  disabled={!permissions.canEditIssue}
                  className="w-full p-1.5 border border-slate-200 rounded font-semibold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Actual Completion Date
                </label>
                {selectedIssue.actualCompletionDate ? (
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{new Date(selectedIssue.actualCompletionDate).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-slate-100 border border-slate-200 text-slate-400 font-medium italic">
                    Auto-captured when marked DONE
                  </div>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={selectedIssue.assigneeId || ''}
                onChange={e => handleAssigneeChange(e.target.value)}
                disabled={!permissions.canAssignIssue}
                className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white font-medium outline-none"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={selectedIssue.priority}
                onChange={e => handlePriorityChange(e.target.value as Priority)}
                disabled={!permissions.canEditIssue}
                className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white font-semibold outline-none"
              >
                <option value="HIGHEST">🔴 Highest (P0)</option>
                <option value="HIGH">🟠 High (P1)</option>
                <option value="MEDIUM">🟡 Medium (P2)</option>
                <option value="LOW">🔵 Low (P3)</option>
                <option value="LOWEST">⚪ Lowest (P4)</option>
              </select>
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Sprint
              </label>
              <select
                value={selectedIssue.sprintId || ''}
                onChange={e => handleSprintChange(e.target.value)}
                disabled={!permissions.canEditIssue}
                className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white font-medium outline-none truncate"
              >
                <option value="">Product Backlog</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
              </select>
            </div>

            {/* Linked Epic */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-jira-subtle uppercase tracking-wider">
                  Linked Epic
                </label>
                {selectedIssue.parentStory?.epic && (
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ⚡ Auto-mapped
                  </span>
                )}
              </div>
              <select
                value={selectedIssue.epicId || ''}
                onChange={e => updateIssue(selectedIssue.id, { epicId: e.target.value || undefined })}
                disabled={!permissions.canEditIssue}
                className="w-full py-1.5 px-2.5 rounded-md border border-slate-200 bg-white font-medium outline-none truncate"
              >
                <option value="">None</option>
                {epics.map(ep => (
                  <option key={ep.id} value={ep.id}>{ep.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Log Work / Daily Update Modal */}
      {isLogWorkOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleLogWork} className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-jira-brand" />
                <h3 className="font-extrabold text-sm text-jira-text">Log Daily Work on {selectedIssue.key}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogWorkOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hours Spent Today *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                required
                autoFocus
                value={logHours}
                onChange={e => setLogHours(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-extrabold text-sm text-jira-brand outline-none focus:border-jira-brand"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Current Remaining: {remHours} hrs ➔ Will become {Math.max(0, Number((remHours - logHours).toFixed(1)))} hrs
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Note / Daily Progress Update
              </label>
              <textarea
                rows={3}
                value={logComment}
                onChange={e => setLogComment(e.target.value)}
                placeholder="What was completed today? Any blockers or next steps..."
                className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:border-jira-brand"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsLogWorkOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded shadow-xs"
              >
                Log Time & Update Remaining
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
