'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, Project, Sprint, Epic, Issue, ActivityLog, Notification, 
  Role, IssueStatus, ROLE_PERMISSIONS, RolePermissions,
  ConfluenceSpace, ConfluenceDoc, RovoMessage, RovoSource
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

  // Profile & Personas Modals
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isPersonasModalOpen: boolean;
  setIsPersonasModalOpen: (open: boolean) => void;
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
        const found = INITIAL_USERS.find(u => u.id === storedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    }
  }, []);

  // Confluence & ROVO State
  const [spaces, setSpaces] = useState<ConfluenceSpace[]>([]);
  const [docs, setDocs] = useState<ConfluenceDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ConfluenceDoc | null>(null);
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
  const [isPersonasModalOpen, setIsPersonasModalOpen] = useState(false);

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
      if (usersData.users) setUsers(usersData.users);
      if (permsData.permissions) setRolePermissions(permsData.permissions);
      if (projData.projects) {
        setProjects(projData.projects);
        if (!currentProject.id && projData.projects.length > 0) {
          setCurrentProject(projData.projects[0]);
        }
      }
      if (issuesData.issues) setIssues(issuesData.issues);
      if (sprintsData.sprints) setSprints(sprintsData.sprints);
      if (epicsData.epics) setEpics(epicsData.epics);
      if (actData.logs) setActivityLogs(actData.logs);
      if (notifData.notifications) setNotifications(notifData.notifications);
      if (spacesData.spaces) setSpaces(spacesData.spaces);
      if (docsData.docs) {
        setDocs(docsData.docs);
        setSelectedDoc(prev => prev ? docsData.docs.find((d: ConfluenceDoc) => d.id === prev.id) || docsData.docs[0] : docsData.docs[0]);
      }
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
      showToast(data.message || `Successfully imported ${data.importedCount} user stories!`, 'success');
      await refreshData();
      return { success: true, importedCount: data.importedCount, newEpicsCount: data.newEpicsCount };
    } catch (err) {
      showToast('Bulk import failed. Please check file format.', 'error');
      return { success: false, importedCount: 0, newEpicsCount: 0 };
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    if (!permissions.canEditIssue) {
      showToast('Permission denied: Your role cannot edit issues', 'error');
      return null;
    }
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.issue) {
        setIssues(prev => prev.map(i => (i.id === id || i.key === id ? data.issue : i)));
        if (selectedIssue && (selectedIssue.id === id || selectedIssue.key === id)) {
          setSelectedIssue(data.issue);
        }
        showToast(`Updated ${data.issue.key}`, 'success');
        refreshData();
        return data.issue;
      }
      return null;
    } catch (err) {
      showToast('Error updating issue', 'error');
      return null;
    }
  };

  const deleteIssue = async (id: string) => {
    if (!permissions.canDeleteIssue) {
      showToast('Permission denied: Only Admin or Project Manager can delete issues', 'error');
      return false;
    }
    try {
      const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIssues(prev => prev.filter(i => i.id !== id && i.key !== id));
        if (selectedIssue && (selectedIssue.id === id || selectedIssue.key === id)) {
          setSelectedIssue(null);
        }
        showToast('Issue deleted', 'info');
        refreshData();
        return true;
      }
      return false;
    } catch (err) {
      showToast('Error deleting issue', 'error');
      return false;
    }
  };

  const moveIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    if (!permissions.canTransitionIssueStatus) {
      showToast('Permission denied: Viewers cannot change issue status', 'error');
      return;
    }
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    ));
    await updateIssue(issueId, { status: newStatus });
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
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, quickLogin, userId }),
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

        // Profile & Personas
        isProfileModalOpen,
        setIsProfileModalOpen,
        isPersonasModalOpen,
        setIsPersonasModalOpen,
        updateCurrentUserProfile,

        // Authentication
        isAuthenticated,
        login,
        logout,

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
