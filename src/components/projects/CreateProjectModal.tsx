'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProjectTemplate } from '@/lib/types';
import { X, FolderPlus, Sparkles, Layers, Kanban } from 'lucide-react';

export default function CreateProjectModal() {
  const { 
    isCreateProjectModalOpen, setIsCreateProjectModalOpen, 
    createProject, users, currentUser, permissions, setActiveView 
  } = useApp();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<ProjectTemplate>('SCRUM');
  const [leadId, setLeadId] = useState(currentUser?.id || 'user-jayasree');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  if (!isCreateProjectModalOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!keyManuallyEdited) {
      // Auto-generate project key from words in name
      const words = val.trim().split(/\s+/).filter(Boolean);
      let genKey = '';
      if (words.length === 1) {
        genKey = words[0].slice(0, 3).toUpperCase();
      } else if (words.length > 1) {
        genKey = words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
      }
      setKey(genKey.replace(/[^A-Z0-9]/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    setIsSubmitting(true);
    const newProj = await createProject({
      name: name.trim(),
      key: key.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
      description: description.trim(),
      template,
      leadId,
    });
    setIsSubmitting(false);

    if (newProj) {
      setName('');
      setKey('');
      setDescription('');
      setKeyManuallyEdited(false);
      setActiveView(template === 'SCRUM' ? 'scrum' : 'kanban');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-jira-border w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-jira-border flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-jira-brand text-white flex items-center justify-center shadow-xs">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-jira-text">Create Project</h2>
              <p className="text-xs text-jira-subtle mt-0.5">
                Set up a new workspace for your team and deliverables
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateProjectModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Society Resident Portal"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-jira-brand transition font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={key}
                onChange={e => {
                  setKeyManuallyEdited(true);
                  setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                }}
                placeholder="e.g. SRP"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-jira-brand transition uppercase"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">2-8 letters prefix (e.g. {key || 'WEZ'}-101)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Lead
              </label>
              <select
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-jira-brand transition font-medium"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Project Methodology / Framework
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTemplate('SCRUM')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition ${
                  template === 'SCRUM'
                    ? 'bg-blue-50 border-jira-brand ring-1 ring-jira-brand'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-jira-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Scrum</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Timeboxed sprints & story points velocity</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('KANBAN')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition ${
                  template === 'KANBAN'
                    ? 'bg-blue-50 border-jira-brand ring-1 ring-jira-brand'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Kanban className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Kanban</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Continuous flow & WIP cycle limits</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief context and objectives of this project workspace..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-jira-brand transition resize-none font-medium"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !key.trim()}
              className="px-5 py-2 bg-jira-brand hover:bg-jira-brandHover disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Project...</span>
                </>
              ) : (
                <span>Create Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
