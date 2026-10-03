'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, CheckCircle2, Play, Clock, TrendingUp } from 'lucide-react';

export default function SprintsView() {
  const { sprints, issues, currentProject, setActiveView } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Sprint Management</h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            Sprint cadence, velocity history, and iterative release tracking for {currentProject.name}.
          </p>
        </div>

        <button
          onClick={() => setActiveView('backlog')}
          className="px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-md shadow-xs transition"
        >
          Go to Sprint Planning
        </button>
      </div>

      {/* Velocity Trend Card */}
      <div className="bg-white rounded-xl border border-jira-border p-5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-jira-subtle uppercase tracking-wider mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Sprint Velocity History</span>
        </div>

        {sprints.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2.5">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">No Sprints Created Yet</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Plan and create your first sprint cycle in the Backlog & Sprints planning view.
            </p>
            <button
              onClick={() => setActiveView('backlog')}
              className="mt-2 inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              <span>Create Sprint in Backlog</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sprints.map(s => {
              const sprintIssues = issues.filter(i => i.sprintId === s.id);
              const doneIssues = sprintIssues.filter(i => i.status === 'DONE');
              const donePts = doneIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
              const totalPts = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

              return (
                <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-jira-text">{s.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'COMPLETED'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-jira-brand">
                    {s.status === 'COMPLETED' ? (s.velocity || donePts) : donePts} <span className="text-xs font-semibold text-slate-500">/ {totalPts} pts</span>
                  </div>

                  {s.goal && (
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      🎯 {s.goal}
                    </p>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                    {s.startDate ? new Date(s.startDate).toLocaleDateString() : 'Unscheduled'} – {s.endDate ? new Date(s.endDate).toLocaleDateString() : 'TBD'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
