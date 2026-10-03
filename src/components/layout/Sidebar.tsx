'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Kanban, Compass, ListTodo, Zap, Calendar, 
  BarChart3, Users, Settings, ChevronLeft, ChevronRight,
  ShieldCheck, BookOpen, Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { currentProject, activeView, setActiveView, setIsRovoOpen } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const planningNav = [
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'scrum', label: 'Active Scrum Board', icon: Compass },
    { id: 'backlog', label: 'Backlog & Sprints', icon: ListTodo },
    { id: 'epics', label: 'Epics & Roadmap', icon: Zap },
    { id: 'sprints', label: 'Sprint Management', icon: Calendar },
  ];


  const analyticsNav = [
    { id: 'dashboard', label: 'Reports & Dashboard', icon: BarChart3 },
  ];

  const adminNav = [
    { id: 'users', label: 'User Directory & RBAC', icon: Users },
    { id: 'settings', label: 'Project Settings', icon: Settings },
  ];

  return (
    <aside className={`bg-jira-bg border-r border-jira-border transition-all duration-300 flex flex-col justify-between select-none relative ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Project Card Header */}
      <div>
        <div className="p-4 border-b border-jira-border flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-jira-brand text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {currentProject.key.slice(0, 2)}
              </div>
              <div className="truncate">
                <div className="font-bold text-sm text-jira-text truncate">{currentProject.name}</div>
                <div className="text-xs text-jira-subtle flex items-center space-x-1">
                  <span>{currentProject.template} Project</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-lg bg-jira-brand text-white flex items-center justify-center font-bold text-sm">
              {currentProject.key.slice(0, 2)}
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="py-4 space-y-6">
          {/* Planning Section */}
          <div>
            {!collapsed && (
              <div className="px-4 text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Planning
              </div>
            )}
            <nav className="space-y-0.5 px-2">
              {planningNav.map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-blue-100/70 text-jira-brand'
                        : 'text-slate-700 hover:bg-slate-200/60 hover:text-jira-text'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-jira-brand' : 'text-slate-500'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Confluence Section */}
          <div>
            {!collapsed && (
              <div className="px-4 text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 font-extrabold">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Confluence</span>
                </span>
                <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.2 rounded">Workspace</span>
              </div>
            )}
            <nav className="space-y-1 px-2">
              <button
                onClick={() => setActiveView('confluence')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeView === 'confluence'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-800 bg-blue-50/70 hover:bg-blue-100 border border-blue-200/70'
                }`}
                title={collapsed ? "Confluence Spaces & Documentation" : undefined}
              >
                <BookOpen className={`w-4 h-4 flex-shrink-0 ${activeView === 'confluence' ? 'text-white' : 'text-blue-600'}`} />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Confluence Spaces</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${activeView === 'confluence' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-800'}`}>
                      DOCS
                    </span>
                  </div>
                )}
              </button>
            </nav>
          </div>

          {/* AI Intelligence Section */}
          <div>
            {!collapsed && (
              <div className="px-4 text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>AI Intelligence</span>
                <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">WezAI</span>
              </div>
            )}
            <nav className="space-y-0.5 px-2">
              {/* WezAI Assistant Trigger */}
              <button
                onClick={() => setIsRovoOpen(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-purple-800 hover:bg-purple-100/70 transition group"
                title={collapsed ? "Ask WezAI Assistant" : undefined}
              >
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse flex-shrink-0" />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>WezAI Assistant</span>
                    <span className="text-[9px] bg-purple-200 text-purple-800 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                      Ask AI
                    </span>
                  </div>
                )}
              </button>
            </nav>
          </div>

          {/* Analytics Section */}
          <div>
            {!collapsed && (
              <div className="px-4 text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Analytics
              </div>
            )}
            <nav className="space-y-0.5 px-2">
              {analyticsNav.map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-blue-100/70 text-jira-brand'
                        : 'text-slate-700 hover:bg-slate-200/60 hover:text-jira-text'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-jira-brand' : 'text-slate-500'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Administration Section */}
          <div>
            {!collapsed && (
              <div className="px-4 text-[11px] font-bold text-jira-subtle uppercase tracking-wider mb-1.5">
                Administration
              </div>
            )}
            <nav className="space-y-0.5 px-2">
              {adminNav.map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-blue-100/70 text-jira-brand'
                        : 'text-slate-700 hover:bg-slate-200/60 hover:text-jira-text'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-jira-brand' : 'text-slate-500'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-jira-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2 text-[11px] text-jira-subtle font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enterprise Cloud</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-jira-subtle hover:text-jira-text mx-auto transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
