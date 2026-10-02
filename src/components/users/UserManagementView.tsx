'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Role, ROLE_PERMISSIONS } from '@/lib/types';
import { Users, Plus, Shield, Check, X, Mail, Building, Key } from 'lucide-react';

export default function UserManagementView() {
  const { users, currentUser, issues, permissions, refreshData, showToast } = useApp();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [role, setRole] = useState<Role>('DEVELOPER');

  const roleColors: Record<Role, string> = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    PROJECT_MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
    PRODUCT_OWNER: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    DEVELOPER: 'bg-blue-100 text-blue-800 border-blue-200',
    QA_ENGINEER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    VIEWER: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role, department }),
      });
      if (res.ok) {
        showToast(`User ${name} invited with role ${role}`, 'success');
        setName('');
        setEmail('');
        setIsInviteModalOpen(false);
        refreshData();
      }
    } catch (err) {
      showToast('Failed to invite user', 'error');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    if (!permissions.canManageUsers) {
      showToast('Permission denied: Only Admin can modify enterprise roles', 'error');
      return;
    }
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        showToast('User role updated successfully', 'success');
        refreshData();
      }
    } catch (err) {
      showToast('Failed to update role', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight">Enterprise User Directory & RBAC</h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            Role-Based Access Control, team allocations, and organizational permissions management.
          </p>
        </div>

        {permissions.canManageUsers && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-jira-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-jira-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-jira-brand" />
            <h2 className="font-bold text-sm text-jira-text">Active Members ({users.length})</h2>
          </div>
          <span className="text-xs text-jira-subtle">
            Logged in as: <b className="text-jira-text">{currentUser.name}</b> ({currentUser.role})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-jira-subtle uppercase text-[10px] font-bold border-b border-jira-border">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Security Role (RBAC)</th>
                <th className="px-5 py-3">Assigned Issues</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => {
                const userIssues = issues.filter(i => i.assigneeId === u.id);

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-jira-text">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-600">
                      {u.department || 'Engineering'}
                    </td>

                    <td className="px-5 py-3.5">
                      {permissions.canManageUsers ? (
                        <select
                          value={u.role}
                          onChange={e => handleUpdateRole(u.id, e.target.value as Role)}
                          className={`font-bold text-xs py-1 px-2.5 rounded border outline-none cursor-pointer ${roleColors[u.role]}`}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
                          <option value="PRODUCT_OWNER">PRODUCT OWNER</option>
                          <option value="DEVELOPER">DEVELOPER</option>
                          <option value="QA_ENGINEER">QA ENGINEER</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      ) : (
                        <span className={`inline-block font-bold text-xs py-0.5 px-2 rounded border ${roleColors[u.role]}`}>
                          {u.role}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-jira-brand">
                      {userIssues.length} active items
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Security Matrix Table */}
      <div className="bg-white rounded-xl border border-jira-border shadow-xs p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="w-4 h-4 text-purple-600" />
          <h2 className="font-bold text-sm text-jira-text">Enterprise RBAC Permissions Matrix</h2>
        </div>
        <p className="text-xs text-jira-subtle">
          Granular capability enforcement across all 6 predefined enterprise roles.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Capability</th>
                <th className="p-3 text-center">Admin</th>
                <th className="p-3 text-center">Project Mgr</th>
                <th className="p-3 text-center">Product Owner</th>
                <th className="p-3 text-center">Developer</th>
                <th className="p-3 text-center">QA Engineer</th>
                <th className="p-3 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { label: 'Create & Manage Projects', key: 'canCreateProject' },
                { label: 'Start & Complete Sprints', key: 'canStartCompleteSprint' },
                { label: 'Create & Log Issues / Bugs', key: 'canCreateIssue' },
                { label: 'Transition Issue Workflow Status', key: 'canTransitionIssueStatus' },
                { label: 'Assign Team Members', key: 'canAssignIssue' },
                { label: 'Delete Issues / Destructive Actions', key: 'canDeleteIssue' },
                { label: 'Manage Roles & User Directory', key: 'canManageUsers' },
              ].map(cap => (
                <tr key={cap.key} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">{cap.label}</td>
                  {(['ADMIN', 'PROJECT_MANAGER', 'PRODUCT_OWNER', 'DEVELOPER', 'QA_ENGINEER', 'VIEWER'] as Role[]).map(r => {
                    const allowed = ROLE_PERMISSIONS[r][cap.key as keyof typeof ROLE_PERMISSIONS[Role]];
                    return (
                      <td key={r} className="p-3 text-center">
                        {allowed ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleInviteUser} className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4">
            <h2 className="text-base font-bold text-jira-text">Invite Team Member</h2>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Liam Foster"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. liam.dev@wezblue.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Assigned RBAC Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded outline-none font-medium bg-white"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
                <option value="PRODUCT_OWNER">PRODUCT OWNER</option>
                <option value="DEVELOPER">DEVELOPER</option>
                <option value="QA_ENGINEER">QA ENGINEER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded shadow-xs"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
