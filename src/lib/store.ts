import fs from 'fs';
import path from 'path';
import { 
  User, Project, Sprint, Epic, Issue, Comment, Attachment, ActivityLog, Notification, 
  Role, IssueStatus, Priority, BugSeverity, WorkLog,
  ConfluenceSpace, ConfluenceDoc, RovoMessage, RovoSource, DocStatus, DocCategory,
  RolePermissions, ROLE_PERMISSIONS, RoadmapInitiative
} from './types';
import { 
  INITIAL_USERS, INITIAL_PROJECTS, INITIAL_SPRINTS, 
  INITIAL_EPICS, INITIAL_ISSUES, INITIAL_NOTIFICATIONS, INITIAL_ACTIVITY_LOGS,
  INITIAL_CONFLUENCE_SPACES, INITIAL_CONFLUENCE_DOCS
} from './seed-data';

export const INITIAL_ROADMAP_INITIATIVES: RoadmapInitiative[] = [
  {
    id: "init-1",
    title: "Zero-Trust Enterprise Authentication & SSO",
    description: "Multi-tenant OAuth2/SAML with biometric mobile MFA and session anomaly detection.",
    track: "Security & Compliance",
    targetQuarter: "Q1 2026",
    startDate: "2026-01-10",
    endDate: "2026-03-31",
    status: "IN_PROGRESS",
    progress: 85,
    owner: "Althaf Thajudeen",
    linkedEpicIds: ["epic-1"],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "init-2",
    title: "Event-Driven Microservices Mesh & Kafka Bus",
    description: "High-throughput asynchronous messaging pipeline for real-time task notifications.",
    track: "Core Platform & Microservices",
    targetQuarter: "Q2 2026",
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    status: "IN_PROGRESS",
    progress: 60,
    owner: "Abhijith Mohan",
    linkedEpicIds: ["epic-2"],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "init-3",
    title: "Next-Gen Mobile App 3.0 (iOS & Android)",
    description: "Complete UI/UX overhaul with offline caching, push alerts, and biometric quick approve.",
    track: "Enterprise Mobile Apps",
    targetQuarter: "Q3 2026",
    startDate: "2026-06-01",
    endDate: "2026-09-30",
    status: "PLANNED",
    progress: 25,
    owner: "Vineeth M",
    linkedEpicIds: [],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "init-4",
    title: "Multi-Cloud FinOps & Automated AI Observability",
    description: "Infrastructure cost optimization, auto-scaling Kubernetes clusters, and AI health probes.",
    track: "DevOps & Cloud Governance",
    targetQuarter: "Q4 2026",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    status: "PLANNED",
    progress: 10,
    owner: "Ramees Raja",
    linkedEpicIds: [],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "init-5",
    title: "Autonomous Agile AI Agent (WezAI 2.0)",
    description: "Autonomous sprint backlog groomer, velocity forecaster, and automated code review assistant.",
    track: "Core Platform & Microservices",
    targetQuarter: "H1 2027",
    startDate: "2027-01-01",
    endDate: "2027-06-30",
    status: "PLANNED",
    progress: 0,
    owner: "Jayasree Kuniyil",
    linkedEpicIds: [],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  }
];

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const BASE_DB_FILE = path.join(LOCAL_DATA_DIR, 'wezblue_db.json');
const DATA_DIR = process.env.VERCEL ? '/tmp/wezblue_data' : LOCAL_DATA_DIR;
const DB_FILE = path.join(DATA_DIR, 'wezblue_db.json');

class JiraDataStore {
  private users: User[] = [...INITIAL_USERS];
  private projects: Project[] = [...INITIAL_PROJECTS];
  private sprints: Sprint[] = [...INITIAL_SPRINTS];
  private epics: Epic[] = [...INITIAL_EPICS];
  private issues: Issue[] = [...INITIAL_ISSUES];
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  private activityLogs: ActivityLog[] = [...INITIAL_ACTIVITY_LOGS];
  private spaces: ConfluenceSpace[] = [...INITIAL_CONFLUENCE_SPACES];
  private docs: ConfluenceDoc[] = [...INITIAL_CONFLUENCE_DOCS];
  private roadmapInitiatives: RoadmapInitiative[] = [...INITIAL_ROADMAP_INITIATIVES];
  private currentUser: User = INITIAL_USERS[0];
  private rolePermissions: Record<Role, RolePermissions> = { ...ROLE_PERMISSIONS };

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (typeof window === 'undefined') {
        let raw: string | null = null;
        if (fs.existsSync(DB_FILE)) {
          raw = fs.readFileSync(DB_FILE, 'utf-8');
        } else if (fs.existsSync(BASE_DB_FILE)) {
          raw = fs.readFileSync(BASE_DB_FILE, 'utf-8');
        }

        if (raw) {
          const data = JSON.parse(raw);
          if (data.users && Array.isArray(data.users) && data.users.length) this.users = data.users;
          if (data.projects && Array.isArray(data.projects) && data.projects.length) this.projects = data.projects;
          if (data.sprints && Array.isArray(data.sprints)) this.sprints = data.sprints;
          if (data.epics && Array.isArray(data.epics)) this.epics = data.epics;
          if (data.issues && Array.isArray(data.issues)) this.issues = data.issues;
          if (data.notifications && Array.isArray(data.notifications)) this.notifications = data.notifications;
          if (data.activityLogs && Array.isArray(data.activityLogs)) this.activityLogs = data.activityLogs;
          if (data.spaces && Array.isArray(data.spaces)) this.spaces = data.spaces;
          if (data.docs && Array.isArray(data.docs)) this.docs = data.docs;
          if (data.roadmapInitiatives && Array.isArray(data.roadmapInitiatives)) this.roadmapInitiatives = data.roadmapInitiatives;
          if (data.rolePermissions && typeof data.rolePermissions === 'object') {
            this.rolePermissions = { ...ROLE_PERMISSIONS, ...data.rolePermissions };
          }
          if (data.currentUser) this.currentUser = data.currentUser;
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load local DB snapshot:', e);
    }
    this.persist();
  }

  public persist() {
    try {
      if (typeof window === 'undefined') {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const snapshot = {
          version: '1.0.0',
          savedAt: new Date().toISOString(),
          users: this.users,
          projects: this.projects,
          sprints: this.sprints,
          epics: this.epics,
          issues: this.issues,
          notifications: this.notifications,
          activityLogs: this.activityLogs,
          spaces: this.spaces,
          docs: this.docs,
          roadmapInitiatives: this.roadmapInitiatives,
          rolePermissions: this.rolePermissions,
          currentUser: this.currentUser,
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');

        // If local file is writable and not in Vercel, also sync to BASE_DB_FILE
        if (!process.env.VERCEL && DATA_DIR !== LOCAL_DATA_DIR && fs.existsSync(LOCAL_DATA_DIR)) {
          try {
            fs.writeFileSync(BASE_DB_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
          } catch {}
        }
      }
    } catch (e) {
      // Ignore write errors in read-only environments
    }
  }

  public exportBackup() {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      workspace: 'Wezblue Enterprise Jira',
      users: this.users,
      projects: this.projects,
      sprints: this.sprints,
      epics: this.epics,
      issues: this.issues,
      notifications: this.notifications,
      activityLogs: this.activityLogs,
      spaces: this.spaces,
      docs: this.docs,
    };
  }

  public importBackup(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (data.users && Array.isArray(data.users)) this.users = data.users;
    if (data.projects && Array.isArray(data.projects)) this.projects = data.projects;
    if (data.sprints && Array.isArray(data.sprints)) this.sprints = data.sprints;
    if (data.epics && Array.isArray(data.epics)) this.epics = data.epics;
    if (data.issues && Array.isArray(data.issues)) this.issues = data.issues;
    if (data.notifications && Array.isArray(data.notifications)) this.notifications = data.notifications;
    if (data.activityLogs && Array.isArray(data.activityLogs)) this.activityLogs = data.activityLogs;
    if (data.spaces && Array.isArray(data.spaces)) this.spaces = data.spaces;
    if (data.docs && Array.isArray(data.docs)) this.docs = data.docs;
    this.persist();
    return true;
  }

  getUsers() { return this.users; }
  getUserById(id: string) { return this.users.find(u => u.id === id); }
  getCurrentUser() { return this.currentUser; }
  setCurrentUser(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user) this.currentUser = user;
    return this.currentUser;
  }

