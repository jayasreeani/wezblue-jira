'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ConfluenceDoc, ConfluenceSpace, DocCategory, DocStatus } from '@/lib/types';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, ExternalLink, 
  Sparkles, CheckCircle2, Clock, FileText, ChevronRight,
  Cpu, Terminal, FolderPlus, Tag, Layers, ArrowLeft,
  Share2, Eye, EyeOff, Check, X, ShieldAlert, AlertCircle, Info
} from 'lucide-react';

const CATEGORY_COLORS: Record<DocCategory, { bg: string; text: string; border: string }> = {
  PRD: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  ARCHITECTURE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  RUNBOOK: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  RETROSPECTIVE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  DECISION_RECORD: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  MEETING_NOTES: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  GENERAL: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const STATUS_BADGES: Record<DocStatus, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-slate-100 text-slate-700', text: 'Draft' },
  IN_REVIEW: { bg: 'bg-amber-100 text-amber-800', text: 'In Review' },
  PUBLISHED: { bg: 'bg-emerald-100 text-emerald-800', text: 'Published' },
  ARCHIVED: { bg: 'bg-rose-100 text-rose-800', text: 'Archived' },
};

export default function ConfluenceView() {
  const { 
    spaces, docs, selectedDoc, setSelectedDoc, createDoc, updateDoc, 
    deleteDoc, createSpace, issues, setSelectedIssue, setIsRovoOpen, 
    askRovo, currentUser 
  } = useApp();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editSpaceId, setEditSpaceId] = useState('');
  const [editCategory, setEditCategory] = useState<DocCategory>('GENERAL');
  const [editStatus, setEditStatus] = useState<DocStatus>('DRAFT');
  const [editContent, setEditContent] = useState('');
  const [editLinkedIssues, setEditLinkedIssues] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // New space form state
  const [newSpaceKey, setNewSpaceKey] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [newSpaceColor, setNewSpaceColor] = useState('#0052cc');

  // Filtered docs
  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      if (selectedSpaceId !== 'all' && doc.spaceId !== selectedSpaceId) return false;
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchContent = doc.content.toLowerCase().includes(q);
        const matchKeys = (doc.linkedIssueKeys || []).some(k => k.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchKeys) return false;
      }
      return true;
    });
  }, [docs, selectedSpaceId, categoryFilter, searchQuery]);

  const activeDoc = useMemo(() => {
    if (selectedDoc) {
      return docs.find(d => d.id === selectedDoc.id) || selectedDoc;
    }
    return filteredDocs[0] || null;
  }, [selectedDoc, docs, filteredDocs]);

  const startEdit = (doc: ConfluenceDoc) => {
    setEditTitle(doc.title);
    setEditSpaceId(doc.spaceId);
    setEditCategory(doc.category);
    setEditStatus(doc.status);
    setEditContent(doc.content);
    setEditLinkedIssues([...(doc.linkedIssueKeys || [])]);
    setIsCreatingNew(false);
    setIsEditing(true);
    setPreviewMode(false);
  };

  const startCreate = () => {
    const defaultSpace = selectedSpaceId !== 'all' ? selectedSpaceId : (spaces[0]?.id || 'space-eng');
    setEditTitle('');
    setEditSpaceId(defaultSpace);
    setEditCategory('PRD');
    setEditStatus('DRAFT');
    setEditContent('# Document Title\n\n## 1. Overview\nDescribe the objective and scope here.\n\n## 2. Requirements & Specifications\n- Item 1\n- Item 2\n\n## 3. Related Tickets\nLink Jira issues above.');
    setEditLinkedIssues([]);
    setIsCreatingNew(true);
    setIsEditing(true);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    if (isCreatingNew) {
      const created = await createDoc({
        title: editTitle.trim(),
        spaceId: editSpaceId,
        category: editCategory,
        status: editStatus,
        content: editContent,
        linkedIssueKeys: editLinkedIssues,
        authorId: currentUser.id,
      });
      if (created) {
        setIsEditing(false);
        setIsCreatingNew(false);
      }
    } else if (activeDoc) {
      const updated = await updateDoc(activeDoc.id, {
        title: editTitle.trim(),
        spaceId: editSpaceId,
        category: editCategory,
        status: editStatus,
        content: editContent,
        linkedIssueKeys: editLinkedIssues,
      });
      if (updated) {
        setIsEditing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!activeDoc) return;
    if (window.confirm(`Are you sure you want to delete "${activeDoc.title}"?`)) {
      await deleteDoc(activeDoc.id);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceKey.trim() || !newSpaceName.trim()) return;
    const created = await createSpace({
      key: newSpaceKey.trim().toUpperCase(),
      name: newSpaceName.trim(),
      description: newSpaceDesc.trim(),
      color: newSpaceColor,
      icon: 'BookOpen',
    });
    if (created) {
      setSelectedSpaceId(created.id);
      setShowNewSpaceModal(false);
      setNewSpaceKey('');
      setNewSpaceName('');
      setNewSpaceDesc('');
    }
  };

  // Quick Templates
  const applyTemplate = (templateType: 'PRD' | 'ADR' | 'RETRO' | 'API') => {
    if (templateType === 'PRD') {
      setEditTitle('PRD: [Feature Name]');
      setEditCategory('PRD');
      setEditContent(`# PRD: [Feature Name]

## 1. Problem Statement
Explain what customer or operational friction this feature solves.

## 2. Target Persona
- **Primary Persona**: Society Resident / Tenant
- **Secondary Persona**: Facility Manager / Admin

## 3. Scope & Release Phase
- **Target Release**: MVP
- **In Scope**: Core user journey and notifications
- **Out of Scope**: Third-party external billing integration (Phase 2)

## 4. Acceptance Criteria (Given / When / Then)
1. **Given** a user navigates to the feature, **when** they perform action A, **then** system verifies requirement B.
2. **Given** an invalid input, **when** submitted, **then** display a clear validation alert.

## 5. Success Metrics
- 95% completion rate within target flow
- Reduction in support tickets by > 50%`);
    } else if (templateType === 'ADR') {
      setEditTitle('ADR-00X: [Architecture Decision Title]');
      setEditCategory('DECISION_RECORD');
      setEditContent(`# ADR-00X: [Decision Title]

## 1. Status
**IN_REVIEW** / **APPROVED**

## 2. Context
Describe the architectural dilemma, performance bottleneck, or security consideration.

## 3. Decision
State the exact technical approach chosen (e.g. Redis sliding window rate limiter, JWT rotation with 60s leeway).

## 4. Consequences
- **Positive**: Low latency, horizontal scalability, zero data loss.
- **Negative**: Requires additional Redis cluster capacity and monitoring.

## 5. Alternatives Considered
- In-memory Node caches (rejected due to cluster multi-worker desynchronization).`);
    } else if (templateType === 'RETRO') {
      setEditTitle('Sprint XX Retrospective');
      setEditCategory('RETROSPECTIVE');
      setEditContent(`# Sprint XX Retrospective

## 1. Sprint Metrics
- **Committed**: 30 Story Points
- **Delivered**: 28 Story Points
- **Velocity**: 93%

## 2. What Went Well 🎉
- Seamless deployment of database schema changes.
- Quick resolution of critical blockers by dev team.

## 3. What Didn't Go Well ⚠️
- PR reviews queued up towards sprint finish.
- Ambiguity in acceptance criteria on secondary tickets.

## 4. Action Items 🚀
- [ ] Implement dual estimation (Story points + Hours) on every groomed ticket.
- [ ] Enforce 24-hour SLA on pull request reviews.`);
    } else if (templateType === 'API') {
      setEditTitle('API Spec: [Service Name] REST & Webhook Contract');
      setEditCategory('ARCHITECTURE');
      setEditContent(`# API Spec: [Service Name]

## 1. Base URL
\`https://api.wezblue.internal/v1\`

## 2. Authentication
Bearer Token via header \`Authorization: Bearer <jwt_access_token>\`

## 3. Endpoints

### POST /auth/otp/request
Requests a 6-digit one-time code for resident login.

**Request Payload:**
\`\`\`json
{
  "mobileOrEmail": "+14155552671",
  "deviceFingerprint": "browser-chrome-mac"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "expiresInSeconds": 300,
  "requestId": "req_84f92a"
}
\`\`\`

## 4. Error Codes
- \`400 BAD_REQUEST\`: Invalid phone format
- \`429 TOO_MANY_REQUESTS\`: Rate limited (5 failed attempts)`);
    }
  };

  const askRovoAboutDoc = (doc: ConfluenceDoc) => {
    setIsRovoOpen(true);
    askRovo(`Can you summarize the document "[Doc: ${doc.title}]" and list all related Jira tickets and key decisions?`);
  };

  // Helper to render markdown-like content into clean HTML
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let listBuffer: string[] = [];

    const flushList = (key: string) => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul key={key} className="list-disc pl-6 space-y-1.5 my-3 text-slate-700">
            {listBuffer.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto my-3 border border-slate-800 shadow-inner">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          flushList(`list-before-code-${index}`);
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        flushList(`list-${index}`);
        elements.push(<h1 key={index} className="text-2xl font-extrabold text-jira-text mt-6 mb-3 pb-2 border-b border-jira-border">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList(`list-${index}`);
        elements.push(<h2 key={index} className="text-xl font-bold text-jira-text mt-5 mb-2.5 flex items-center space-x-2">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList(`list-${index}`);
        elements.push(<h3 key={index} className="text-base font-semibold text-slate-800 mt-4 mb-2">{line.slice(4)}</h3>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        listBuffer.push(line.slice(2));
      } else if (/^\d+\.\s/.test(line)) {
        flushList(`list-${index}`);
        elements.push(
          <div key={index} className="pl-4 py-1 flex items-start space-x-2 text-slate-700">
            <span className="font-semibold text-jira-brand">{line.split('.')[0]}.</span>
            <span className="leading-relaxed">{line.slice(line.indexOf('.') + 1).trim()}</span>
          </div>
        );
      } else if (line.startsWith('> ')) {
        flushList(`list-${index}`);
        elements.push(
          <div key={index} className="border-l-4 border-jira-brand bg-blue-50/60 p-3 rounded-r-lg my-3 text-sm text-slate-700 italic">
            {line.slice(2)}
          </div>
        );
      } else if (line.trim().length === 0) {
        flushList(`list-${index}`);
      } else {
        flushList(`list-${index}`);
        // Handle bolding and inline code
        elements.push(
          <p key={index} className="my-2 leading-relaxed text-slate-700 text-sm">
            {line}
          </p>
        );
      }
    });

    flushList('list-end');
    return elements;
  };

  return (
    <div className="flex h-[calc(100vh-56px)] bg-jira-bg overflow-hidden select-none">
      {/* Left Sidebar: Spaces & Documents List */}
      <div className="w-80 border-r border-jira-border bg-white flex flex-col flex-shrink-0">
        {/* Confluence Spaces Header */}
        <div className="p-3.5 border-b border-jira-border bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-jira-text leading-none">Confluence</div>
              <div className="text-[11px] text-jira-subtle font-medium mt-0.5">Documentation Spaces</div>
            </div>
          </div>
          <button
            onClick={() => setShowNewSpaceModal(true)}
            className="p-1.5 hover:bg-slate-200/60 rounded text-jira-subtle hover:text-jira-brand transition"
            title="Create New Space"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Space Picker Tabs */}
        <div className="p-2 border-b border-jira-border bg-white space-y-1.5">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-jira-subtle uppercase tracking-wider">
            <span>Spaces</span>
            <span className="text-slate-400 font-mono text-[10px]">{spaces.length} spaces</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSpaceId('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                selectedSpaceId === 'all'
                  ? 'bg-jira-brand text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              All Docs
            </button>
            {spaces.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSpaceId(s.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                  selectedSpaceId === s.id
                    ? 'bg-jira-brand text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & New Page CTA */}
        <div className="p-2.5 border-b border-jira-border space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-jira-subtle absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-jira-bg text-xs border border-jira-border rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-jira-brand"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="flex-1 bg-jira-bg text-xs border border-jira-border rounded-md px-2 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="PRD">PRDs</option>
              <option value="ARCHITECTURE">Architecture & RFC</option>
              <option value="DECISION_RECORD">ADR Decisions</option>
              <option value="RUNBOOK">Runbooks</option>
              <option value="RETROSPECTIVE">Retrospectives</option>
            </select>

            <button
              onClick={startCreate}
              className="flex items-center space-x-1 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold px-2.5 py-1.5 rounded transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Page</span>
            </button>
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredDocs.length === 0 ? (
            <div className="p-6 text-center text-xs text-jira-subtle">
              No documents match your filter.
            </div>
          ) : (
            filteredDocs.map(doc => {
              const active = activeDoc?.id === doc.id;
              const catConfig = CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.GENERAL;
              const statusConfig = STATUS_BADGES[doc.status] || STATUS_BADGES.DRAFT;
              const docSpace = spaces.find(s => s.id === doc.spaceId);

              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setIsEditing(false);
                  }}
                  className={`p-3 cursor-pointer transition text-left relative ${
                    active
                      ? 'bg-blue-50/80 border-l-4 border-l-jira-brand'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: docSpace?.color || '#0052cc' }} />
                      <span>{docSpace?.key || 'DOC'}</span>
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusConfig.bg}`}>
                      {statusConfig.text}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-jira-text line-clamp-1 leading-snug mb-1">
                    {doc.title}
                  </div>

                  <div className="text-[11px] text-jira-subtle line-clamp-2 leading-relaxed mb-2">
                    {doc.excerpt}
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded border font-medium ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
                      {doc.category.replace('_', ' ')}
                    </span>
                    {doc.linkedIssueKeys && doc.linkedIssueKeys.length > 0 && (
                      <span className="text-jira-brand font-semibold flex items-center space-x-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{doc.linkedIssueKeys.length} linked</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {isEditing ? (
          /* Editor Mode */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Editor Toolbar Header */}
            <div className="px-6 py-3 border-b border-jira-border bg-slate-50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 hover:bg-slate-200 rounded text-jira-subtle transition"
                  title="Cancel editing"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="font-bold text-sm text-jira-text">
                  {isCreatingNew ? 'Create New Confluence Page' : 'Edit Confluence Page'}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Template Quick Pickers */}
                {isCreatingNew && (
                  <div className="flex items-center space-x-1 mr-2 border-r border-slate-200 pr-2">
                    <span className="text-[11px] font-semibold text-jira-subtle mr-1">Templates:</span>
                    <button
                      type="button"
                      onClick={() => applyTemplate('PRD')}
                      className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition"
                    >
                      PRD
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('ADR')}
                      className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition"
                    >
                      ADR
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('RETRO')}
                      className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition"
                    >
                      Retro
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('API')}
                      className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                    >
                      API Spec
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-3 py-1.5 rounded border border-jira-border bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center space-x-1"
                >
                  {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{previewMode ? 'Edit Mode' : 'Live Preview'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold transition shadow-xs flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCreatingNew ? 'Publish Page' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4">
              {/* Title & Metadata Inputs */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Architecture RFC: Token Rotation)"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-extrabold text-jira-text border-b border-jira-border pb-2 focus:outline-none focus:border-jira-brand transition"
                />

                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-jira-border text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-jira-subtle mb-1">Space</label>
                    <select
                      value={editSpaceId}
                      onChange={e => setEditSpaceId(e.target.value)}
                      className="w-full bg-white border border-jira-border rounded px-2 py-1.5 focus:outline-none text-slate-800"
                    >
                      {spaces.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.key})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-jira-subtle mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value as DocCategory)}
                      className="w-full bg-white border border-jira-border rounded px-2 py-1.5 focus:outline-none text-slate-800"
                    >
                      <option value="PRD">PRD</option>
                      <option value="ARCHITECTURE">Architecture & RFC</option>
                      <option value="DECISION_RECORD">ADR Decision</option>
                      <option value="RUNBOOK">Runbook</option>
                      <option value="RETROSPECTIVE">Sprint Retrospective</option>
                      <option value="MEETING_NOTES">Meeting Notes</option>
                      <option value="GENERAL">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-jira-subtle mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as DocStatus)}
                      className="w-full bg-white border border-jira-border rounded px-2 py-1.5 focus:outline-none text-slate-800"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-jira-subtle mb-1">Link Jira Tickets</label>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {issues.map(iss => {
                        const linked = editLinkedIssues.includes(iss.key);
                        return (
                          <button
                            key={iss.id}
                            type="button"
                            onClick={() => {
                              if (linked) {
                                setEditLinkedIssues(editLinkedIssues.filter(k => k !== iss.key));
                              } else {
                                setEditLinkedIssues([...editLinkedIssues, iss.key]);
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                              linked
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {iss.key}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor vs Preview */}
              {previewMode ? (
                <div className="p-6 bg-white border border-jira-border rounded-lg shadow-inner prose max-w-none">
                  {renderMarkdown(editContent)}
                </div>
              ) : (
                <textarea
                  rows={22}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="Write documentation using Markdown syntax..."
                  className="w-full p-4 font-mono text-xs text-slate-800 border border-jira-border rounded-lg focus:outline-none focus:ring-2 focus:ring-jira-brand leading-relaxed"
                />
              )}
            </div>
          </div>
        ) : activeDoc ? (
          /* Viewer Mode */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Viewer Header */}
            <div className="px-8 py-4 border-b border-jira-border bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2 text-xs text-jira-subtle">
                <span className="font-semibold text-jira-brand">
                  {spaces.find(s => s.id === activeDoc.spaceId)?.name || 'Confluence'}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>{activeDoc.category.replace('_', ' ')}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => askRovoAboutDoc(activeDoc)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-xs"
                  title="Ask WezAI to summarize and analyze this document"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span>Ask WezAI</span>
                </button>

                <button
                  onClick={() => startEdit(activeDoc)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto px-10 py-6 max-w-4xl mx-auto w-full">
              {/* Document Meta Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_BADGES[activeDoc.status]?.bg || 'bg-slate-100'}`}>
                  {STATUS_BADGES[activeDoc.status]?.text || activeDoc.status}
                </span>

                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${CATEGORY_COLORS[activeDoc.category]?.bg || 'bg-slate-50'} ${CATEGORY_COLORS[activeDoc.category]?.text || 'text-slate-700'} ${CATEGORY_COLORS[activeDoc.category]?.border || 'border-slate-200'}`}>
                  {activeDoc.category.replace('_', ' ')}
                </span>

                <span className="text-xs text-jira-subtle flex items-center space-x-1 ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {new Date(activeDoc.updatedAt).toLocaleDateString()}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black text-jira-text tracking-tight mb-4">
                {activeDoc.title}
              </h1>

              {/* Author & Space Card */}
              <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-jira-border">
                <img
                  src={activeDoc.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={activeDoc.author?.name || 'Author'}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
                <div className="text-xs">
                  <div className="font-bold text-jira-text">{activeDoc.author?.name || 'Engineering Lead'}</div>
                  <div className="text-jira-subtle">{activeDoc.author?.role?.replace('_', ' ') || 'Contributor'} • {activeDoc.author?.department || 'Core Engineering'}</div>
                </div>
              </div>

              {/* Linked Jira Issues Panel */}
              {activeDoc.linkedIssueKeys && activeDoc.linkedIssueKeys.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span>Linked Jira Tickets ({activeDoc.linkedIssueKeys.length})</span>
                    </span>
                    <span className="text-[11px] text-blue-700">Click to open ticket details</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeDoc.linkedIssueKeys.map(key => {
                      const issue = issues.find(i => i.key.toUpperCase() === key.toUpperCase());
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            if (issue) setSelectedIssue(issue);
                          }}
                          className="flex items-center space-x-1.5 bg-white hover:bg-blue-100/70 border border-blue-300 text-blue-900 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs"
                        >
                          <span className="font-mono text-jira-brand font-bold">{key}</span>
                          {issue && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="line-clamp-1 max-w-[200px] text-slate-700">{issue.summary}</span>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                {issue.status.replace(/_/g, ' ')}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rendered Document Body */}
              <div className="prose prose-slate max-w-none text-slate-800">
                {renderMarkdown(activeDoc.content)}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-jira-brand flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-jira-text mb-1">Wezblue Confluence Knowledge Base</h3>
            <p className="text-xs text-jira-subtle max-w-md mb-6 leading-relaxed">
              Organize architecture designs, PRDs, runbooks, and team retrospectives. Link documentation directly to Jira tickets for end-to-end traceability.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={startCreate}
                className="flex items-center space-x-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Page</span>
              </button>
              <button
                onClick={() => setShowNewSpaceModal(true)}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                <FolderPlus className="w-4 h-4 text-slate-500" />
                <span>New Space</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Space Modal */}
      {showNewSpaceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-jira-border max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-jira-border">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-jira-brand" />
                <h3 className="font-bold text-base text-jira-text">Create Documentation Space</h3>
              </div>
              <button
                onClick={() => setShowNewSpaceModal(false)}
                className="p-1 hover:bg-slate-100 rounded text-jira-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-jira-text mb-1">Space Key (Uppercase 2-5 chars)</label>
                <input
                  type="text"
                  placeholder="e.g. SEC, API, DATA"
                  value={newSpaceKey}
                  onChange={e => setNewSpaceKey(e.target.value.toUpperCase())}
                  required
                  maxLength={5}
                  className="w-full border border-jira-border rounded-lg px-3 py-1.5 text-xs font-mono uppercase focus:ring-1 focus:ring-jira-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-jira-text mb-1">Space Name</label>
                <input
                  type="text"
                  placeholder="e.g. Security & Compliance Architecture"
                  value={newSpaceName}
                  onChange={e => setNewSpaceName(e.target.value)}
                  required
                  className="w-full border border-jira-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-jira-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-jira-text mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="What kind of documentation lives in this space?"
                  value={newSpaceDesc}
                  onChange={e => setNewSpaceDesc(e.target.value)}
                  className="w-full border border-jira-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-jira-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-jira-text mb-1">Space Color</label>
                <div className="flex items-center space-x-2">
                  {['#0052cc', '#6554c0', '#00875a', '#ff8b00', '#de350b', '#00b8d9'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSpaceColor(c)}
                      className={`w-6 h-6 rounded-full transition transform ${newSpaceColor === c ? 'scale-125 ring-2 ring-offset-2 ring-jira-brand' : 'opacity-80 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-jira-border">
                <button
                  type="button"
                  onClick={() => setShowNewSpaceModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold transition shadow-xs"
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
