'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  BarChart3, TrendingDown, CheckCircle2, AlertOctagon, 
  Clock, ShieldAlert, Sparkles, Activity, Layers, Calendar 
} from 'lucide-react';

export default function DashboardView() {
  const { currentProject, activityLogs, issues, sprints } = useApp();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/reports?projectId=${currentProject.id}`)
      .then(res => res.json())
      .then(data => setReportData(data))
      .catch(err => console.error(err));
  }, [currentProject.id, issues]);

  if (!reportData) {
    return <div className="p-8 text-xs text-slate-500">Loading enterprise metrics...</div>;
  }

  const { burndownData, velocityData, statusCounts, typeCounts, priorityCounts } = reportData;

  const bugs = issues.filter(i => i.type === 'BUG');
  const criticalBugs = bugs.filter(i => i.severity === 'CRITICAL' && i.status !== 'DONE');

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Executive Dashboard & Reporting</h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            Real-time agility telemetry, burndown progression, velocity predictability, and defect trends.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-jira-border text-jira-subtle font-semibold shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-jira-brand" />
          <span>Active Period: Q3 Sprint Cycle 2026</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Issues */}
        <div className="p-4 bg-white rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-xs font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
            <span>Work Items</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-jira-text">{issues.length}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            {typeCounts.STORY} Stories • {typeCounts.TASK} Tasks • {typeCounts.BUG} Bugs
          </div>
        </div>

        {/* Sprint Completion */}
        <div className="p-4 bg-white rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-xs font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
            <span>Story Points</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {reportData.completedStoryPoints} <span className="text-xs font-bold text-slate-400">/ {reportData.totalStoryPoints} pts</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            {reportData.totalStoryPoints > 0 ? Math.round((reportData.completedStoryPoints / reportData.totalStoryPoints) * 100) : 0}% active velocity
          </div>
        </div>

        {/* Hours Logged & Remaining */}
        <div className="p-4 bg-white rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-xs font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
            <span>Hours Logged</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">
            {reportData.totalActualHours || 0} <span className="text-xs font-bold text-slate-400">/ {reportData.totalEstimatedHours || 0}h</span>
          </div>
          <div className="text-[11px] text-blue-800 font-semibold">
            {reportData.totalRemainingHours || 0}h remaining capacity
          </div>
        </div>

        {/* Defect Density */}
        <div className="p-4 bg-white rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-xs font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
            <span>Critical Bugs</span>
            <AlertOctagon className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">{criticalBugs.length}</div>
          <div className="text-[11px] text-red-700 font-semibold">
            {criticalBugs.length > 0 ? 'Requires immediate triage' : 'Zero release blockers'}
          </div>
        </div>

        {/* Cycle Time / Health */}
        <div className="p-4 bg-white rounded-xl border border-jira-border shadow-xs space-y-1">
          <div className="text-xs font-bold text-jira-subtle uppercase tracking-wider flex items-center justify-between">
            <span>Avg Cycle Time</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700">3.4 Days</div>
          <div className="text-[11px] text-purple-800 font-semibold">
            +18% velocity efficiency
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Burndown Chart Card */}
        <div className="bg-white rounded-xl border border-jira-border p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-jira-brand" />
              <h2 className="font-bold text-sm text-jira-text">Sprint Burndown Chart (Remaining Points)</h2>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-slate-300 rounded-sm" />
                <span className="text-slate-500">Ideal Guideline</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <span className="text-blue-600 font-bold">Actual Burndown</span>
              </span>
            </div>
          </div>

          {/* SVG Burndown Graph */}
          <div className="h-56 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="155" x2="480" y2="155" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="25" fill="#94a3b8" fontSize="10" fontWeight="bold">30 pts</text>
              <text x="15" y="70" fill="#94a3b8" fontSize="10" fontWeight="bold">20 pts</text>
              <text x="15" y="115" fill="#94a3b8" fontSize="10" fontWeight="bold">10 pts</text>
              <text x="25" y="160" fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>

              {/* Ideal Line (Dashed) */}
              <line x1="45" y1="25" x2="475" y2="155" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />

              {/* Actual Burndown Polyline */}
              <polyline
                fill="none"
                stroke="#0052cc"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="45,25 90,25 135,42 180,60 225,82 270,98 315,120 360,132"
              />

              {/* Data points */}
              {[[45,25], [90,25], [135,42], [180,60], [225,82], [270,98], [315,120], [360,132]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4.5" fill="#0052cc" stroke="#ffffff" strokeWidth="2" />
              ))}
            </svg>

            {/* X Axis Days */}
            <div className="flex justify-between px-10 text-[10px] text-slate-400 font-semibold pt-1">
              <span>Day 1</span>
              <span>Day 2</span>
              <span>Day 3</span>
              <span>Day 4</span>
              <span>Day 5</span>
              <span>Day 6</span>
              <span>Day 7</span>
              <span>Day 8</span>
              <span>Day 9</span>
              <span>Day 10</span>
            </div>
          </div>
        </div>

        {/* Velocity Chart Card */}
        <div className="bg-white rounded-xl border border-jira-border p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-jira-text">Sprint Velocity (Committed vs Delivered)</h2>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-slate-300 rounded-sm" />
                <span className="text-slate-500">Committed</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                <span className="text-emerald-700 font-bold">Delivered</span>
              </span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-around pt-6 px-4">
            {(velocityData || []).map((v: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center space-y-2">
                <div className="flex items-end space-x-1.5 h-40">
                  {/* Committed Bar */}
                  <div
                    style={{ height: `${Math.min(100, v.committed * 3)}px` }}
                    className="w-8 bg-slate-200 rounded-t-md hover:bg-slate-300 transition flex items-center justify-center text-[10px] font-bold text-slate-600"
                    title={`Committed: ${v.committed} pts`}
                  >
                    {v.committed}
                  </div>
                  {/* Completed Bar */}
                  <div
                    style={{ height: `${Math.min(100, v.completed * 3)}px` }}
                    className="w-8 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    title={`Completed: ${v.completed} pts`}
                  >
                    {v.completed}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-700">{v.sprintName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution & Activity Log Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Issue Status Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-jira-border p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-jira-text">Workflow Status Distribution</h2>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Backlog', count: statusCounts.BACKLOG || 0, color: 'bg-slate-400' },
              { label: 'To Do', count: statusCounts.TODO || 0, color: 'bg-blue-400' },
              { label: 'In Progress', count: statusCounts.IN_PROGRESS || 0, color: 'bg-amber-400' },
              { label: 'Under Review', count: statusCounts.UNDER_REVIEW || 0, color: 'bg-purple-400' },
              { label: 'In QA', count: statusCounts.IN_QA || 0, color: 'bg-indigo-400' },
              { label: 'In Stakeholder Validation', count: statusCounts.IN_STAKEHOLDER_VALIDATION || 0, color: 'bg-pink-400' },
              { label: 'Done', count: statusCounts.DONE || 0, color: 'bg-emerald-500' },
            ].map(item => {
              const pct = issues.length > 0 ? Math.round((item.count / issues.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Project Audit Feed (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-jira-border p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-jira-brand" />
              <h2 className="font-bold text-sm text-jira-text">Audit Log & Team Activity Feed</h2>
            </div>
            <span className="text-xs text-jira-subtle font-medium">Live immutable event log</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100">
            {activityLogs.slice(0, 7).map(log => (
              <div key={log.id} className="pt-2.5 first:pt-0 flex items-start space-x-3 text-xs">
                <img
                  src={log.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt="User"
                  className="w-6 h-6 rounded-full object-cover border border-slate-200 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-jira-text">{log.user?.name || 'User'}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {log.action === 'STATUS_CHANGE' && (
                      <span>
                        moved <b className="text-blue-600">{log.issueKey}</b> from <span className="bg-slate-100 px-1 rounded">{log.oldValue}</span> to <span className="bg-emerald-100 text-emerald-800 font-bold px-1 rounded">{log.newValue}</span>
                      </span>
                    )}
                    {log.action === 'ISSUE_CREATED' && (
                      <span>created work item <b className="text-blue-600">{log.issueKey}</b>: {log.newValue}</span>
                    )}
                    {log.action === 'COMMENT_ADDED' && (
                      <span>commented on <b className="text-blue-600">{log.issueKey}</b>: &ldquo;{log.newValue}&rdquo;</span>
                    )}
                    {log.action === 'ASSIGNED' && (
                      <span>reassigned <b className="text-blue-600">{log.issueKey}</b> to {log.newValue}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
