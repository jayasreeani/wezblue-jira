'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { RoadmapInitiative } from '@/lib/types';
import { 
  Compass, Plus, Filter, Calendar, Target, CheckCircle2, 
  Clock, Shield, Layers, Smartphone, Cloud, ArrowRight, 
  Edit2, Trash2, X, Check, Users, Sparkles, AlertCircle
} from 'lucide-react';

const TRACKS = [
  { id: 'Security & Compliance', name: 'Security & Compliance', icon: Shield, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'Core Platform & Microservices', name: 'Core Platform & Microservices', icon: Layers, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Enterprise Mobile Apps', name: 'Enterprise Mobile Apps', icon: Smartphone, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'DevOps & Cloud Governance', name: 'DevOps & Cloud Governance', icon: Cloud, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

const QUARTERS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'H1 2027'];

const STATUS_CONFIG = {
  PLANNED: { label: 'Planned', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  ACHIEVED: { label: 'Achieved', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default function RoadmapView() {
  const { 
    roadmapInitiatives, createRoadmapInitiative, updateRoadmapInitiative, 
    deleteRoadmapInitiative, epics, users, permissions, showToast, setIsRovoOpen, askRovo
  } = useApp();

  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTrack, setFormTrack] = useState(TRACKS[0].id);
  const [formQuarter, setFormQuarter] = useState(QUARTERS[0]);
  const [formStatus, setFormStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'ACHIEVED'>('PLANNED');
  const [formProgress, setFormProgress] = useState(0);
  const [formOwner, setFormOwner] = useState(users[0]?.name || 'Althaf Thajudeen');
  const [formLinkedEpics, setFormLinkedEpics] = useState<string[]>([]);

  // Filtered Initiatives
  const filteredInitiatives = useMemo(() => {
    return (roadmapInitiatives || []).filter(item => {
      if (selectedTrack !== 'all' && item.track !== selectedTrack) return false;
      if (selectedQuarter !== 'all' && item.targetQuarter !== selectedQuarter) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchOwner = (item.owner || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchOwner) return false;
      }
      return true;
    });
  }, [roadmapInitiatives, selectedTrack, selectedQuarter, selectedStatus, searchQuery]);

  // Statistics
  const totalCount = (roadmapInitiatives || []).length;
  const inProgressCount = (roadmapInitiatives || []).filter(i => i.status === 'IN_PROGRESS').length;
  const achievedCount = (roadmapInitiatives || []).filter(i => i.status === 'ACHIEVED').length;
  const avgProgress = totalCount > 0 
    ? Math.round((roadmapInitiatives || []).reduce((acc, i) => acc + (i.progress || 0), 0) / totalCount)
    : 0;

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDesc('');
    setFormTrack(selectedTrack !== 'all' ? selectedTrack : TRACKS[0].id);
    setFormQuarter(selectedQuarter !== 'all' ? selectedQuarter : QUARTERS[0]);
    setFormStatus('PLANNED');
    setFormProgress(0);
    setFormOwner(users[0]?.name || 'Althaf Thajudeen');
    setFormLinkedEpics([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (init: RoadmapInitiative) => {
    setEditingId(init.id);
    setFormTitle(init.title);
    setFormDesc(init.description || '');
    setFormTrack(init.track);
    setFormQuarter(init.targetQuarter);
    setFormStatus(init.status);
    setFormProgress(init.progress);
    setFormOwner(init.owner || users[0]?.name || '');
    setFormLinkedEpics(init.linkedEpicIds || []);
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingId) {
      await updateRoadmapInitiative(editingId, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        track: formTrack,
        targetQuarter: formQuarter,
        status: formStatus,
        progress: Number(formProgress),
        owner: formOwner,
        linkedEpicIds: formLinkedEpics,
      });
    } else {
      await createRoadmapInitiative({
        title: formTitle.trim(),
        description: formDesc.trim(),
        track: formTrack,
        targetQuarter: formQuarter,
        status: formStatus,
        progress: Number(formProgress),
        owner: formOwner,
        linkedEpicIds: formLinkedEpics,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Remove initiative "${title}" from organization roadmap?`)) {
      await deleteRoadmapInitiative(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-jira-text tracking-tight flex items-center space-x-2">
                <span>Organisation Strategic Roadmap</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                  2026 - 2027
                </span>
              </h1>
              <p className="text-xs text-jira-subtle mt-0.5">
                Strategic quarterly horizon planning across engineering pillars, platform milestones, and architecture initiatives.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              askRovo('Summarize our Organisation Roadmap initiatives');
              setIsRovoOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Roadmap Briefing</span>
          </button>

          {permissions.canCreateIssue && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Strategic Initiative</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-jira-subtle uppercase tracking-wider">Total Initiatives</div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">Across {TRACKS.length} strategic tracks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Active Execution</div>
          <div className="text-2xl font-black text-blue-600">{inProgressCount}</div>
          <div className="text-[10px] text-blue-600/80 font-medium">Currently in sprint flight</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Target Achieved</div>
          <div className="text-2xl font-black text-emerald-600">{achievedCount}</div>
          <div className="text-[10px] text-emerald-600/80 font-medium">Delivered to production</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Average Progress</div>
          <div className="text-2xl font-black text-purple-700">{avgProgress}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Horizon Quarter Timeline Visual Bar */}
      <div className="bg-white rounded-xl border border-jira-border p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
          <span className="flex items-center space-x-1.5 text-jira-brand">
            <Calendar className="w-4 h-4" />
            <span>Quarterly Horizon Roadmap</span>
          </span>
          <span className="text-slate-400 font-normal">Click a quarter to isolate initiatives</span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {QUARTERS.map(q => {
            const countInQuarter = (roadmapInitiatives || []).filter(i => i.targetQuarter === q).length;
            const isSelected = selectedQuarter === q;
            return (
              <button
                key={q}
                type="button"
                onClick={() => setSelectedQuarter(isSelected ? 'all' : q)}
                className={`p-3 rounded-lg border text-left transition ${
                  isSelected 
                    ? 'bg-blue-50 border-jira-brand shadow-xs text-jira-brand' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-xs font-extrabold">{q}</div>
                <div className="text-[11px] font-semibold mt-0.5 opacity-80">
                  {countInQuarter} {countInQuarter === 1 ? 'initiative' : 'initiatives'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-jira-border shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 text-slate-500 font-bold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Track Filter */}
          <select
            value={selectedTrack}
            onChange={e => setSelectedTrack(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none focus:border-jira-brand"
          >
            <option value="all">All Strategic Tracks</option>
            {TRACKS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Quarter Filter */}
          <select
            value={selectedQuarter}
            onChange={e => setSelectedQuarter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none focus:border-jira-brand"
          >
            <option value="all">All Quarters</option>
            {QUARTERS.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none focus:border-jira-brand"
          >
            <option value="all">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ACHIEVED">Achieved</option>
          </select>

          {(selectedTrack !== 'all' || selectedQuarter !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSelectedTrack('all');
                setSelectedQuarter('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-jira-brand hover:underline font-bold ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search initiatives or leads..."
            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-jira-brand"
          />
        </div>
      </div>

      {/* Initiatives Grid */}
      {filteredInitiatives.length === 0 ? (
        <div className="bg-white rounded-xl border border-jira-border p-12 text-center shadow-xs">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No initiatives found matching filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new strategic milestone for your organization.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-jira-brand text-white text-xs font-bold rounded-lg shadow-xs hover:bg-jira-brandHover transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Initiative</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInitiatives.map(item => {
            const trackObj = TRACKS.find(t => t.id === item.track) || TRACKS[0];
            const TrackIcon = trackObj.icon;
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.PLANNED;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-jira-border hover:border-blue-300 shadow-xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${trackObj.color}`}>
                      <TrackIcon className="w-3 h-3" />
                      <span>{item.track}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.targetQuarter}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusConfig.bg}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-black text-jira-text leading-snug">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Linked Epics */}
                  {item.linkedEpicIds && item.linkedEpicIds.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Linked Jira Epics:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.linkedEpicIds.map(eid => {
                          const epic = epics.find(e => e.id === eid);
                          return (
                            <span
                              key={eid}
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"
                            >
                              {epic ? epic.name : eid}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress & Footer */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">Delivery Progress</span>
                      <span className="font-mono font-black text-jira-brand">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.progress >= 100 ? 'bg-emerald-500' : 'bg-jira-brand'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{item.owner || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-jira-brand transition"
                        title="Edit initiative"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                        title="Delete initiative"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Initiative Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveForm} className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-jira-brand" />
                <h2 className="text-base font-bold text-jira-text">
                  {editingId ? 'Edit Strategic Initiative' : 'Add Strategic Roadmap Initiative'}
                </h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Initiative Title *</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Next-Generation Distributed Caching & Redis Cluster"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium focus:border-jira-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Description / Strategic Scope</label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Outline objectives, business justification, and target metrics..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none focus:border-jira-brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-jira-subtle mb-1">Strategic Track *</label>
                <select
                  value={formTrack}
                  onChange={e => setFormTrack(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
                >
                  {TRACKS.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-jira-subtle mb-1">Target Horizon Quarter *</label>
                <select
                  value={formQuarter}
                  onChange={e => setFormQuarter(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
                >
                  {QUARTERS.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-jira-subtle mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ACHIEVED">Achieved</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-jira-subtle mb-1">Progress ({formProgress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formProgress}
                  onChange={e => setFormProgress(Number(e.target.value))}
                  className="w-full mt-2 accent-jira-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-jira-subtle mb-1">Owner / Lead</label>
                <select
                  value={formOwner}
                  onChange={e => setFormOwner(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none font-medium"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.jobTitle || u.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linked Epics Selection */}
            {epics.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-jira-subtle mb-1">Linked Jira Epics</label>
                <div className="max-h-28 overflow-y-auto border border-slate-200 rounded p-2 divide-y divide-slate-100 text-xs">
                  {epics.map(epic => {
                    const isChecked = formLinkedEpics.includes(epic.id);
                    return (
                      <label key={epic.id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-slate-50 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormLinkedEpics(prev => [...prev, epic.id]);
                            } else {
                              setFormLinkedEpics(prev => prev.filter(id => id !== epic.id));
                            }
                          }}
                          className="accent-jira-brand"
                        />
                        <span className="font-semibold text-slate-800">{epic.name}</span>
                        {epic.summary && <span className="text-[10px] text-slate-400 truncate max-w-[200px]">— {epic.summary}</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
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
                {editingId ? 'Save Changes' : 'Create Initiative'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