  public syncCustomPasswords(customPasswords: Record<string, string>) {
    if (!customPasswords || typeof customPasswords !== 'object') return;
    let modified = false;
    for (const [key, pass] of Object.entries(customPasswords)) {
      if (!pass || typeof pass !== 'string') continue;
      const cleanKey = key.trim().toLowerCase();
      const user = this.users.find(u => 
        u.id === key || 
        u.email.toLowerCase() === cleanKey
      );
      if (user && user.password !== pass.trim()) {
        user.password = pass.trim();
        user.updatedAt = new Date().toISOString();
        if (this.currentUser.id === user.id) {
          this.currentUser = { ...user };
        }
        modified = true;
      }
    }
    if (modified) {
      this.persist();
    }
  }

  authenticate(email: string, password?: string, customPasswords?: Record<string, string>): { success: boolean; user?: User; error?: string } {
    if (customPasswords && typeof customPasswords === 'object') {
      this.syncCustomPasswords(customPasswords);
    }

    const cleanEmail = email.trim().toLowerCase();
    const normalizedEmail = cleanEmail.replace('@wezzblue.', '@wezblue.');

    let user = this.users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      u.email.toLowerCase() === normalizedEmail ||
      u.email.toLowerCase().replace('@wezblue.', '@wezzblue.') === cleanEmail
    );

