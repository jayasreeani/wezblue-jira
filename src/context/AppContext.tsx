'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, Project, Sprint, Epic, Issue, ActivityLog, Notification, 
  Role, IssueStatus, ROLE_PERMISSIONS, RolePermissions,
  ConfluenceSpace, ConfluenceDoc, RovoMessage, RovoSource,
  RoadmapInitiative, Attachment
} from '@/lib/types';
import { INITIAL_USERS } from '@/lib/seed-data';

interface AppContextType {
  currentUser: User;
  switchUser: (userId: string) => Promise<void>;
  users: User[];
  projects: Project[];
  currentProject: Project;
  setCurrentProject: (proj: Project) => void;
  issues: Issue[];
  sprints: Sprint[];
  epics: Epic[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  activeView: string;
  setActiveView: (view: string) => void;
  selectedIssue: Issue | null;
  setSelectedIssue: (issue: Issue | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isBulkUploadOpen: boolean;
  setIsBulkUploadOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  bulkImportStories: (payload: { projectId: string; sprintId?: string; stories: any[] }) => Promise<{ success: boolean; importedCount: number; newEpicsCount: number }>;
  refreshData: () => Promise<void>;
  createEpic: (data: { projectId?: string; name: string; summary?: string; color?: string }) => Promise<Epic | null>;
  updateEpic: (id: string, updates: Partial<Epic>) => Promise<Epic | null>;
  deleteEpic: (id: string) => Promise<boolean>;
  createIssue: (data: Partial<Issue>) => Promise<Issue | null>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<Issue | null>;
  deleteIssue: (id: string) => Promise<boolean>;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  permissions: RolePermissions;
  rolePermissions: Record<Role, RolePermissions>;
  updateRolePermission: (role: Role, key: keyof RolePermissions, value: boolean) => Promise<void>;
  saveAllRolePermissions: (permissions: Record<Role, RolePermissions>) => Promise<boolean>;
  resetRolePermissions: () => Promise<void>;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Profile Modal
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  updateCurrentUserProfile: (data: {
    name?: string;
    avatar?: string;
    jobTitle?: string;
    department?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password?: string, quickLogin?: boolean, userId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Projects
  createProject: (data: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  isCreateProjectModalOpen: boolean;
  setIsCreateProjectModalOpen: (open: boolean) => void;

  // Confluence Documentation
  spaces: ConfluenceSpace[];
  docs: ConfluenceDoc[];
  selectedDoc: ConfluenceDoc | null;
  setSelectedDoc: (doc: ConfluenceDoc | null) => void;
  refreshDocs: () => Promise<void>;
  createDoc: (doc: Partial<ConfluenceDoc>) => Promise<ConfluenceDoc | null>;
  updateDoc: (id: string, updates: Partial<ConfluenceDoc>) => Promise<ConfluenceDoc | null>;
  deleteDoc: (id: string) => Promise<boolean>;
  createSpace: (space: { key: string; name: string; description?: string; color?: string; icon?: string }) => Promise<ConfluenceSpace | null>;
  openDocInConfluence: (docOrId: string | ConfluenceDoc) => void;
  addDocAttachment: (docId: string, fileData: { filename: string; fileSize: number; fileType: string; fileUrl?: string }) => Promise<Attachment | null>;
  deleteDocAttachment: (docId: string, attachmentId: string) => Promise<boolean>;

  // Organisation Roadmap
  roadmapInitiatives: RoadmapInitiative[];
  setRoadmapInitiatives: React.Dispatch<React.SetStateAction<RoadmapInitiative[]>>;
  fetchRoadmapInitiatives: () => Promise<void>;
  createRoadmapInitiative: (data: Partial<RoadmapInitiative>) => Promise<RoadmapInitiative | null>;
  updateRoadmapInitiative: (id: string, data: Partial<RoadmapInitiative>) => Promise<RoadmapInitiative | null>;
  deleteRoadmapInitiative: (id: string) => Promise<boolean>;

  // Atlassian ROVO AI Assistant
  isRovoOpen: boolean;
  setIsRovoOpen: (open: boolean) => void;
  rovoMessages: RovoMessage[];
  setRovoMessages: React.Dispatch<React.SetStateAction<RovoMessage[]>>;
  isRovoLoading: boolean;
  askRovo: (question: string) => Promise<void>;
  clearRovoChat: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-jayasree',
    email: 'jayasree.kuniyil@wezblue.com',
    name: 'Jayasree Kuniyil',
    role: 'ADMIN',
    jobTitle: 'Project Manager',
    department: 'Project Management',
    createdAt: '',
    updatedAt: '',
  });
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: 'proj-1',
    key: 'WEZ',
    name: 'Wezblue Enterprise Platform',
    template: 'SCRUM',
    createdAt: '',
    updatedAt: '',
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeView, setActiveView] = useState<string>('kanban');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wezblue_auth');
      const storedUserId = localStorage.getItem('wezblue_user_id');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
      if (storedUserId) {
        let allKnown = INITIAL_USERS;
        try {
          const cached = JSON.parse(localStorage.getItem('wezblue_users_cache') || '[]');
          if (Array.isArray(cached) && cached.length > 0) {
            allKnown = [...allKnown, ...cached];
          }
        } catch (e) {}
        const found = allKnown.find(u => u.id === storedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
      try {
        const CACHE_VERSION_KEY = 'wezblue_cache_version';
        const CURRENT_VERSION = 'v3_clean_slate';
        if (localStorage.getItem(CACHE_VERSION_KEY) !== CURRENT_VERSION) {
          localStorage.removeItem('wezblue_issues_cache');
          localStorage.removeItem('wezblue_epics_cache');
          localStorage.removeItem('wezblue_projects_cache');
          localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
        } else {
          const cachedIssues = JSON.parse(localStorage.getItem('wezblue_issues_cache') || '[]');
          if (Array.isArray(cachedIssues) && cachedIssues.length > 0) {
            const sanitized = cachedIssues.map((i: any) => ({
              ...i,
              priority: (i?.priority || 'MEDIUM').toUpperCase(),
            }));
            setIssues(sanitized);
          }
          const cachedEpics = JSON.parse(localStorage.getItem('wezblue_epics_cache') || '[]');
          if (Array.isArray(cachedEpics) && cachedEpics.length > 0) {
            setEpics(cachedEpics);
          }
          const cachedProjects = JSON.parse(localStorage.getItem('wezblue_projects_cache') || '[]');
          if (Array.isArray(cachedProjects) && cachedProjects.length > 0) {
            setProjects(cachedProjects);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Confluence & ROVO & Roadmap State
  const [spaces, setSpaces] = useState<ConfluenceSpace[]>([]);
  const [docs, setDocs] = useState<ConfluenceDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ConfluenceDoc | null>(null);
  const [roadmapInitiatives, setRoadmapInitiatives] = useState<RoadmapInitiative[]>([]);
  const [isRovoOpen, setIsRovoOpen] = useState(false);
  const [isRovoLoading, setIsRovoLoading] = useState(false);
  const [rovoMessages, setRovoMessages] = useState<RovoMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `### 👋 Hi there! I'm **WezAI**, your enterprise AI assistant.
I am connected directly to your **Wezblue Jira workspace** and **Confluence knowledge base**.

Ask me anything about:
- **Jira Issues & Sprints**: Blockers, acceptance criteria, story points, remaining hours.
- **Confluence Documentation**: Architecture RFCs, PRDs, runbooks, retrospectives.
- **Cross-System Analysis**: Verifying if tickets meet their specification requirements!`,
      timestamp: new Date().toISOString(),
      sources: []
    }
  ]);

  const [rolePermissions, setRolePermissions] = useState<Record<Role, RolePermissions>>(ROLE_PERMISSIONS);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  const permissions = (rolePermissions && rolePermissions[currentUser.role]) || ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.VIEWER;

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const updateRolePermission = async (role: Role, key: keyof RolePermissions, value: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: value,
      },
    }));

    try {
      const res = await fetch('/api/roles/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ singleRole: role, permissionKey: key, value }),
      });
      const data = await res.json();
      if (data.permissions) {
        setRolePermissions(data.permissions);
      }
      showToast(`Updated capability for ${role}`, 'success');
    } catch (e) {
      showToast('Failed to update permission', 'error');
    }
  };

  const saveAllRolePermissions = async (newPermissions: Record<Role, RolePermissions>): Promise<boolean> => {
    try {
      const res = await fetch('/api/roles/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPermissions }),
      });
      const data = await res.json();
      if (res.ok && data.permissions) {
        setRolePermissions(data.permissions);
        showToast('Permission schemes saved successfully!', 'success');
        return true;
      }
      showToast(data.error || 'Failed to save permissions', 'error');
      return false;
    } catch (e: any) {
      showToast(e.message || 'Error saving permissions', 'error');
      return false;
    }
  };

  const resetRolePermissions = async () => {
    try {
      const res = await fetch('/api/roles/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });
      const data = await res.json();
      if (res.ok && data.permissions) {
        setRolePermissions(data.permissions);
        showToast('Permissions reset to Jira defaults', 'info');
      }
    } catch (e) {
      showToast('Failed to reset permissions', 'error');
    }
  };

  const updateCurrentUserProfile = async (data: {
    name?: string;
    avatar?: string;
    jobTitle?: string;
    department?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          ...data,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to update profile' };
      }
      if (resData.user) {
        setCurrentUser(resData.user);
        setUsers(prev => prev.map(u => u.id === resData.user.id ? resData.user : u));

        // Save new password to localStorage so it persists across serverless instances
        if (data.newPassword && typeof window !== 'undefined') {
          try {
            const stored = JSON.parse(localStorage.getItem('wezblue_custom_passwords') || '{}');
            stored[currentUser.id] = data.newPassword.trim();
            stored[currentUser.email.toLowerCase()] = data.newPassword.trim();
            localStorage.setItem('wezblue_custom_passwords', JSON.stringify(stored));
          } catch (e) {}
        }
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update profile' };
    }
  };

  const refreshData = async () => {
    try {
      const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('wezblue_user_id') : currentUser.id;
      const authUrl = storedUserId ? `/api/auth?userId=${storedUserId}` : '/api/auth';

      const [authRes, usersRes, projRes, issuesRes, sprintsRes, epicsRes, actRes, notifRes, spacesRes, docsRes, permsRes] = await Promise.all([
        fetch(authUrl),
        fetch('/api/users'),
        fetch('/api/projects'),
        fetch(`/api/issues?projectId=${currentProject.id}`),
        fetch(`/api/sprints?projectId=${currentProject.id}`),
        fetch(`/api/epics?projectId=${currentProject.id}`),
        fetch(`/api/activity?projectId=${currentProject.id}`),
        fetch('/api/notifications'),
        fetch('/api/confluence/spaces'),
        fetch('/api/confluence/docs'),
        fetch('/api/roles/permissions'),
      ]);

      const [authData, usersData, projData, issuesData, sprintsData, epicsData, actData, notifData, spacesData, docsData, permsData] = await Promise.all([
        authRes.json(),
        usersRes.json(),
        projRes.json(),
        issuesRes.json(),
        sprintsRes.json(),
        epicsRes.json(),
        actRes.json(),
        notifRes.json(),
        spacesRes.json(),
        docsRes.json(),
        permsRes.json(),
      ]);

      if (authData.user) {
        if (!storedUserId || storedUserId === authData.user.id) {
          setCurrentUser(authData.user);
        }
      }
      let finalUsers = usersData.users || [];
      if (typeof window !== 'undefined') {
        try {
          const cachedUsers = JSON.parse(localStorage.getItem('wezblue_users_cache') || '[]');
          if (Array.isArray(cachedUsers) && cachedUsers.length > 0) {
            const serverUserIds = new Set(finalUsers.map((u: any) => u.id));
            const serverEmails = new Set(finalUsers.map((u: any) => (u.email || '').toLowerCase()));
            const localOnly = cachedUsers.filter((u: any) => !serverUserIds.has(u.id) && !serverEmails.has((u.email || '').toLowerCase()));
            finalUsers = [...finalUsers, ...localOnly];
          }
          localStorage.setItem('wezblue_users_cache', JSON.stringify(finalUsers));
        } catch (e) {}
      }
      setUsers(finalUsers);
      if (permsData.permissions) setRolePermissions(permsData.permissions);
      // Intelligent merge for projects: Server projects + client-cached projects
      let finalProjects = projData.projects || [];
      if (typeof window !== 'undefined') {
        try {
          const cachedProjects = JSON.parse(localStorage.getItem('wezblue_projects_cache') || '[]');
          if (Array.isArray(cachedProjects) && cachedProjects.length > 0) {
            const serverProjIds = new Set(finalProjects.map((p: any) => p.id));
            const localOnly = cachedProjects.filter((p: any) => !serverProjIds.has(p.id));
            finalProjects = [...finalProjects, ...localOnly];
          }
          localStorage.setItem('wezblue_projects_cache', JSON.stringify(finalProjects));
        } catch (e) {}
      }
      if (finalProjects.length > 0) {
        setProjects(finalProjects);
        const exists = finalProjects.find((p: Project) => p.id === currentProject?.id);
        if (!exists) {
          setCurrentProject(finalProjects[0]);
        }
      }
      // Intelligent merge for issues: Server issues + client-cached issues
      let finalIssues = issuesData.issues || [];
      if (typeof window !== 'undefined') {
        try {
          const cached = JSON.parse(localStorage.getItem('wezblue_issues_cache') || '[]');
          if (Array.isArray(cached) && cached.length > 0) {
            const serverIds = new Set(finalIssues.map((i: any) => i.id));
            const localOnly = cached.filter((i: any) => !serverIds.has(i.id));
            finalIssues = [...finalIssues, ...localOnly];
          }
          localStorage.setItem('wezblue_issues_cache', JSON.stringify(finalIssues));
        } catch (e) {}
      }
      finalIssues = finalIssues.map((i: any) => ({
        ...i,
        priority: (i.priority || 'MEDIUM').toUpperCase(),
      }));
      setIssues(finalIssues);

      if (sprintsData.sprints) setSprints(sprintsData.sprints);

      // Intelligent merge for epics: Server epics + client-cached epics
      let finalEpics = epicsData.epics || [];
      if (typeof window !== 'undefined') {
        try {
          const cachedEpics = JSON.parse(localStorage.getItem('wezblue_epics_cache') || '[]');
          if (Array.isArray(cachedEpics) && cachedEpics.length > 0) {
            const serverEpicIds = new Set(finalEpics.map((e: any) => e.id));
            const localOnlyEpics = cachedEpics.filter((e: any) => !serverEpicIds.has(e.id));
            finalEpics = [...finalEpics, ...localOnlyEpics];
          }
          localStorage.setItem('wezblue_epics_cache', JSON.stringify(finalEpics));
        } catch (e) {}
      }
      setEpics(finalEpics);

      if (actData.logs) setActivityLogs(actData.logs);
      if (notifData.notifications) setNotifications(notifData.notifications);
      if (spacesData.spaces) setSpaces(spacesData.spaces);
      if (docsData.docs) {
        setDocs(docsData.docs);
        setSelectedDoc(prev => prev ? docsData.docs.find((d: ConfluenceDoc) => d.id === prev.id) || docsData.docs[0] : docsData.docs[0]);
      }
      fetchRoadmapInitiatives();
    } catch (err) {
      console.error('Failed to refresh data', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentProject.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'c' && !isCreateModalOpen && !isSearchOpen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        if (permissions.canCreateIssue) {
          e.preventDefault();
          setIsCreateModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, isSearchOpen, permissions]);

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, quickLogin: true }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('wezblue_user_id', data.user.id);
        }
        showToast(`Switched persona to ${data.user.name} (${data.user.role})`, 'info');
        refreshData();
      }
    } catch (err) {
      showToast('Failed to switch user', 'error');
    }
  };

  const createEpic = async (data: { projectId?: string; name: string; summary?: string; color?: string }): Promise<Epic | null> => {
    try {
      const res = await fetch('/api/epics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: data.projectId || currentProject.id,
          name: data.name.trim(),
          summary: (data.summary || '').trim(),
          color: data.color || '#8777d9',
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.epic) {
        setEpics(prev => {
          const next = [resData.epic, ...prev.filter(e => e.id !== resData.epic.id)];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_epics_cache', JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });
        showToast('Epic created successfully', 'success');
        return resData.epic;
      } else {
        showToast(resData.error || 'Failed to create epic', 'error');
        return null;
      }
    } catch (err: any) {
      showToast('Failed to create epic', 'error');
      return null;
    }
  };

  const updateEpic = async (id: string, updates: Partial<Epic>): Promise<Epic | null> => {
    if (!permissions.canEditIssue) {
      showToast('Permission denied: Your role cannot edit epics', 'error');
      return null;
    }
    // Optimistic local update
    let updatedEpic: Epic | null = null;
    setEpics(prev => {
      const target = prev.find(e => e.id === id);
      if (!target) return prev;
      updatedEpic = { ...target, ...updates, updatedAt: new Date().toISOString() };
      const next = prev.map(e => e.id === id ? updatedEpic! : e);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wezblue_epics_cache', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    try {
      const res = await fetch(`/api/epics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, id }),
      });
      const data = await res.json();
      if (res.ok && data.epic) {
        setEpics(prev => {
          const next = prev.map(e => e.id === id ? data.epic : e);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_epics_cache', JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });
        showToast('Epic updated successfully', 'success');
        return data.epic;
      }
      return updatedEpic;
    } catch (err) {
      return updatedEpic;
    }
  };

  const deleteEpic = async (id: string): Promise<boolean> => {
    if (!permissions.canDeleteIssue) {
      showToast('Permission denied: Only Admin or Project Manager can delete epics', 'error');
      return false;
    }
    // Optimistic deletion
    setEpics(prev => {
      const next = prev.filter(e => e.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wezblue_epics_cache', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    // Unlink any issues attached to this epic in state and storage
    setIssues(prev => {
      const next = prev.map(i => i.epicId === id ? { ...i, epicId: undefined, epic: undefined } : i);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wezblue_issues_cache', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    if (selectedIssue && selectedIssue.epicId === id) {
      setSelectedIssue({ ...selectedIssue, epicId: undefined, epic: undefined });
    }

    try {
      const res = await fetch(`/api/epics/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Epic deleted successfully', 'info');
        return true;
      }
      showToast('Epic deleted', 'info');
      return true;
    } catch (err) {
      showToast('Epic deleted', 'info');
      return true;
    }
  };

  const createIssue = async (data: Partial<Issue>) => {
    if (!permissions.canCreateIssue) {
      showToast('Permission denied: Your role cannot create issues', 'error');
      return null;
    }
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId: currentProject.id }),
      });
      const resData = await res.json();
      if (resData.issue) {
        setIssues(prev => {
          const next = [resData.issue, ...prev.filter(i => i.id !== resData.issue.id)];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_issues_cache', JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });
        showToast(`Issue ${resData.issue.key} created successfully`, 'success');
        refreshData();
        return resData.issue;
      }
      return null;
    } catch (err) {
      showToast('Error creating issue', 'error');
      return null;
    }
  };

  const bulkImportStories = async (payload: { projectId: string; sprintId?: string; stories: any[] }) => {
    try {
      const res = await fetch('/api/issues/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Bulk import failed', 'error');
        return { success: false, importedCount: 0, newEpicsCount: 0 };
      }

      // Immediately merge into issues in state and localStorage cache
      if (data.issues && Array.isArray(data.issues) && data.issues.length > 0) {
        setIssues(prev => {
          const newIds = new Set(data.issues.map((i: any) => i.id));
          const next = [...data.issues, ...prev.filter(p => !newIds.has(p.id))];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_issues_cache', JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });
      }

      // Immediately merge into epics in state and localStorage cache
      if (data.epics && Array.isArray(data.epics) && data.epics.length > 0) {
        setEpics(prev => {
          const incomingIds = new Set(data.epics.map((e: any) => e.id));
          const next = [...data.epics, ...prev.filter(e => !incomingIds.has(e.id))];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_epics_cache', JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });
      }

      showToast(data.message || `Successfully imported ${data.importedCount} user stories!`, 'success');
      return { success: true, importedCount: data.importedCount, newEpicsCount: data.newEpicsCount };
    } catch (err) {
      showToast('Bulk import failed. Please check file format.', 'error');
      return { success: false, importedCount: 0, newEpicsCount: 0 };
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    const isStatusOnly = updates.status && !updates.summary && !updates.description;
    const canPerform = isStatusOnly
      ? (permissions.canTransitionIssueStatus || permissions.canEditIssue)
      : permissions.canEditIssue;

    if (!canPerform) {
      showToast('Permission denied: You do not have permission to modify this issue', 'error');
      return null;
    }

    // 1. Optimistic update
    const current = issues.find(i => i.id === id || i.key.toUpperCase() === id.toUpperCase());
    const optimisticUpdated: Issue | null = current ? {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    } : null;

    if (optimisticUpdated) {
      setIssues(prev => {
        const next = prev.map(i => (i.id === id || i.key.toUpperCase() === id.toUpperCase() ? optimisticUpdated! : i));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('wezblue_issues_cache', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
      if (selectedIssue && (selectedIssue.id === id || selectedIssue.key.toUpperCase() === id.toUpperCase())) {
        setSelectedIssue(optimisticUpdated);
      }
    }

    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, fullIssue: optimisticUpdated }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssues(prev => {
          const next = prev.map(i => (i.id === id || i.key.toUpperCase() === id.toUpperCase() ? data.issue : i));
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_issues_cache', JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });
        if (selectedIssue && (selectedIssue.id === id || selectedIssue.key.toUpperCase() === id.toUpperCase())) {
          setSelectedIssue(data.issue);
        }
        return data.issue;
      }
      return optimisticUpdated;
    } catch (err) {
      return optimisticUpdated;
    }
  };

  const deleteIssue = async (id: string) => {
    if (!permissions.canDeleteIssue) {
      showToast('Permission denied: Only Admin or Project Manager can delete issues', 'error');
      return false;
    }
    // Optimistic deletion
    setIssues(prev => {
      const next = prev.filter(i => i.id !== id && i.key.toUpperCase() !== id.toUpperCase());
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wezblue_issues_cache', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    if (selectedIssue && (selectedIssue.id === id || selectedIssue.key.toUpperCase() === id.toUpperCase())) {
      setSelectedIssue(null);
    }
    showToast('Issue deleted', 'info');
    try {
      await fetch(`/api/issues/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      return true;
    }
  };

  const moveIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    if (!permissions.canTransitionIssueStatus) {
      showToast('Permission denied: Viewers cannot change issue status', 'error');
      return;
    }
    const target = issues.find(i => i.id === issueId || i.key.toUpperCase() === issueId.toUpperCase());
    if (!target) return;

    const actualCompletionDate = newStatus === 'DONE' ? new Date().toISOString() : undefined;
    const actualPoints = newStatus === 'DONE' ? (target.actualPoints || target.storyPoints || 0) : target.actualPoints;

    const updatedIssueObj: Issue = {
      ...target,
      status: newStatus,
      actualCompletionDate,
      actualPoints,
      updatedAt: new Date().toISOString(),
    };

    // Immediate optimistic state & cache update
    setIssues(prev => {
      const next = prev.map(i => (i.id === target.id || i.key.toUpperCase() === target.key.toUpperCase() ? updatedIssueObj : i));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wezblue_issues_cache', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    if (selectedIssue && (selectedIssue.id === target.id || selectedIssue.key.toUpperCase() === target.key.toUpperCase())) {
      setSelectedIssue(updatedIssueObj);
    }

    showToast(`Status updated to ${newStatus.replace(/_/g, ' ')}`, 'info');

    try {
      await updateIssue(target.id, { 
        status: newStatus,
        actualCompletionDate,
        actualPoints,
      });
    } catch (e) {}
  };

  const markNotificationRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const refreshDocs = async () => {
    try {
      const res = await fetch('/api/confluence/docs');
      const data = await res.json();
      if (data.docs) setDocs(data.docs);
    } catch (err) {
      console.error('Failed to refresh docs', err);
    }
  };

  const createDoc = async (docData: Partial<ConfluenceDoc>): Promise<ConfluenceDoc | null> => {
    try {
      const res = await fetch('/api/confluence/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });
      const data = await res.json();
      if (res.ok && data.doc) {
        setDocs(prev => [data.doc, ...prev]);
        setSelectedDoc(data.doc);
        showToast('Document published to Confluence!', 'success');
        return data.doc;
      } else {
        showToast(data.error || 'Failed to create document', 'error');
        return null;
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating document', 'error');
      return null;
    }
  };

  const updateDoc = async (id: string, updates: Partial<ConfluenceDoc>): Promise<ConfluenceDoc | null> => {
    try {
      const res = await fetch(`/api/confluence/docs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.doc) {
        setDocs(prev => prev.map(d => d.id === id ? data.doc : d));
        if (selectedDoc?.id === id) setSelectedDoc(data.doc);
        showToast('Document updated successfully', 'success');
        return data.doc;
      } else {
        showToast(data.error || 'Failed to update document', 'error');
        return null;
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating document', 'error');
      return null;
    }
  };

  const deleteDoc = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/confluence/docs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocs(prev => {
          const next = prev.filter(d => d.id !== id);
          if (selectedDoc?.id === id) {
            setSelectedDoc(next[0] || null);
          }
          return next;
        });
        showToast('Document deleted', 'info');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const createSpace = async (spaceData: { key: string; name: string; description?: string; color?: string; icon?: string }): Promise<ConfluenceSpace | null> => {
    try {
      const res = await fetch('/api/confluence/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...spaceData, projectId: currentProject.id }),
      });
      const data = await res.json();
      if (res.ok && data.space) {
        setSpaces(prev => [...prev, data.space]);
        showToast(`Space "${data.space.name}" created`, 'success');
        return data.space;
      }
      return null;
    } catch {
      return null;
    }
  };

  const openDocInConfluence = (docOrId: string | ConfluenceDoc) => {
    if (typeof docOrId === 'string') {
      const target = docs.find(d => d.id === docOrId || d.title.toLowerCase().includes(docOrId.toLowerCase()));
      if (target) setSelectedDoc(target);
    } else {
      setSelectedDoc(docOrId);
    }
    setActiveView('confluence');
  };

  // Project Management
  const createProject = async (data: Partial<Project>): Promise<Project | null> => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.project) {
        const newProj: Project = resData.project;
        setProjects(prev => {
          const next = [...prev.filter(p => p.id !== newProj.id), newProj];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_projects_cache', JSON.stringify(next));
            } catch {}
          }
          return next;
        });
        setCurrentProject(newProj);
        showToast(`Project ${newProj.name} (${newProj.key}) created successfully!`, 'success');
        setIsCreateProjectModalOpen(false);
        return newProj;
      }
      showToast(resData.error || 'Failed to create project', 'error');
      return null;
    } catch {
      showToast('Error creating project', 'error');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        setProjects(prev => {
          const next = prev.map(p => p.id === id ? data.project : p);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('wezblue_projects_cache', JSON.stringify(next));
            } catch {}
          }
          return next;
        });
        if (currentProject.id === id) {
          setCurrentProject(data.project);
        }
        showToast('Project updated successfully', 'success');
        return data.project;
      }
      showToast(data.error || 'Failed to update project', 'error');
      return null;
    } catch {
      showToast('Error updating project', 'error');
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        const remaining = projects.filter(p => p.id !== id);
        setProjects(remaining);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('wezblue_projects_cache', JSON.stringify(remaining));
          } catch {}
        }
        if (currentProject.id === id) {
          if (remaining.length > 0) {
            setCurrentProject(remaining[0]);
          }
        }
        await refreshData();
        showToast('Project deleted successfully', 'info');
        return true;
      }
      showToast(data.error || 'Failed to delete project', 'error');
      return false;
    } catch {
      showToast('Error deleting project', 'error');
      return false;
    }
  };

  // Doc Attachments
  const addDocAttachment = async (docId: string, fileData: { filename: string; fileSize: number; fileType: string; fileUrl?: string }): Promise<Attachment | null> => {
    try {
      const res = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, ...fileData }),
      });
      const data = await res.json();
      if (res.ok && data.attachment) {
        setDocs(prev => prev.map(d => {
          if (d.id === docId) {
            const nextAttachments = [...(d.attachments || []), data.attachment];
            return { ...d, attachments: nextAttachments };
          }
          return d;
        }));
        if (selectedDoc && selectedDoc.id === docId) {
          setSelectedDoc(prev => prev ? {
            ...prev,
            attachments: [...(prev.attachments || []), data.attachment],
          } : null);
        }
        showToast('Attachment uploaded successfully', 'success');
        return data.attachment;
      }
      showToast('Failed to upload attachment', 'error');
      return null;
    } catch {
      showToast('Error uploading attachment', 'error');
      return null;
    }
  };

  const deleteDocAttachment = async (docId: string, attachmentId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/attachments?docId=${docId}&attachmentId=${attachmentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDocs(prev => prev.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              attachments: (d.attachments || []).filter(a => a.id !== attachmentId),
            };
          }
          return d;
        }));
        if (selectedDoc && selectedDoc.id === docId) {
          setSelectedDoc(prev => prev ? {
            ...prev,
            attachments: (prev.attachments || []).filter(a => a.id !== attachmentId),
          } : null);
        }
        showToast('Attachment removed', 'info');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Organisation Roadmap
  const fetchRoadmapInitiatives = async () => {
    try {
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      if (res.ok && data.initiatives) {
        setRoadmapInitiatives(data.initiatives);
      }
    } catch (e) {
      console.error('Failed to load roadmap initiatives', e);
    }
  };

  const createRoadmapInitiative = async (data: Partial<RoadmapInitiative>): Promise<RoadmapInitiative | null> => {
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.initiative) {
        setRoadmapInitiatives(prev => [...prev, resData.initiative]);
        showToast('Strategic initiative added to Roadmap', 'success');
        return resData.initiative;
      }
      showToast(resData.error || 'Failed to create initiative', 'error');
      return null;
    } catch {
      showToast('Error creating initiative', 'error');
      return null;
    }
  };

  const updateRoadmapInitiative = async (id: string, data: Partial<RoadmapInitiative>): Promise<RoadmapInitiative | null> => {
    try {
      const res = await fetch(`/api/roadmap/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.initiative) {
        setRoadmapInitiatives(prev => prev.map(i => i.id === id ? resData.initiative : i));
        showToast('Roadmap initiative updated', 'success');
        return resData.initiative;
      }
      return null;
    } catch {
      return null;
    }
  };

  const deleteRoadmapInitiative = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/roadmap/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoadmapInitiatives(prev => prev.filter(i => i.id !== id));
        showToast('Initiative removed from roadmap', 'info');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const askRovo = async (question: string) => {
    if (!question.trim()) return;
    const userMsg: RovoMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    setRovoMessages(prev => [...prev, userMsg]);
    setIsRovoLoading(true);

    try {
      const res = await fetch('/api/rovo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history: rovoMessages.slice(-6),
          context: {
            issues,
            sprints,
            epics,
            docs,
            projects,
            initiatives: roadmapInitiatives,
          }
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const assistantMsg: RovoMessage = {
          id: 'msg-' + Date.now() + '-rovo',
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          timestamp: new Date().toISOString(),
        };
        setRovoMessages(prev => [...prev, assistantMsg]);
      } else {
        const errorMsg: RovoMessage = {
          id: 'msg-' + Date.now() + '-rovo-err',
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an error: ${data.error || 'Failed to generate answer'}. Please try again.`,
          timestamp: new Date().toISOString(),
        };
        setRovoMessages(prev => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: RovoMessage = {
        id: 'msg-' + Date.now() + '-rovo-err',
        role: 'assistant',
        content: `⚠️ Network error while connecting to WezAI service: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setRovoMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsRovoLoading(false);
    }
  };

  const clearRovoChat = () => {
    setRovoMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `### 👋 WezAI Chat Reset\nI am ready for your next question regarding Jira tickets or Confluence documentation!`,
        timestamp: new Date().toISOString(),
        sources: []
      }
    ]);
  };

  const login = async (
    email: string, 
    password?: string, 
    quickLogin: boolean = false, 
    userId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      let customPasswords: Record<string, string> | undefined = undefined;
      let cachedUsers: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          customPasswords = JSON.parse(localStorage.getItem('wezblue_custom_passwords') || '{}');
          cachedUsers = JSON.parse(localStorage.getItem('wezblue_users_cache') || '[]');
        } catch (e) {}
      }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, quickLogin, userId, customPasswords, cachedUsers }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('wezblue_auth', 'true');
          localStorage.setItem('wezblue_user_id', data.user.id);
        }
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        refreshData();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wezblue_auth');
      localStorage.removeItem('wezblue_user_id');
      window.location.href = '/login';
    }
    showToast('Signed out from Wezblue workspace', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        users,
        projects,
        currentProject,
        setCurrentProject,
        issues,
        sprints,
        epics,
        activityLogs,
        notifications,
        activeView,
        setActiveView,
        selectedIssue,
        setSelectedIssue,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isBulkUploadOpen,
        setIsBulkUploadOpen,
        isSearchOpen,
        setIsSearchOpen,
        refreshData,
        createEpic,
        updateEpic,
        deleteEpic,
        createIssue,
        bulkImportStories,
        updateIssue,
        deleteIssue,
        moveIssueStatus,
        markNotificationRead,
        markAllNotificationsRead,
        permissions,
        rolePermissions,
        updateRolePermission,
        saveAllRolePermissions,
        resetRolePermissions,
        toast,
        showToast,

        // Profile Modal
        isProfileModalOpen,
        setIsProfileModalOpen,
        updateCurrentUserProfile,

        // Authentication
        isAuthenticated,
        login,
        logout,

        // Projects
        createProject,
        updateProject,
        deleteProject,
        isCreateProjectModalOpen,
        setIsCreateProjectModalOpen,

        // Confluence
        spaces,
        docs,
        selectedDoc,
        setSelectedDoc,
        refreshDocs,
        createDoc,
        updateDoc,
        deleteDoc,
        createSpace,
        openDocInConfluence,
        addDocAttachment,
        deleteDocAttachment,

        // Organisation Roadmap
        roadmapInitiatives,
        setRoadmapInitiatives,
        fetchRoadmapInitiatives,
        createRoadmapInitiative,
        updateRoadmapInitiative,
        deleteRoadmapInitiative,

        // ROVO AI
        isRovoOpen,
        setIsRovoOpen,
        rovoMessages,
        setRovoMessages,
        isRovoLoading,
        askRovo,
        clearRovoChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
