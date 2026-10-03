'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, Plus, Bell, CheckCircle, Shield, 
  ChevronDown, Layers, Sparkles, Check, ExternalLink, FileSpreadsheet, BookOpen, LogOut,
  Users, UserCog, Lock
} from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS, Role } from '@/lib/types';
import ProfileSettingsModal from '@/components/users/ProfileSettingsModal';
import TeamPersonasModal from '@/components/users/TeamPersonasModal';

export default function TopNav() {
  const { 
    currentUser, switchUser, users, projects, currentProject, 
    setCurrentProject, setIsCreateModalOpen, setIsSearchOpen, 
    setIsBulkUploadOpen, notifications, markNotificationRead, markAllNotificationsRead,
    setSelectedIssue, issues, permissions, activeView, setActiveView, setIsRovoOpen, logout,
    isProfileModalOpen, setIsProfileModalOpen, isPersonasModalOpen, setIsPersonasModalOpen
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjMenu, setShowProjMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header className="h-14 bg-white border-b border-jira-border px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-sm">
      {/* Left: Brand & Project Switcher */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-jira-brand to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-jira-text">WEZBLUE</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 ml-1.5 rounded bg-blue-50 text-jira-brand border border-blue-200">
              Enterprise Jira
            </span>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjMenu(!showProjMenu)}
            className="flex items-center space-x-2 text-sm font-medium text-jira-text hover:bg-jira-bg px-2.5 py-1.5 rounded transition"
          >
            <span className="w-5 h-5 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {currentProject.key.slice(0, 2)}
            </span>
            <span className="truncate max-w-[160px] font-semibold">{currentProject.name}</span>
            <ChevronDown className="w-4 h-4 text-jira-subtle" />
          </button>

          {showProjMenu && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-jira-border py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-jira-subtle uppercase tracking-wider">
                Recent Projects
              </div>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentProject(p);
                    setShowProjMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-blue-50 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded bg-jira-brand text-white text-xs font-bold flex items-center justify-center">
                      {p.key.slice(0, 2)}
                    </span>
                    <div>
                      <div className="font-medium text-jira-text text-xs leading-none">{p.name}</div>
                      <div className="text-[11px] text-jira-subtle mt-0.5">{p.key} • {p.template}</div>
                    </div>
                  </div>
                  {currentProject.id === p.id && <Check className="w-4 h-4 text-jira-brand" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Create Button */}
        {permissions.canCreateIssue && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-sm font-semibold px-3 py-1.5 rounded transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
        )}

        {/* Bulk Upload Button */}
        {permissions.canCreateIssue && (
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded transition shadow-xs"
            title="Bulk Upload User Stories via Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel</span>
          </button>
        )}
      </div>

      {/* Middle: Global Search, Confluence & ROVO AI Trigger */}
      <div className="flex-1 max-w-xl mx-6 flex items-center space-x-2.5">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 flex items-center justify-between px-3 py-1.5 bg-jira-bg hover:bg-slate-200/70 border border-jira-border rounded-md text-sm text-jira-subtle transition"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-jira-subtle" />
            <span>Search issues, epics, docs...</span>
          </div>
          <kbd className="text-[11px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-500 font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Confluence Spaces Shortcut */}
        <button
          onClick={() => setActiveView('confluence')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition shadow-2xs ${
            activeView === 'confluence'
              ? 'bg-blue-50 text-jira-brand border-blue-300'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-jira-border'
          }`}
          title="Confluence Documentation Workspace"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Confluence</span>
        </button>

        {/* WezAI Assistant Header Launcher */}
        <button
          onClick={() => setIsRovoOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-xs group"
          title="Ask WezAI across Jira & Confluence"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />
          <span>WezAI</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 uppercase font-black tracking-wide">
            AI
          </span>
        </button>

        {/* Team Personas Directory Launcher */}
        <button
          onClick={() => setIsPersonasModalOpen(true)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition shadow-2xs ${
            isPersonasModalOpen
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-jira-border'
          }`}
          title="View all 6 Wezblue team personas & switch roles"
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Team Personas</span>
        </button>
      </div>

      {/* Right: Notifications & Persona Switcher */}
      <div className="flex items-center space-x-4">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-full hover:bg-jira-bg text-jira-subtle hover:text-jira-text relative transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-jira-border z-50">
              <div className="p-3 border-b border-jira-border flex items-center justify-between">
                <span className="font-bold text-sm text-jira-text">Notifications</span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-jira-brand hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-jira-subtle">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) {
                          const target = issues.find(i => i.key === n.link);
                          if (target) setSelectedIssue(target);
                        }
                        setShowNotifs(false);
                      }}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition text-xs ${n.read ? 'opacity-70' : 'bg-blue-50/40 font-medium'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-jira-text">{n.title}</span>
                        <span className="text-[10px] text-jira-subtle">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multi-User RBAC Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-jira-bg transition"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-jira-border"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-jira-text leading-tight">{currentUser.name}</div>
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border ${ROLE_COLORS[currentUser.role] || 'bg-slate-100 text-slate-800'}`}>
                {currentUser.jobTitle || ROLE_LABELS[currentUser.role] || currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-jira-subtle" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-jira-border py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-jira-border flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-jira-subtle uppercase tracking-wider">
                    My Account
                  </div>
                  <div className="text-xs font-bold text-jira-text">{currentUser.name}</div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ROLE_COLORS[currentUser.role]}`}>
                  {currentUser.role}
                </span>
              </div>

              {/* Profile & Password Action */}
              <div className="p-2 border-b border-jira-border bg-slate-50/70">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-white hover:bg-blue-50 text-jira-text hover:text-jira-brand border border-slate-200 hover:border-blue-200 text-xs font-bold transition shadow-2xs"
                >
                  <UserCog className="w-4 h-4 text-jira-brand" />
                  <span>Profile & Security Settings</span>
                </button>
              </div>

              <div className="px-3.5 py-1.5 bg-slate-50/30 border-b border-jira-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Switch Persona (RBAC Tester):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsPersonasModalOpen(true);
                  }}
                  className="text-[10px] text-jira-brand hover:underline font-bold"
                >
                  View All
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 py-1">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-blue-50 transition ${currentUser.id === u.id ? 'bg-blue-50/70 font-semibold' : ''}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="text-xs text-jira-text font-medium leading-none">{u.name}</div>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold border ${ROLE_COLORS[u.role] || 'bg-slate-100'}`}>
                            {u.jobTitle || ROLE_LABELS[u.role] || u.role}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{u.department}</span>
                        </div>
                      </div>
                    </div>
                    {currentUser.id === u.id && <Check className="w-4 h-4 text-jira-brand" />}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-jira-border bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign Out of Wezblue</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Modals */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <TeamPersonasModal
        isOpen={isPersonasModalOpen}
        onClose={() => setIsPersonasModalOpen(false)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
    </header>
  );
}