    if (!user) {
      if (cleanEmail.includes('@')) {
        const usernamePart = cleanEmail.split('@')[0];
        const formattedName = usernamePart
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        user = {
          id: 'user-' + (this.users.length + 1),
          name: formattedName || 'Wezblue Team Member',
          email: cleanEmail,
          role: 'DEVELOPER',
          department: 'Engineering',
          password: password || 'Wezblue@123',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.users.push(user);
        this.persist();
      } else {
        return { success: false, error: 'Please enter a valid email address (e.g. name@wezblue.com)' };
      }
    }

    // Has user set a custom password?
    const isCustomPasswordSet = !!(user.password && user.password !== 'Wezblue@123');
    const validPassword = user.password || 'Wezblue@123';

    if (password) {
      if (isCustomPasswordSet) {
        // If a new password has been set, the old default password MUST BE REJECTED
        if (password !== validPassword) {
          if (password === 'Wezblue@123') {
            return { 
              success: false, 
              error: 'Default password is no longer valid. Please sign in with your updated new password.' 
            };
          }
          return { 
            success: false, 
            error: 'Invalid password. Please check your credentials and try again.' 
          };
        }
      } else {
        // Default corporate password check
        if (password !== validPassword && password !== 'Wezblue@123' && password !== 'admin123') {
          return { 
            success: false, 
            error: 'Invalid password. (Default corporate password is Wezblue@123)' 
          };
        }
      }
    }

    this.currentUser = user;
    return { success: true, user };
  }
  addUser(data: { name: string; email: string; role: Role; department?: string }) {
    const newUser: User = {
      id: 'user-' + (this.users.length + 1),
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department || 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.persist();
    return newUser;
  }
  updateUserRole(userId: string, role: Role) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      user.updatedAt = new Date().toISOString();
      if (this.currentUser.id === userId) {
        this.currentUser = { ...user };
      }
      this.persist();
    }
    return user;
  }

  updateUserProfile(userId: string, updates: { name?: string; avatar?: string; jobTitle?: string; department?: string; password?: string; role?: Role }) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    if (updates.name !== undefined && updates.name.trim()) user.name = updates.name.trim();
    if (updates.avatar !== undefined && updates.avatar.trim()) user.avatar = updates.avatar.trim();
    if (updates.jobTitle !== undefined && updates.jobTitle.trim()) user.jobTitle = updates.jobTitle.trim();
    if (updates.department !== undefined && updates.department.trim()) user.department = updates.department.trim();
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.password !== undefined && updates.password.trim()) user.password = updates.password.trim();
    user.updatedAt = new Date().toISOString();
    if (this.currentUser.id === userId) {
      this.currentUser = { ...user };
    }
    this.persist();
    return user;
  }

  changePassword(userId: string, currentPass: string, newPass: string): { success: boolean; error?: string } {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found in directory.' };
    const validPass = user.password || 'Wezblue@123';
    if (currentPass !== validPass && currentPass !== 'Wezblue@123') {
      return { success: false, error: 'Current password does not match. (Default is Wezblue@123)' };
    }
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    user.password = newPass.trim();
    user.updatedAt = new Date().toISOString();
    if (this.currentUser.id === userId) {
      this.currentUser = { ...user };
    }
    this.persist();
    return { success: true };
  }

  getRolePermissions(): Record<Role, RolePermissions> {
    return this.rolePermissions;
  }

  updateRolePermissions(newPermissions: Partial<Record<Role, Partial<RolePermissions>>>): Record<Role, RolePermissions> {
    for (const [r, perms] of Object.entries(newPermissions)) {
      const roleKey = r as Role;
      if (this.rolePermissions[roleKey] && perms) {
        this.rolePermissions[roleKey] = {
          ...this.rolePermissions[roleKey],
          ...perms,
        };
      }
    }
    this.persist();
    return this.rolePermissions;
  }

  updateSingleRolePermission(role: Role, permissionKey: keyof RolePermissions, value: boolean): Record<Role, RolePermissions> {
    if (this.rolePermissions[role]) {
      this.rolePermissions[role] = {
        ...this.rolePermissions[role],
        [permissionKey]: value,
      };
      this.persist();
    }
    return this.rolePermissions;
  }

  resetRolePermissions(): Record<Role, RolePermissions> {
    this.rolePermissions = { ...ROLE_PERMISSIONS };
    this.persist();
    return this.rolePermissions;
  }

  getProjects() { return this.projects; }
  getProjectById(id: string) { return this.projects.find(p => p.id === id || p.key === id); }
  createProject(data: Partial<Project>) {
    const newProj: Project = {
      id: 'proj-' + (this.projects.length + 1),
      key: (data.key || 'PRJ').toUpperCase(),
      name: data.name || 'New Project',
      description: data.description || '',
      template: data.template || 'SCRUM',
      leadId: data.leadId || this.currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.push(newProj);
    this.persist();
    return newProj;
  }

  updateProject(id: string, updates: Partial<Project>) {
    const index = this.projects.findIndex(p => p.id === id || p.key === id);
    if (index === -1) return null;
    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      key: updates.key ? updates.key.toUpperCase() : this.projects[index].key,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.projects[index];
  }

  deleteProject(id: string) {
    const index = this.projects.findIndex(p => p.id === id || p.key === id);
    if (index === -1) return false;
    const proj = this.projects[index];
    this.projects.splice(index, 1);
    this.issues = this.issues.filter(i => i.projectId !== proj.id);
    this.sprints = this.sprints.filter(s => s.projectId !== proj.id);
    this.epics = this.epics.filter(e => e.projectId !== proj.id);
    this.persist();
    return true;
  }

  getSprints(projectId?: string) {
    if (projectId) return this.sprints.filter(s => s.projectId === projectId);
    return this.sprints;
  }
  getSprintById(id: string) { return this.sprints.find(s => s.id === id); }
  createSprint(projectId: string, name: string, goal?: string, startDate?: string, endDate?: string) {
    const sprintCount = this.sprints.filter(s => s.projectId === projectId).length + 1;
    const newSprint: Sprint = {
      id: 'sprint-' + Date.now(),
      projectId,
      name: name || ('Sprint ' + sprintCount),
      goal,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'FUTURE',
      velocity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sprints.push(newSprint);
    this.persist();
    return newSprint;
  }
  startSprint(sprintId: string) {
    const sprint = this.sprints.find(s => s.id === sprintId);
    if (sprint) {
      sprint.status = 'ACTIVE';
      sprint.startDate = new Date().toISOString();
      sprint.updatedAt = new Date().toISOString();
      this.persist();
    }
    return sprint;
  }
  completeSprint(sprintId: string, moveToSprintId?: string) {
    const sprint = this.sprints.find(s => s.id === sprintId);
    if (sprint) {
      sprint.status = 'COMPLETED';
      sprint.updatedAt = new Date().toISOString();

      const sprintDoneIssues = this.issues.filter(i => i.sprintId === sprintId && i.status === 'DONE');
      sprint.velocity = sprintDoneIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

      const incomplete = this.issues.filter(i => i.sprintId === sprintId && i.status !== 'DONE');
      incomplete.forEach(issue => {
        issue.sprintId = moveToSprintId || undefined;
      });
      this.persist();
    }
    return sprint;
  }

  getEpics(projectId?: string) {
    if (projectId) return this.epics.filter(e => e.projectId === projectId);
    return this.epics;
  }
  createEpic(projectId: string, name: string, summary?: string, color: string = '#8777d9') {
    const newEpic: Epic = {
      id: 'epic-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      projectId,
      name,
      summary,
      color,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.epics.push(newEpic);
    this.persist();
    return newEpic;
  }

  updateEpic(id: string, updates: Partial<Epic>) {
    let index = this.epics.findIndex(e => e.id === id);
    if (index === -1) {
      if (updates.name && (updates as any).projectId) {
        const created: Epic = {
          id,
          projectId: (updates as any).projectId,
          name: updates.name,
          summary: updates.summary || '',
          color: updates.color || '#8777d9',
          status: updates.status || 'IN_PROGRESS',
          createdAt: (updates as any).createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.epics.push(created);
        this.persist();
        return created;
      }
      return null;
    }
    this.epics[index] = {
      ...this.epics[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.epics[index];
  }

  deleteEpic(id: string) {
    const index = this.epics.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.epics.splice(index, 1);
    // Unlink issues attached to this epic
    this.issues.forEach(i => {
      if (i.epicId === id) {
        i.epicId = undefined;
        i.epic = undefined;
      }
    });
    this.persist();
    return true;
  }

  getIssues(filter?: { projectId?: string; sprintId?: string; type?: string; status?: string; search?: string }) {
    let result = [...this.issues];
    if (filter?.projectId) result = result.filter(i => i.projectId === filter.projectId);
    if (filter?.sprintId) result = result.filter(i => i.sprintId === filter.sprintId);
    if (filter?.type) result = result.filter(i => i.type === filter.type);
    if (filter?.status) result = result.filter(i => i.status === filter.status);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(i => 
        i.key.toLowerCase().includes(q) || 
        i.summary.toLowerCase().includes(q) || 
        (i.description && i.description.toLowerCase().includes(q))
      );
    }
    return result.map(issue => this.hydrateIssue(issue));
  }

  getIssueById(id: string) {
    const issue = this.issues.find(i => i.id === id || i.key.toUpperCase() === id.toUpperCase());
    return issue ? this.hydrateIssue(issue) : null;
  }

  private hydrateIssue(issue: Issue): Issue {
    return {
      ...issue,
      assignee: this.users.find(u => u.id === issue.assigneeId),
      reporter: this.users.find(u => u.id === issue.reporterId),
      sprint: this.sprints.find(s => s.id === issue.sprintId),
      epic: this.epics.find(e => e.id === issue.epicId),
      parentStory: this.issues.find(i => i.id === issue.parentStoryId),
      linkedIssues: this.issues.filter(i => i.parentStoryId === issue.id),
      subtasks: issue.subtasks || [],
      comments: (issue.comments || []).map(c => ({
        ...c,
        author: this.users.find(u => u.id === c.authorId)
      })),
      attachments: issue.attachments || [],
      workLogs: (issue.workLogs || []).map(w => ({
        ...w,
        user: this.users.find(u => u.id === w.userId)
      })),
      linkedDocs: this.docs
        .filter(d => (d.linkedIssueKeys || []).includes(issue.key) || (issue.linkedDocIds || []).includes(d.id))
        .map(d => this.hydrateDoc(d)),
    };
  }

  hydrateDoc(doc: ConfluenceDoc): ConfluenceDoc {
    return {
      ...doc,
      author: this.users.find(u => u.id === doc.authorId),
      space: this.spaces.find(s => s.id === doc.spaceId),
      attachments: (doc.attachments || []).map(a => ({
        ...a,
        uploader: this.users.find(u => u.id === a.uploaderId) || this.currentUser,
      })),
    };
  }

  createIssue(data: Partial<Issue>) {
    const project = this.projects.find(p => p.id === data.projectId) || this.projects[0];
    const projectIssues = this.issues.filter(i => i.projectId === project.id);
    const nextNum = 100 + projectIssues.length + 1;
    const key = project.key + '-' + nextNum;

    // Automatically map Epic, Feature, and Phase if linked to a parent User Story
    let epicId = data.epicId;
    let feature = data.feature;
    let phase = data.phase || 'MVP';
    if (data.parentStoryId) {
      const parentStory = this.issues.find(i => i.id === data.parentStoryId || i.key === data.parentStoryId);
      if (parentStory) {
        if (parentStory.epicId) epicId = parentStory.epicId;
        if (parentStory.feature && !feature) feature = parentStory.feature;
        if (parentStory.phase && (!data.phase || data.phase === 'MVP')) phase = parentStory.phase;
      }
    }

    const newIssue: Issue = {
      id: 'issue-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      key,
      projectId: project.id,
      type: data.type || 'STORY',
      summary: data.summary || 'Untitled Issue',
      description: data.description || '',
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      severity: data.severity,
      storyPoints: data.storyPoints,
      actualPoints: data.actualPoints || (data.status === 'DONE' ? data.storyPoints : 0),
      estimatedHours: data.estimatedHours,
      actualHours: data.actualHours || 0,
      remainingHours: data.remainingHours !== undefined ? data.remainingHours : (data.estimatedHours || 0),
      parentStoryId: data.parentStoryId,
      order: projectIssues.length + 1,
      assigneeId: data.assigneeId,
      reporterId: data.reporterId || this.currentUser.id,
      sprintId: data.sprintId,
      epicId: epicId,
      feature: feature,
      acceptanceCriteria: data.acceptanceCriteria,
      phase: phase,
      dueDate: data.dueDate,
      plannedCompletionDate: data.plannedCompletionDate,
      actualCompletionDate: data.status === 'DONE' ? new Date().toISOString() : undefined,
      environment: data.environment,
      reproduceSteps: data.reproduceSteps,
      figmaUrl: data.figmaUrl,
      subtasks: [],
      comments: [],
      attachments: [],
      workLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.issues.push(newIssue);
    this.persist();

    this.logActivity({
      projectId: project.id,
      issueId: newIssue.id,
      issueKey: newIssue.key,
      userId: this.currentUser.id,
      action: 'ISSUE_CREATED',
      fieldChanged: 'summary',
      oldValue: '',
      newValue: newIssue.summary,
    });

    if (newIssue.assigneeId && newIssue.assigneeId !== this.currentUser.id) {
      this.createNotification({
        userId: newIssue.assigneeId,
        title: 'New Issue Assigned',
        message: `${this.currentUser.name} assigned you to ${newIssue.key}: ${newIssue.summary}`,
        link: newIssue.key,
      });
    }

    return this.hydrateIssue(newIssue);
  }

  updateIssue(id: string, updates: Partial<Issue>) {
    let index = this.issues.findIndex(i => i.id === id || i.key.toUpperCase() === id.toUpperCase());
    if (index === -1) {
      if ((updates as any).fullIssue) {
        this.issues.push((updates as any).fullIssue);
        index = this.issues.length - 1;
      } else {
        return null;
      }
    }

    const oldIssue = { ...this.issues[index] };

    // Automatically map Epic, Feature, and Phase if parentStoryId is updated
    if (updates.parentStoryId !== undefined) {
      if (updates.parentStoryId) {
        const parentStory = this.issues.find(i => i.id === updates.parentStoryId || i.key === updates.parentStoryId);
        if (parentStory) {
          if (parentStory.epicId) updates.epicId = parentStory.epicId;
          if (parentStory.feature && updates.feature === undefined) updates.feature = parentStory.feature;
          if (parentStory.phase && updates.phase === undefined) updates.phase = parentStory.phase;
        }
      }
    }

    // Automatic capture of actualCompletionDate when transition to/from DONE
    if (updates.status === 'DONE' && oldIssue.status !== 'DONE') {
      updates.actualCompletionDate = new Date().toISOString();
      if (updates.actualPoints === undefined && (updates.storyPoints || oldIssue.storyPoints)) {
        updates.actualPoints = updates.storyPoints || oldIssue.storyPoints;
      }
    } else if (updates.status && updates.status !== 'DONE' && oldIssue.status === 'DONE') {
      updates.actualCompletionDate = undefined;
    }

    const updated = { ...oldIssue, ...updates, updatedAt: new Date().toISOString() };
    this.issues[index] = updated;
    this.persist();

    if (updates.status && updates.status !== oldIssue.status) {
      this.logActivity({
        projectId: updated.projectId,
        issueId: updated.id,
        issueKey: updated.key,
        userId: this.currentUser.id,
        action: 'STATUS_CHANGE',
        fieldChanged: 'status',
        oldValue: oldIssue.status,
        newValue: updates.status,
      });
    }

    if (updates.assigneeId && updates.assigneeId !== oldIssue.assigneeId) {
      this.logActivity({
        projectId: updated.projectId,
        issueId: updated.id,
        issueKey: updated.key,
        userId: this.currentUser.id,
        action: 'ASSIGNED',
        fieldChanged: 'assignee',
        oldValue: oldIssue.assigneeId || 'Unassigned',
        newValue: updates.assigneeId,
      });
      if (updates.assigneeId !== this.currentUser.id) {
        this.createNotification({
          userId: updates.assigneeId,
          title: 'Issue Assigned',
          message: `${this.currentUser.name} assigned you to ${updated.key}`,
          link: updated.key,
        });
      }
    }

    return this.hydrateIssue(updated);
  }

  deleteIssue(id: string) {
    const index = this.issues.findIndex(i => i.id === id || i.key.toUpperCase() === id.toUpperCase());
    if (index !== -1) {
      const deleted = this.issues.splice(index, 1)[0];
      this.persist();
      return deleted;
    }
    return null;
  }

  addSubtask(issueId: string, title: string) {
    const issue = this.issues.find(i => i.id === issueId || i.key === issueId);
    if (issue) {
      if (!issue.subtasks) issue.subtasks = [];
      const subtask = { id: 'sub-' + Date.now(), title, completed: false };
      issue.subtasks.push(subtask);
      issue.updatedAt = new Date().toISOString();
      this.persist();
      return subtask;
    }
    return null;
  }

  toggleSubtask(issueId: string, subtaskId: string) {
    const issue = this.issues.find(i => i.id === issueId || i.key === issueId);
    if (issue && issue.subtasks) {
      const subtask = issue.subtasks.find(s => s.id === subtaskId);
      if (subtask) {
        subtask.completed = !subtask.completed;
        issue.updatedAt = new Date().toISOString();
        this.persist();
        return subtask;
      }
    }
    return null;
  }

  addComment(issueId: string, content: string) {
    const issue = this.issues.find(i => i.id === issueId || i.key === issueId);
    if (issue) {
      if (!issue.comments) issue.comments = [];
      const newComment: Comment = {
        id: 'comm-' + Date.now(),
        issueId: issue.id,
        authorId: this.currentUser.id,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      issue.comments.push(newComment);
      issue.updatedAt = new Date().toISOString();
      this.persist();

      this.logActivity({
        projectId: issue.projectId,
        issueId: issue.id,
        issueKey: issue.key,
        userId: this.currentUser.id,
        action: 'COMMENT_ADDED',
        fieldChanged: 'comment',
        oldValue: '',
        newValue: content.slice(0, 40) + '...',
      });

      if (issue.assigneeId && issue.assigneeId !== this.currentUser.id) {
        this.createNotification({
          userId: issue.assigneeId,
          title: 'New Comment on ' + issue.key,
          message: `${this.currentUser.name} commented: "${content.slice(0, 60)}..."`,
          link: issue.key,
        });
      }

      return {
        ...newComment,
        author: this.currentUser,
      };
    }
    return null;
  }

  addAttachment(issueId: string, fileData: { filename: string; fileSize: number; fileType: string; fileUrl?: string }) {
    const issue = this.issues.find(i => i.id === issueId || i.key === issueId);
    if (issue) {
      if (!issue.attachments) issue.attachments = [];
      const att: Attachment = {
        id: 'att-' + Date.now(),
        issueId: issue.id,
        filename: fileData.filename,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
        fileUrl: fileData.fileUrl || '#',
        uploaderId: this.currentUser.id,
        uploader: this.currentUser,
        createdAt: new Date().toISOString(),
      };
      issue.attachments.push(att);
      issue.updatedAt = new Date().toISOString();
      this.persist();
      return att;
    }
    return null;
  }

  // --- Work Logging & Daily Updates ---
  logWork(issueId: string, hours: number, comment?: string) {
    const issue = this.issues.find(i => i.id === issueId || i.key === issueId);
    if (issue) {
      if (!issue.workLogs) issue.workLogs = [];
      const workLog: WorkLog = {
        id: 'worklog-' + Date.now(),
        issueId: issue.id,
        userId: this.currentUser.id,
        user: this.currentUser,
        hours: Number(hours),
        comment: comment || 'Daily progress update',
        createdAt: new Date().toISOString(),
      };
      issue.workLogs.unshift(workLog);

      const oldActual = issue.actualHours || 0;
      issue.actualHours = Number((oldActual + Number(hours)).toFixed(1));
      
      const currentRemaining = issue.remainingHours !== undefined ? issue.remainingHours : (issue.estimatedHours || 0);
      issue.remainingHours = Math.max(0, Number((currentRemaining - Number(hours)).toFixed(1)));
      issue.updatedAt = new Date().toISOString();
      this.persist();

      this.logActivity({
        projectId: issue.projectId,
        issueId: issue.id,
        issueKey: issue.key,
        userId: this.currentUser.id,
        action: 'WORK_LOGGED',
        fieldChanged: 'actualHours',
        oldValue: `${oldActual} hrs`,
        newValue: `${issue.actualHours} hrs (+${hours}h logged)`,
      });

      return this.hydrateIssue(issue);
    }
    return null;
  }

  getActivityLogs(projectId?: string, limit: number = 30) {
    let logs = [...this.activityLogs];
    if (projectId) logs = logs.filter(l => l.projectId === projectId);
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return logs.slice(0, limit).map(l => ({
      ...l,
      user: this.users.find(u => u.id === l.userId)
    }));
  }

  logActivity(data: Omit<ActivityLog, 'id' | 'createdAt'>) {
    const log: ActivityLog = {
      ...data,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    this.activityLogs.unshift(log);
    return log;
  }

  getNotifications(userId: string) {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  }

  markAllNotificationsRead(userId: string) {
    this.notifications.filter(n => n.userId === userId).forEach(n => { n.read = true; });
    return true;
  }

  createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const notif: Notification = {
      ...data,
      id: 'notif-' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }

  // ================= Confluence Spaces & Docs =================
  getSpaces(projectId?: string) {
    if (projectId) return this.spaces.filter(s => !s.projectId || s.projectId === projectId);
    return this.spaces;
  }

  getSpaceById(id: string) {
    return this.spaces.find(s => s.id === id || s.key.toUpperCase() === id.toUpperCase());
  }

  createSpace(data: { key: string; name: string; description?: string; color?: string; icon?: string; projectId?: string }) {
    const newSpace: ConfluenceSpace = {
      id: 'space-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      key: (data.key || 'SPC').toUpperCase(),
      name: data.name || 'New Documentation Space',
      description: data.description || '',
      icon: data.icon || 'BookOpen',
      color: data.color || '#0052cc',
      projectId: data.projectId || 'proj-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.spaces.push(newSpace);
    this.persist();
    return newSpace;
  }

  updateSpace(id: string, data: Partial<ConfluenceSpace>) {
    const space = this.spaces.find(s => s.id === id);
    if (space) {
      Object.assign(space, data, { updatedAt: new Date().toISOString() });
      this.persist();
    }
    return space;
  }

  getDocs(filter?: { spaceId?: string; search?: string; status?: string; category?: string; issueKey?: string }) {
    let result = [...this.docs];
    if (filter?.spaceId) result = result.filter(d => d.spaceId === filter.spaceId);
    if (filter?.status) result = result.filter(d => d.status === filter.status);
    if (filter?.category) result = result.filter(d => d.category === filter.category);
    if (filter?.issueKey) {
      const ik = filter.issueKey.toUpperCase();
      result = result.filter(d => (d.linkedIssueKeys || []).some(k => k.toUpperCase() === ik));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.content.toLowerCase().includes(q) ||
        d.excerpt.toLowerCase().includes(q)
      );
    }
    return result.map(d => this.hydrateDoc(d));
  }

  getDocById(id: string) {
    const doc = this.docs.find(d => d.id === id);
    return doc ? this.hydrateDoc(doc) : null;
  }

  createDoc(data: Partial<ConfluenceDoc>) {
    const excerpt = data.excerpt || (data.content ? data.content.slice(0, 140).replace(/^[#\s]+/, '') + '...' : '');
    const newDoc: ConfluenceDoc = {
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      spaceId: data.spaceId || (this.spaces[0]?.id || 'space-eng'),
      title: data.title || 'Untitled Document',
      content: data.content || '# New Page\n\nWrite your documentation here...',
      excerpt,
      parentId: data.parentId,
      status: (data.status as DocStatus) || 'DRAFT',
      category: (data.category as DocCategory) || 'GENERAL',
      authorId: data.authorId || this.currentUser.id,
      linkedIssueKeys: data.linkedIssueKeys || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.docs.unshift(newDoc);

    // If doc linked to issues, update issues' linkedDocIds
    if (newDoc.linkedIssueKeys && newDoc.linkedIssueKeys.length > 0) {
      newDoc.linkedIssueKeys.forEach(key => {
        const issue = this.issues.find(i => i.key.toUpperCase() === key.toUpperCase());
        if (issue) {
          if (!issue.linkedDocIds) issue.linkedDocIds = [];
          if (!issue.linkedDocIds.includes(newDoc.id)) issue.linkedDocIds.push(newDoc.id);
        }
      });
    }

    this.persist();
    return this.hydrateDoc(newDoc);
  }

  updateDoc(id: string, data: Partial<ConfluenceDoc>) {
    const doc = this.docs.find(d => d.id === id);
    if (!doc) return null;
    if (data.title !== undefined) doc.title = data.title;
    if (data.content !== undefined) {
      doc.content = data.content;
      if (!data.excerpt) {
        doc.excerpt = data.content.slice(0, 140).replace(/^[#\s]+/, '') + '...';
      }
    }
    if (data.excerpt !== undefined) doc.excerpt = data.excerpt;
    if (data.spaceId !== undefined) doc.spaceId = data.spaceId;
    if (data.status !== undefined) doc.status = data.status;
    if (data.category !== undefined) doc.category = data.category;
    if (data.parentId !== undefined) doc.parentId = data.parentId;
    if (data.attachments !== undefined) doc.attachments = data.attachments;
    if (data.linkedIssueKeys !== undefined) {
      doc.linkedIssueKeys = data.linkedIssueKeys;
      data.linkedIssueKeys.forEach(key => {
        const issue = this.issues.find(i => i.key.toUpperCase() === key.toUpperCase());
        if (issue) {
          if (!issue.linkedDocIds) issue.linkedDocIds = [];
          if (!issue.linkedDocIds.includes(doc.id)) issue.linkedDocIds.push(doc.id);
        }
      });
    }
    doc.updatedAt = new Date().toISOString();
    this.persist();
    return this.hydrateDoc(doc);
  }

  deleteDoc(id: string) {
    const idx = this.docs.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.docs.splice(idx, 1);
      this.issues.forEach(i => {
        if (i.linkedDocIds) {
          i.linkedDocIds = i.linkedDocIds.filter(did => did !== id);
        }
      });
      this.persist();
      return true;
    }
    return false;
  }

  addDocAttachment(docId: string, fileData: { filename: string; fileSize: number; fileType: string; fileUrl?: string }) {
    const doc = this.docs.find(d => d.id === docId);
    if (!doc) return null;
    if (!doc.attachments) doc.attachments = [];
    const att: Attachment = {
      id: 'doc-att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      docId: doc.id,
      filename: fileData.filename,
      fileSize: fileData.fileSize,
      fileType: fileData.fileType,
      fileUrl: fileData.fileUrl || '',
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      uploaderId: this.currentUser?.id || 'user-jayasree',
      uploader: this.currentUser,
    };
    doc.attachments.push(att);
    doc.updatedAt = new Date().toISOString();
    this.persist();
    return att;
  }

  deleteDocAttachment(docId: string, attachmentId: string) {
    const doc = this.docs.find(d => d.id === docId);
    if (!doc || !doc.attachments) return false;
    const idx = doc.attachments.findIndex(a => a.id === attachmentId);
    if (idx !== -1) {
      doc.attachments.splice(idx, 1);
      doc.updatedAt = new Date().toISOString();
      this.persist();
      return true;
    }
    return false;
  }

  // ================= Organisation Roadmap =================
  getRoadmapInitiatives() {
    return this.roadmapInitiatives;
  }

  getRoadmapInitiativeById(id: string) {
    return this.roadmapInitiatives.find(i => i.id === id);
  }

  createRoadmapInitiative(data: Partial<RoadmapInitiative>) {
    const newInit: RoadmapInitiative = {
      id: 'init-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: data.title || 'New Strategic Initiative',
      description: data.description || '',
      track: data.track || 'Core Platform & Microservices',
      targetQuarter: data.targetQuarter || 'Q2 2026',
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      endDate: data.endDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      status: data.status || 'PLANNED',
      progress: data.progress !== undefined ? data.progress : 0,
      owner: data.owner || this.currentUser.name,
      linkedEpicIds: data.linkedEpicIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roadmapInitiatives.push(newInit);
    this.persist();
    return newInit;
  }

  updateRoadmapInitiative(id: string, data: Partial<RoadmapInitiative>) {
    const init = this.roadmapInitiatives.find(i => i.id === id);
    if (!init) return null;
    Object.assign(init, data, { updatedAt: new Date().toISOString() });
    this.persist();
    return init;
  }

  deleteRoadmapInitiative(id: string) {
    const idx = this.roadmapInitiatives.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.roadmapInitiatives.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  // ================= Atlassian ROVO / WezAI Cross-System AI Engine =================
  rovoChat(
    message: string, 
    _history: RovoMessage[] = [],
    context?: {
      issues?: Issue[];
      sprints?: Sprint[];
      epics?: Epic[];
      docs?: ConfluenceDoc[];
      projects?: Project[];
    }
  ): { answer: string; sources: RovoSource[] } {
    const query = message.trim();
    const qLower = query.toLowerCase();
    const sources: RovoSource[] = [];

    const addSource = (s: RovoSource) => {
      if (!sources.find(x => x.id === s.id && x.type === s.type)) {
        sources.push(s);
      }
    };

    // Hydrate dataset using either context payload (client cache) or internal store
    const activeIssues = (context?.issues && context.issues.length > 0) ? context.issues : this.issues;
    const activeSprints = (context?.sprints && context.sprints.length > 0) ? context.sprints : this.sprints;
    const activeEpics = (context?.epics && context.epics.length > 0) ? context.epics : this.epics;
    const activeDocs = (context?.docs && context.docs.length > 0) ? context.docs : this.docs;
    const activeUsers = this.users;

    // 1. Direct Ticket Match (e.g. WEZ-101, WB-101, PRJ-101, etc.)
    const ticketMatches = query.match(/([A-Za-z]{2,10})-\d+/gi);
    if (ticketMatches && ticketMatches.length > 0) {
      const matchedKeys = Array.from(new Set(ticketMatches.map(k => k.toUpperCase())));
      const matchedIssues = activeIssues.filter(i => matchedKeys.includes(i.key.toUpperCase()));
      
      if (matchedIssues.length > 0) {
        let answer = `### 🔍 Information for ${matchedKeys.join(', ')}\n\n`;
        matchedIssues.forEach(issue => {
          const assignee = activeUsers.find(u => u.id === issue.assigneeId);
          const sprint = activeSprints.find(s => s.id === issue.sprintId);
          const epic = activeEpics.find(e => e.id === issue.epicId);

          addSource({
            type: 'jira',
            id: issue.id,
            keyOrTitle: issue.key,
            snippet: `${issue.type}: ${issue.summary} (${issue.status})`
          });

          answer += `#### **[${issue.key}] ${issue.summary}**\n`;
          answer += `- **Type**: \`${issue.type}\` | **Priority**: \`${issue.priority}\` | **Status**: \`${issue.status.replace(/_/g, ' ')}\`\n`;
          if (assignee) answer += `- **Assignee**: ${assignee.name} (${assignee.role})\n`;
          if (sprint) answer += `- **Sprint**: ${sprint.name} (${sprint.status})\n`;
          if (epic) answer += `- **Epic**: ${epic.name}\n`;
          if (issue.feature) answer += `- **Feature**: *${issue.feature}*\n`;
          if (issue.phase) answer += `- **Release Phase**: \`${issue.phase}\`\n`;
          if (issue.estimatedHours !== undefined) {
            answer += `- **Hours Tracking**: ${issue.estimatedHours}h est. | ${issue.actualHours || 0}h logged | ${issue.remainingHours || 0}h remaining\n`;
          }
          if (issue.storyPoints !== undefined) {
            answer += `- **Story Points**: ${issue.storyPoints} pts\n`;
          }
          if (issue.description) answer += `- **Description**: ${issue.description}\n`;
          if (issue.acceptanceCriteria) {
            answer += `\n**📋 Acceptance Criteria**:\n\`\`\`text\n${issue.acceptanceCriteria}\n\`\`\`\n`;
          }

          // Find linked docs
          const linkedDocs = activeDocs.filter(d => 
            (d.linkedIssueKeys || []).map(k => k.toUpperCase()).includes(issue.key.toUpperCase()) ||
            (issue.linkedDocIds || []).includes(d.id)
          );
          if (linkedDocs.length > 0) {
            answer += `\n**Linked Documentation Pages**:\n`;
            linkedDocs.forEach(d => {
              addSource({
                type: 'confluence',
                id: d.id,
                keyOrTitle: d.title,
                snippet: `${d.category}: ${d.excerpt}`
              });
              answer += `- 📄 **[Doc: ${d.title}]** (\`${d.status}\` | \`${d.category}\`) — ${d.excerpt}\n`;
            });
          }
          answer += `\n---\n`;
        });

        return { answer, sources };
      }
    }

    // 2. Organisation Roadmap & Strategic Milestones
    if (qLower.includes('roadmap') || qLower.includes('initiative') || qLower.includes('strategic') || qLower.includes('quarter') || qLower.includes('milestone') || qLower.includes('vision')) {
      const inits = this.roadmapInitiatives;
      inits.forEach(i => {
        addSource({
          type: 'confluence',
          id: i.id,
          keyOrTitle: `Roadmap: ${i.title}`,
          snippet: `${i.track} (${i.targetQuarter}) - ${i.status}: ${i.progress}% done`
        });
      });

      let answer = `### 🗺️ Organisation Strategic Roadmap & Horizon\n\n`;
      answer += `Here is the current strategic trajectory across our engineering and product tracks:\n\n`;

      const quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'H1 2027'];
      quarters.forEach(q => {
        const matching = inits.filter(i => i.targetQuarter === q);
        if (matching.length > 0) {
          answer += `#### 📅 **${q} Initiatives**:\n`;
          matching.forEach(i => {
            answer += `- **${i.title}** (\`${i.status}\` — **${i.progress}% complete**)\n`;
            answer += `  - **Track**: \`${i.track}\` | **Owner**: ${i.owner || 'Leadership'}\n`;
            if (i.description) answer += `  - *Scope*: ${i.description}\n`;
          });
          answer += `\n`;
        }
      });

      return { answer, sources };
    }

    // 3. Acceptance Criteria / Mobile OTP / Login queries
    if (qLower.includes('acceptance criteria') || qLower.includes('otp') || qLower.includes('passwordless') || qLower.includes('mobile login')) {
      const otpStory = activeIssues.find(i => i.key.toUpperCase() === 'WEZ-101' || i.key.toUpperCase() === 'WB-101' || i.feature?.toLowerCase().includes('otp') || i.summary.toLowerCase().includes('otp'));
      const prdDoc = activeDocs.find(d => d.id === 'doc-3' || d.title.toLowerCase().includes('otp') || d.title.toLowerCase().includes('prd'));
      const rfcDoc = activeDocs.find(d => d.id === 'doc-1' || d.title.toLowerCase().includes('sso'));

      if (otpStory) {
        addSource({ type: 'jira', id: otpStory.id, keyOrTitle: otpStory.key, snippet: otpStory.summary });
      }
      if (prdDoc) {
        addSource({ type: 'confluence', id: prdDoc.id, keyOrTitle: prdDoc.title, snippet: prdDoc.excerpt });
      }
      if (rfcDoc) {
        addSource({ type: 'confluence', id: rfcDoc.id, keyOrTitle: rfcDoc.title, snippet: rfcDoc.excerpt });
      }

      let answer = `### 📱 Mobile OTP & Passwordless Login Specifications\n\n`;
      const keyRef = otpStory ? `**[${otpStory.key}]**` : `**[WB-101]**`;
      answer += `Based on Jira story ${keyRef} and Confluence document **[Doc: PRD: Mobile OTP & Passwordless Resident Authentication]**, here is the approved specification:\n\n`;
      answer += `#### **Release Phase**: \`MVP\` | **Epic**: Account & Profile | **Lead Architect**: Althaf Thajudeen\n\n`;
      answer += `#### **Given / When / Then Acceptance Criteria**:\n`;
      answer += `1. **Given** I enter a registered mobile or email, **when** I request a code, **then** a 6-digit OTP is sent within 30 seconds and expires after 5 minutes.\n`;
      answer += `2. **Given** I enter a wrong OTP 5 times, **when** I try again, **then** login is blocked for 15 minutes and I see a clear message.\n`;
      answer += `3. **Given** I enter an unregistered number, **when** I request a code, **then** I am told to use my invite or request to join a society.\n`;
      answer += `4. **Given** I choose *'remember this device'*, **when** I reopen the app within 30 days, **then** I stay logged in.\n\n`;
      answer += `#### 🛡️ Architecture & Security Rules:\n`;
      answer += `- **Clock Skew**: 60 seconds tolerance configured to accommodate IdP clock drift.\n`;
      answer += `- **Token Rotation**: Access tokens expire in 15 min; refresh tokens slide for 30 days in Redis (see **[Doc: Architecture RFC: Enterprise SSO & OAuth2 / SAML Flow]**).\n`;
      answer += `- **Rate Limiting**: Blocked for 15 minutes after 5 failed attempts.\n`;

      return { answer, sources };
    }

    // 4. Blockers & Open Bugs / Critical Defects
    if (qLower.includes('blocker') || qLower.includes('bug') || qLower.includes('defect') || qLower.includes('critical')) {
      const bugs = activeIssues.filter(i => i.type === 'BUG');
      bugs.forEach(b => addSource({ type: 'jira', id: b.id, keyOrTitle: b.key, snippet: `${b.severity || b.priority}: ${b.summary}` }));
      
      const runbookDoc = activeDocs.find(d => d.id === 'doc-5' || d.title.toLowerCase().includes('runbook') || d.title.toLowerCase().includes('incident'));
      if (runbookDoc) addSource({ type: 'confluence', id: runbookDoc.id, keyOrTitle: runbookDoc.title, snippet: runbookDoc.excerpt });

      let answer = `### 🐛 Open Bugs & Triage Status\n\n`;
      answer += `Currently tracking **${bugs.length} bugs** across the platform:\n\n`;
      bugs.forEach(b => {
        const assignee = activeUsers.find(u => u.id === b.assigneeId);
        const sprint = activeSprints.find(s => s.id === b.sprintId);
        answer += `#### **[${b.key}] ${b.summary}**\n`;
        answer += `- **Severity**: \`${b.severity || 'MAJOR'}\` | **Priority**: \`${b.priority}\` | **Status**: \`${b.status.replace(/_/g, ' ')}\`\n`;
        answer += `- **Assignee**: ${assignee?.name || 'Unassigned'} | **Sprint**: ${sprint?.name || 'Backlog'}\n`;
        answer += `- **Hours Tracking**: ${b.estimatedHours || 0}h estimated, ${b.actualHours || 0}h logged, ${b.remainingHours || 0}h remaining\n`;
        if (b.description) answer += `- **Root Cause / Impact**: ${b.description}\n`;
        answer += `\n`;
      });

      answer += `\n> [!TIP]\n> Refer to **[Doc: Runbook: Production Incident Triage & Log Inspection]** for P1/P2 alert thresholds and rollback commands.\n`;
      return { answer, sources };
    }

    // 5. Sprint Status / Active Sprint / Burndown / Velocity
    if (qLower.includes('sprint') || qLower.includes('burndown') || qLower.includes('velocity') || qLower.includes('active sprint')) {
      const activeSprint = activeSprints.find(s => s.status === 'ACTIVE') || activeSprints[0];
      if (!activeSprint) {
        return {
          answer: `No sprint found in current workspace. You can create or start a sprint from the Backlog board.`,
          sources: []
        };
      }

      const sprintIssues = activeIssues.filter(i => i.sprintId === activeSprint.id);
      const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
      const completedPoints = sprintIssues.filter(i => i.status === 'DONE').reduce((sum, i) => sum + (i.storyPoints || 0), 0);
      const totalEstHours = sprintIssues.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);
      const totalRemHours = sprintIssues.reduce((sum, i) => sum + (i.remainingHours || 0), 0);

      sprintIssues.slice(0, 4).forEach(i => addSource({ type: 'jira', id: i.id, keyOrTitle: i.key, snippet: i.summary }));
      const retroDoc = activeDocs.find(d => d.category === 'RETROSPECTIVE');
      if (retroDoc) addSource({ type: 'confluence', id: retroDoc.id, keyOrTitle: retroDoc.title, snippet: retroDoc.excerpt });

      let answer = `### 🚀 Active Sprint Overview: ${activeSprint.name}\n\n`;
      answer += `- **Status**: \`${activeSprint.status}\` | **Timeline**: ${activeSprint.startDate ? activeSprint.startDate.slice(0, 10) : 'Current'} to ${activeSprint.endDate ? activeSprint.endDate.slice(0, 10) : 'Upcoming'}\n`;
      if (activeSprint.goal) answer += `- **Sprint Goal**: *"${activeSprint.goal}"*\n`;
      answer += `- **Story Points**: **${completedPoints} / ${totalPoints} pts** completed (${Math.round((completedPoints / (totalPoints || 1)) * 100)}%)\n`;
      answer += `- **Hours Remaining**: **${totalRemHours}h** remaining out of **${totalEstHours}h** planned\n\n`;
      
      answer += `#### **Sprint Issues Breakdown**:\n`;
      sprintIssues.forEach(i => {
        answer += `- **[${i.key}]** \`${i.status.replace(/_/g, ' ')}\` — ${i.summary} (${i.storyPoints || 0} pts, ${i.remainingHours || 0}h rem)\n`;
      });

      if (retroDoc) {
        answer += `\n*Previous Sprint Retrospective: **[Doc: ${retroDoc.title}]** (Velocity: 28 pts)*\n`;
      }
      return { answer, sources };
    }

    // 6. Architecture & Technical Design RFCs
    if (qLower.includes('architecture') || qLower.includes('rfc') || qLower.includes('design') || qLower.includes('sso') || qLower.includes('saml') || qLower.includes('websocket') || qLower.includes('confluence')) {
      const archDocs = activeDocs.filter(d => d.category === 'ARCHITECTURE' || d.category === 'DECISION_RECORD' || d.category === 'PRD');
      archDocs.forEach(d => addSource({ type: 'confluence', id: d.id, keyOrTitle: d.title, snippet: d.excerpt }));

      let answer = `### 🏛️ Architecture & System Design Documentation\n\n`;
      answer += `Here is the current technical blueprint from Confluence:\n\n`;
      archDocs.forEach(d => {
        const author = activeUsers.find(u => u.id === d.authorId);
        answer += `#### **[Doc: ${d.title}]** (\`${d.status}\`)\n`;
        answer += `- **Space**: ${this.spaces.find(s => s.id === d.spaceId)?.name || 'Engineering'}\n`;
        answer += `- **Author**: ${author?.name || 'Lead Architect'}\n`;
        answer += `- **Summary**: ${d.excerpt}\n`;
        if (d.linkedIssueKeys && d.linkedIssueKeys.length > 0) {
          answer += `- **Related Jira Tickets**: ${d.linkedIssueKeys.map(k => `**[${k}]**`).join(', ')}\n`;
          d.linkedIssueKeys.forEach(k => {
            const iss = activeIssues.find(i => i.key.toUpperCase() === k.toUpperCase());
            if (iss) addSource({ type: 'jira', id: iss.id, keyOrTitle: iss.key, snippet: iss.summary });
          });
        }
        answer += `\n`;
      });
      return { answer, sources };
    }

    // 7. Team Member Workload (Althaf, Jayasree, Binsitha, Abhijith, Ramees, Vineeth)
    const userMatch = activeUsers.find(u => 
      qLower.includes(u.name.toLowerCase()) || 
      qLower.includes(u.name.split(' ')[0].toLowerCase()) ||
      qLower.includes(u.name.split(' ')[1]?.toLowerCase() || '')
    );
    if (userMatch && (qLower.includes('workload') || qLower.includes('hour') || qLower.includes('assign') || qLower.includes('task') || qLower.includes('what is') || qLower.includes('profile') || qLower.includes('status'))) {
      const userIssues = activeIssues.filter(i => i.assigneeId === userMatch.id);
      const userDocs = activeDocs.filter(d => d.authorId === userMatch.id);
      const totalHours = userIssues.reduce((sum, i) => sum + (i.remainingHours || 0), 0);
      const totalPoints = userIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

      userIssues.slice(0, 3).forEach(i => addSource({ type: 'jira', id: i.id, keyOrTitle: i.key, snippet: i.summary }));
      userDocs.slice(0, 2).forEach(d => addSource({ type: 'confluence', id: d.id, keyOrTitle: d.title, snippet: d.excerpt }));

      let answer = `### 👤 Workload & Assignment for ${userMatch.name} (${userMatch.jobTitle || userMatch.role})\n\n`;
      answer += `- **Role & Department**: \`${userMatch.role}\` | ${userMatch.department || 'Engineering'}\n`;
      answer += `- **Assigned Tickets**: ${userIssues.length} issues\n`;
      answer += `- **Total Story Points**: ${totalPoints} pts\n`;
      answer += `- **Remaining Hours**: ${totalHours}h\n\n`;
      
      if (userIssues.length > 0) {
        answer += `#### **Active Jira Tickets**:\n`;
        userIssues.forEach(i => {
          answer += `- **[${i.key}]** \`${i.status.replace(/_/g, ' ')}\` (${i.priority}) — ${i.summary} (${i.remainingHours || 0}h rem)\n`;
        });
      } else {
        answer += `*No active Jira tickets assigned currently.*\n`;
      }

      if (userDocs.length > 0) {
        answer += `\n#### **Authored Confluence Documents**:\n`;
        userDocs.forEach(d => {
          answer += `- **[Doc: ${d.title}]** (\`${d.status}\` | \`${d.category}\`)\n`;
        });
      }
      return { answer, sources };
    }

    // 8. General Synthesis / Keyword search across both Jira & Confluence
    const words = qLower.split(/\W+/).filter(w => w.length > 2);
    const scoredIssues = activeIssues.map(i => {
      let score = 0;
      const text = `${i.key} ${i.summary} ${i.description || ''} ${i.feature || ''} ${i.acceptanceCriteria || ''}`.toLowerCase();
      words.forEach(w => { if (text.includes(w)) score += 1; });
      return { issue: i, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

    const scoredDocs = activeDocs.map(d => {
      let score = 0;
      const text = `${d.title} ${d.excerpt} ${d.content} ${d.category}`.toLowerCase();
      words.forEach(w => { if (text.includes(w)) score += 1; });
      return { doc: d, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

    if (scoredIssues.length > 0 || scoredDocs.length > 0) {
      let answer = `### 🧠 WezAI Cross-System Findings\n\n`;
      answer += `I searched through **Wezblue Jira** and **Confluence Knowledge Base** for your query:\n\n`;

      if (scoredIssues.length > 0) {
        answer += `#### 📌 Relevant Jira Issues:\n`;
        scoredIssues.slice(0, 3).forEach(({ issue }) => {
          addSource({ type: 'jira', id: issue.id, keyOrTitle: issue.key, snippet: issue.summary });
          answer += `- **[${issue.key}] ${issue.summary}** (\`${issue.status.replace(/_/g, ' ')}\` | \`${issue.priority}\`)\n`;
          if (issue.acceptanceCriteria) {
            answer += `  > *AC*: ${issue.acceptanceCriteria.slice(0, 110)}...\n`;
          }
        });
        answer += `\n`;
      }

      if (scoredDocs.length > 0) {
        answer += `#### 📄 Relevant Confluence Documentation:\n`;
        scoredDocs.slice(0, 3).forEach(({ doc }) => {
          addSource({ type: 'confluence', id: doc.id, keyOrTitle: doc.title, snippet: doc.excerpt });
          answer += `- **[Doc: ${doc.title}]** (\`${doc.category}\` | \`${doc.status}\`)\n`;
          answer += `  > ${doc.excerpt}\n`;
        });
      }

      return { answer, sources };
    }

    // Fallback: Welcome & Real Capability Guidance
    return {
      answer: `### 👋 Hi! I am WezAI, your Wezblue AI Assistant.

I can answer questions across your **Jira tickets**, **sprints**, **epics**, **organisation roadmap**, and **Confluence documentation**.

Here are some things you can ask me:
- **"What are our mobile OTP login acceptance criteria?"**
- **"What are the open blockers or bugs across the project?"**
- **"Summarize our Organisation Roadmap initiatives"**
- **"What is the burndown status of the active sprint?"**
- **"What is the workload and remaining hours for Althaf Thajudeen?"**
- **"Show me all tickets linked to [WB-101] or [WEZ-101]"**`,
      sources: []
    };
  }
}

const globalStore: JiraDataStore = (global as any).__jiraStore || new JiraDataStore();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__jiraStore = globalStore;
}

export const db: JiraDataStore = globalStore;
