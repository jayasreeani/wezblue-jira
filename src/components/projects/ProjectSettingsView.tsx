'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Project, ProjectTemplate } from '@/lib/types';
import { 
  Settings, FolderPlus, Layers, ShieldCheck, Check, Plus, 
  Download, Upload, Database, Edit2, Trash2, AlertTriangle, AlertCircle, X 
} from 'lucide-react';

export default function ProjectSettingsView() {
  const { 
    currentProject, projects, setCurrentProject, permissions, 
    refreshData, showToast, updateProject, deleteProject,
    setIsCreateProjectModalOpen
  } = useApp();

  // Edit Project State
  const [isEditProjOpen, setIsEditProjOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTemplate, setEditTemplate] = useState<ProjectTemplate>('SCRUM');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Project State
  const [isDeleteProjOpen, setIsDeleteProjOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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


  const handleOpenEdit = (p: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjectToEdit(p);
    setEditName(p.name);
    setEditKey(p.key);
    setEditDescription(p.description || '');
    setEditTemplate(p.template);
    setIsEditProjOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit || !editName.trim() || !editKey.trim()) return;

    setIsSubmittingEdit(true);
    try {
      const updated = await updateProject(projectToEdit.id, {
        name: editName.trim(),
        key: editKey.trim().toUpperCase(),
        description: editDescription.trim(),
        template: editTemplate,
      });
      if (updated) {
        setIsEditProjOpen(false);
        setProjectToEdit(null);
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleOpenDelete = (p: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjectToDelete(p);
    setDeleteConfirmKey('');
    setIsDeleteProjOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete || deleteConfirmKey.trim().toUpperCase() !== projectToDelete.key.toUpperCase()) {
      showToast(`Please type the project key "${projectToDelete?.key}" to confirm`, 'error');
      return;
    }

    setIsDeleting(true);
    try {
      const ok = await deleteProject(projectToDelete.id);
      if (ok) {
        setIsDeleteProjOpen(false);
        setProjectToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Project Management & Settings</h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            Configure project schema, methodology templates (Scrum/Kanban), keys, and edit/delete workspaces.
          </p>
        </div>

        {permissions.canCreateProject && (
          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
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
              {(currentProject?.key || 'PR').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-bold text-jira-text">{currentProject?.name || 'Enterprise Project'}</h2>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Key: <b className="text-jira-brand">{currentProject?.key || 'PR'}</b> • Methodology: <b>{currentProject?.template || 'SCRUM'}</b>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-jira-brand text-xs font-bold border border-blue-200">
              Active Workspace
            </span>

            {permissions.canCreateProject && (
              <button
                onClick={(e) => handleOpenEdit(currentProject, e)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-300"
              >
                <Edit2 className="w-3 h-3 text-slate-600" />
                <span>Edit Project</span>
              </button>
            )}

            {permissions.canCreateProject && projects.length > 1 && (
              <button
                onClick={(e) => handleOpenDelete(currentProject, e)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition border border-red-200"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1">
              Project Description
            </label>
            <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-medium">
              {currentProject?.description || 'Enterprise project repository for distributed application engineering.'}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1">
              Agile Framework
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">{currentProject?.template || 'SCRUM'} Architecture</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                {(currentProject?.template || 'SCRUM') === 'SCRUM'
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
          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-slate-500">Click a project row to switch active workspace</span>
            {permissions.canCreateProject && (
              <button
                type="button"
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-jira-brand hover:bg-jira-brandHover text-white rounded text-xs font-bold transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}
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

              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                {currentProject.id === p.id && (
                  <span className="flex items-center space-x-1 text-jira-brand font-bold text-xs mr-2">
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </span>
                )}

                {permissions.canCreateProject && (
                  <button
                    onClick={(e) => handleOpenEdit(p, e)}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {permissions.canCreateProject && projects.length > 1 && (
                  <button
                    onClick={(e) => handleOpenDelete(p, e)}
                    className="p-1.5 rounded hover:bg-red-100 text-red-600 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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


      {/* Edit Project Modal */}
      {isEditProjOpen && projectToEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-jira-brand" />
                <h2 className="text-base font-bold text-jira-text">Edit Project Details</h2>
              </div>
              <button type="button" onClick={() => setIsEditProjOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Project Key *</label>
              <input
                type="text"
                required
                maxLength={8}
                value={editKey}
                onChange={e => setEditKey(e.target.value.toUpperCase())}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Description</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Template</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditTemplate('SCRUM')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    editTemplate === 'SCRUM'
                      ? 'border-jira-brand bg-blue-50 text-jira-brand font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold">Scrum</div>
                  <div className="text-[10px] text-slate-500 font-normal">Sprints & Burndown</div>
                </button>
                <button
                  type="button"
                  onClick={() => setEditTemplate('KANBAN')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    editTemplate === 'KANBAN'
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
                onClick={() => setIsEditProjOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded shadow-xs disabled:opacity-50"
              >
                {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Project Safety Confirmation Modal */}
      {isDeleteProjOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-red-200 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Delete Project "{projectToDelete.name}"?</h2>
                <div className="text-xs text-red-600 font-semibold">Destructive Action</div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-1.5">
              <p className="font-bold">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-700">
                <li>The project repository and settings</li>
                <li>All issues, epics, tasks, and sprints associated with key <b>{projectToDelete.key}</b></li>
                <li>Active board configurations and filters</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                To confirm deletion, please type the project key <span className="text-red-600 font-mono font-black">{projectToDelete.key}</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmKey}
                onChange={e => setDeleteConfirmKey(e.target.value.toUpperCase())}
                placeholder={`Type "${projectToDelete.key}"`}
                className="w-full text-xs px-3 py-2 border-2 border-red-300 rounded font-mono font-bold tracking-wider outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsDeleteProjOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmKey.trim().toUpperCase() !== projectToDelete.key.toUpperCase()}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
