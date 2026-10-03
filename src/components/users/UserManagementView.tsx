'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Role, RolePermissions, ROLE_COLORS, ROLE_LABELS 
} from '@/lib/types';
import { 
  Users, Plus, Shield, Check, X, Mail, Building, Key, 
  RotateCcw, Save, Sparkles, Camera, Lock, UserCog, Briefcase, Eye, EyeOff 
} from 'lucide-react';

const ALL_ROLES: Role[] = [
  'ADMIN',
  'PROJECT_MANAGER',
  'PRODUCT_OWNER',
  'ARCHITECT',
  'SCRUM_MASTER',
  'UI_UX_DESIGNER',
  'DEVELOPER',
  'QA_ENGINEER',
  'VIEWER',
];

const CAPABILITIES: { key: keyof RolePermissions; label: string; desc: string }[] = [
  { key: 'canCreateProject', label: 'Create & Manage Projects', desc: 'Provision new workspaces and configure project templates' },
  { key: 'canManageProjectSettings', label: 'Manage Project Settings', desc: 'Edit project key, name, and workflow schemes' },
  { key: 'canManageMembers', label: 'Manage Members & Allocation', desc: 'Add or remove project members and assign leads' },
  { key: 'canCreateSprint', label: 'Create & Plan Sprints', desc: 'Schedule new sprints and allocate backlog items' },
  { key: 'canStartCompleteSprint', label: 'Start & Complete Sprints', desc: 'Trigger active sprint cycles and complete retrospectives' },
  { key: 'canCreateIssue', label: 'Create Stories, Epics & Bugs', desc: 'File new work items, bug reports, and requirements' },
  { key: 'canEditIssue', label: 'Edit & Update Issues', desc: 'Modify descriptions, story points, hours, and priorities' },
  { key: 'canDeleteIssue', label: 'Delete Issues / Destructive Actions', desc: 'Permanently remove tickets, tasks, or sprints' },
  { key: 'canTransitionIssueStatus', label: 'Transition Issue Workflow Status', desc: 'Move tickets across board columns (Backlog to Done)' },
  { key: 'canAssignIssue', label: 'Assign & Reassign Issues', desc: 'Change assignees and delegates on tickets' },
  { key: 'canAddComment', label: 'Add Comments & Log Work', desc: 'Participate in issue conversations and log spent time' },
  { key: 'canManageUsers', label: 'Manage Roles & Security Schemes', desc: 'Admin rights: grant permissions and change user roles' },
];

