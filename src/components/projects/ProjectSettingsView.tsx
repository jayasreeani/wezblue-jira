'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ProjectTemplate } from '@/lib/types';
import { Settings, FolderPlus, Layers, ShieldCheck, Check, Plus, Download, Upload, Database } from 'lucide-react';

export default function ProjectSettingsView() {
  const { currentProject, projects, setCurrentProject, permissions, refreshData, showToast } = useApp();

  const [isCreateProjOpen, setIsCreateProjOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<ProjectTemplate>('SCRUM');
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    window.open('/api/backup', '_blank');
    showToast('Workspace backup download started', 'success');
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Workspace restored successfully!', 'success');
        refreshData();
      } else {
        showToast(data.error || 'Failed to restore backup', 'error');
      }
    } catch (err: any) {
      showToast('Invalid backup file: ' + err.message, 'error');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          key: key.trim().toUpperCase(),
          description: description.trim(),
          template,
        }),
      });
      const data = await res.json();
      if (data.project) {
        showToast(`Project ${data.project.name} (${data.project.key}) created`, 'success');
        setCurrentProject(data.project);
        setName('');
        setKey('');
        setDescription('');
        setIsCreateProjOpen(false);
        refreshData();
      }
    } catch (err) {
      showToast('Failed to create project', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Project Management & Settings</h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            Configure project schema, methodology templates (Scrum/Kanban), keys, and leadership.
          </p>
        </div>

        {permissions.canCreateProject && (
          <button
            onClick={() => setIsCreateProjOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Current Project Card */}
      <div className="bg-white rounded-xl border border-jira-border shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-jira-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-jira-brand text-white flex items-center justify-center font-black text-lg shadow-sm">
              {currentProject.key.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-bold text-jira-text">{currentProject.name}</h2>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Key: <b className="text-jira-brand">{currentProject.key}</b> • Methodology: <b>{currentProject.template}</b>
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-100 text-jira-brand text-xs font-bold border border-blue-200">
            Active Workspace
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1">
              Project Description
            </label>
            <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-medium">
              {currentProject.description || 'Enterprise project repository for distributed application engineering.'}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1">
              Agile Framework
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">{currentProject.template} Architecture</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                {currentProject.template === 'SCRUM'
                  ? 'Iterative timeboxed sprints, estimation in story points, sprint burndown, and velocity forecasting.'
                  : 'Continuous flow delivery, WIP limits per status column, and cycle-time optimization.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Projects Switcher Table */}
      <div className="bg-white rounded-xl border border-jira-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-jira-border bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-jira-brand" />
            <h3 className="font-bold text-sm text-jira-text">All Tenant Projects ({projects.length})</h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => setCurrentProject(p)}
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition ${
                currentProject.id === p.id ? 'bg-blue-50/70 font-semibold' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                  {p.key.slice(0, 2)}
                </span>
                <div>
                  <div className="font-bold text-jira-text">{p.name}</div>
                  <div className="text-[11px] text-slate-500">Key: {p.key} • Template: {p.template}</div>
                </div>
              </div>

              {currentProject.id === p.id && (
                <span className="flex items-center space-x-1 text-jira-brand font-bold text-xs">
                  <Check className="w-4 h-4" />
                  <span>Selected</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Permanent Data Safety & Backup Section */}
      <div className="bg-white rounded-xl border border-jira-border shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-jira-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-jira-text">Permanent Data Safety & Workspace Backups</h2>
              <p className="text-xs text-slate-500">
                Data persistence guarantee: Your tickets, epics, sprints, and Confluence documentation are preserved across deployments.
              </p>
            </div>
          </div>
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Persistent Storage Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-jira-brand" />
              <span className="text-xs font-bold text-slate-800">Export Full Workspace Backup</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Download a complete JSON snapshot containing all Jira tickets, epics, sprints, work logs, users, and Confluence documentation.
            </p>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-jira-brand border border-slate-300 font-bold text-xs transition shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup (.json)</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800">Restore Workspace from Backup</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Upload a previously exported backup file to restore tickets, sprints, and documentation across any deployment.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreFile}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              disabled={isRestoring}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isRestoring ? 'Restoring data...' : 'Select Backup File (.json)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreateProjOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateProject} className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4">
            <h2 className="text-base font-bold text-jira-text">Create Project</h2>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!key) setKey(e.target.value.slice(0, 4).toUpperCase());
                }}
                placeholder="e.g. Phoenix Analytics Engine"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Project Key (Prefix for issues) *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={key}
                onChange={e => setKey(e.target.value.toUpperCase())}
                placeholder="e.g. PHX"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of project domain and scope..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Template</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplate('SCRUM')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    template === 'SCRUM'
                      ? 'border-jira-brand bg-blue-50 text-jira-brand font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold">Scrum</div>
                  <div className="text-[10px] text-slate-500 font-normal">Sprints & Burndown</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('KANBAN')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    template === 'KANBAN'
                      ? 'border-jira-brand bg-blue-50 text-jira-brand font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold">Kanban</div>
                  <div className="text-[10px] text-slate-500 font-normal">Continuous Flow</div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateProjOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded shadow-xs"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
