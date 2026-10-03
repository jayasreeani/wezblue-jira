'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, Users, Shield, Check, ArrowRight, UserCog, Mail, Briefcase, Building 
} from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/types';

interface TeamPersonasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export default function TeamPersonasModal({ isOpen, onClose, onOpenProfile }: TeamPersonasModalProps) {
  const { users, currentUser, switchUser, issues } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-jira-border w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-jira-border flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-jira-text leading-tight">Wezblue Team Personas Directory</h2>
              <p className="text-xs text-jira-subtle mt-0.5">
                Active workspace members, enterprise roles, and 1-click RBAC switching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {users.map(u => {
              const isCurrent = currentUser.id === u.id;
              const assignedCount = issues.filter(i => i.assigneeId === u.id).length;

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-blue-50/60 border-jira-brand shadow-xs ring-1 ring-jira-brand'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Current Active</span>
                    </span>
                  )}

                  <div className="flex items-start space-x-3.5">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 pr-6">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-jira-text truncate">{u.name}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-semibold truncate flex items-center space-x-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{u.jobTitle || u.role}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{u.email}</span>
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {u.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      <b className="text-jira-brand">{assignedCount}</b> issues assigned
                    </span>

                    {isCurrent ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenProfile();
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-jira-text border border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs"
                      >
                        <UserCog className="w-3.5 h-3.5 text-jira-brand" />
                        <span>Edit My Profile</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-jira-brand hover:text-white text-jira-brand border border-blue-200 hover:border-jira-brand rounded-lg text-xs font-bold flex items-center space-x-1 transition shadow-2xs"
                      >
                        <span>Switch Persona</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-jira-border bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Switching persona immediately recalculates RBAC security permissions live.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