export default function UserManagementView() {
  const { 
    users, currentUser, issues, permissions, rolePermissions, 
    updateRolePermission, saveAllRolePermissions, resetRolePermissions, 
    refreshData, showToast, setIsProfileModalOpen 
  } = useApp();

  // Invite Member Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [jobTitle, setJobTitle] = useState('Architect');
  const [role, setRole] = useState<Role>('DEVELOPER');

  // Admin Reset User Password Modal
  const [passwordModalUser, setPasswordModalUser] = useState<{ id: string; name: string } | null>(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Local draft of permission scheme for batch saving
  const [localPermissions, setLocalPermissions] = useState<Record<Role, RolePermissions>>(() => ({
    ...rolePermissions,
  }));
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Sync local draft when context permissions change
  React.useEffect(() => {
    setLocalPermissions({ ...rolePermissions });
  }, [rolePermissions]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          role, 
          department, 
          jobTitle 
        }),
      });
      if (res.ok) {
        showToast(`User ${name} invited as ${ROLE_LABELS[role]}`, 'success');
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
      showToast('Permission denied: Only Admin (Jayasree) can modify enterprise roles', 'error');
      return;
    }
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        showToast(`Role updated to ${ROLE_LABELS[newRole]} successfully`, 'success');
        refreshData();
      }
    } catch (err) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newAdminPassword || newAdminPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: passwordModalUser.id, 
          password: newAdminPassword.trim() 
        }),
      });
      if (res.ok) {
        showToast(`Password for ${passwordModalUser.name} reset successfully!`, 'success');
        setPasswordModalUser(null);
        setNewAdminPassword('');
      } else {
        showToast('Failed to reset user password', 'error');
      }
    } catch (err) {
      showToast('Error resetting password', 'error');
    }
  };

  const handleToggleLocalPermission = (r: Role, capKey: keyof RolePermissions) => {
    if (!permissions.canManageUsers) {
      showToast('Permission denied: Only workspace Admin can customize permission schemes', 'error');
      return;
    }

    setLocalPermissions(prev => {
      const rolePerms = prev[r] || rolePermissions[r];
      return {
        ...prev,
        [r]: {
          ...rolePerms,
          [capKey]: !rolePerms[capKey],
        },
      };
    });
  };

  const handleSavePermissionSchemes = async () => {
    setIsSavingPermissions(true);
    try {
      await saveAllRolePermissions(localPermissions);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (confirm('Reset all roles to standard Atlassian Jira default permissions?')) {
      await resetRolePermissions();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/40 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-jira-text tracking-tight flex items-center space-x-2">
            <span>Enterprise User Directory & Permission Schemes</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-jira-brand text-[10px] font-black uppercase tracking-wider">
              RBAC Matrix
            </span>
          </h1>
          <p className="text-xs text-jira-subtle mt-0.5">
            Configure real Wezblue team profiles, reassign security roles, and customize granular permissions for each role.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-jira-text border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <UserCog className="w-3.5 h-3.5 text-jira-brand" />
            <span>Edit My Profile & Photo</span>
          </button>

          {permissions.canManageUsers && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-jira-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-jira-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-jira-brand" />
            <h2 className="font-bold text-sm text-jira-text">Active Team Members ({users.length})</h2>
          </div>
          <div className="flex items-center space-x-2 text-xs text-jira-subtle">
            <span>Logged in as: <b className="text-jira-text">{currentUser.name}</b></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ROLE_COLORS[currentUser.role]}`}>
              {ROLE_LABELS[currentUser.role] || currentUser.role}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-jira-subtle uppercase text-[10px] font-bold border-b border-jira-border">
              <tr>
                <th className="px-5 py-3">Team Member</th>
                <th className="px-5 py-3">Job Title</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Security Role (RBAC)</th>
                <th className="px-5 py-3">Assigned Issues</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => {
                const userIssues = issues.filter(i => i.assigneeId === u.id);
                const isCurrent = currentUser.id === u.id;

                return (
                  <tr key={u.id} className={`hover:bg-slate-50/70 transition ${isCurrent ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="relative group flex-shrink-0">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                          {isCurrent && (
                            <button
                              type="button"
                              onClick={() => setIsProfileModalOpen(true)}
                              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                              title="Update profile picture"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-jira-text flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.jobTitle || 'Team Member'}</span>
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
                          className={`font-bold text-xs py-1 px-2.5 rounded-lg border outline-none cursor-pointer ${ROLE_COLORS[u.role] || 'bg-slate-100'}`}
                        >
                          {ALL_ROLES.map(r => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-block font-bold text-xs py-0.5 px-2 rounded-lg border ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-jira-brand">
                      {userIssues.length} active items
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {isCurrent ? (
                          <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(true)}
                            className="px-2.5 py-1 bg-blue-50 text-jira-brand hover:bg-blue-100 font-bold rounded-md text-xs transition"
                          >
                            Edit Photo
                          </button>
                        ) : permissions.canManageUsers ? (
                          <button
                            type="button"
                            onClick={() => setPasswordModalUser({ id: u.id, name: u.name })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition flex items-center space-x-1"
                            title="Reset password"
                          >
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Reset Password</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Admin RBAC Permissions Matrix */}
      <div className="bg-white rounded-xl border border-jira-border shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-sm text-jira-text">Enterprise Role Permission Schemes (Customizable)</h2>
            </div>
            <p className="text-xs text-jira-subtle mt-0.5">
              {permissions.canManageUsers 
                ? 'As Administrator, you can toggle any permission checkbox below for any role, then click "Save Permission Scheme".' 
                : 'Role capabilities are enforced across the workspace. Only Administrators can customize permission schemes.'}
            </p>
          </div>

          {permissions.canManageUsers && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleSavePermissionSchemes}
                disabled={isSavingPermissions}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isSavingPermissions ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Permission Scheme</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 min-w-[200px]">Capability</th>
                {ALL_ROLES.map(r => (
                  <th key={r} className="p-3 text-center min-w-[100px]">
                    <div className="flex flex-col items-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${ROLE_COLORS[r]}`}>
                        {r}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-1">
                        {ROLE_LABELS[r].replace(/ \(.*\)/, '')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CAPABILITIES.map(cap => (
                <tr key={cap.key} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{cap.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{cap.desc}</div>
                  </td>
                  {ALL_ROLES.map(r => {
                    const roleMap = localPermissions[r] || rolePermissions[r];
                    const isAllowed = roleMap ? roleMap[cap.key] : false;

                    return (
                      <td key={r} className="p-3 text-center">
                        {permissions.canManageUsers ? (
                          <label className="inline-flex items-center justify-center p-1.5 rounded hover:bg-blue-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(isAllowed)}
                              onChange={() => handleToggleLocalPermission(r, cap.key)}
                              className="w-4 h-4 rounded text-jira-brand focus:ring-jira-brand cursor-pointer"
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-center">
                            {isAllowed ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
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

      {/* Admin Reset User Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAdminResetPassword} className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-jira-border p-6 space-y-4">
            <div className="flex items-center space-x-2 text-jira-text font-bold">
              <Lock className="w-5 h-5 text-jira-brand" />
              <h2>Reset Password for {passwordModalUser.name}</h2>
            </div>
            <p className="text-xs text-slate-500">
              As Administrator, you can assign a new corporate password for this team member.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs px-3 py-2 pr-9 border border-slate-300 rounded-lg outline-none font-medium focus:ring-1 focus:ring-jira-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setPasswordModalUser(null);
                  setNewAdminPassword('');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Save New Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
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
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. liam.dev@wezblue.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Architect"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Architecture & Engineering"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jira-subtle mb-1">Assigned RBAC Security Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium bg-white"
              >
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-jira-brand hover:bg-jira-brandHover text-white text-xs font-bold rounded-lg shadow-xs"
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
