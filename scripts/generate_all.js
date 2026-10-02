const fs = require('fs');
const path = require('path');

function ensureDir(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log(`Generated: ${filePath}`);
}

// 1. src/lib/store.ts
writeFile('src/lib/store.ts', `
import { 
  User, Project, Sprint, Epic, Issue, Comment, Attachment, ActivityLog, Notification, 
  Role, IssueStatus, Priority, BugSeverity 
} from './types';
import { 
  INITIAL_USERS, INITIAL_PROJECTS, INITIAL_SPRINTS, 
  INITIAL_EPICS, INITIAL_ISSUES, INITIAL_NOTIFICATIONS, INITIAL_ACTIVITY_LOGS 
} from './seed-data';

class JiraDataStore {
  private users: User[] = [...INITIAL_USERS];
  private projects: Project[] = [...INITIAL_PROJECTS];
  private sprints: Sprint[] = [...INITIAL_SPRINTS];
  private epics: Epic[] = [...INITIAL_EPICS];
  private issues: Issue[] = [...INITIAL_ISSUES];
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  private activityLogs: ActivityLog[] = [...INITIAL_ACTIVITY_LOGS];
  private currentUser: User = INITIAL_USERS[0];

  getUsers() { return this.users; }
  getUserById(id: string) { return this.users.find(u => u.id === id); }
  getCurrentUser() { return this.currentUser; }
  setCurrentUser(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user) this.currentUser = user;
    return this.currentUser;
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
    return newUser;
  }
  updateUserRole(userId: string, role: Role) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      user.updatedAt = new Date().toISOString();
    }
    return user;
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
    return newProj;
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
    return newSprint;
  }
  startSprint(sprintId: string) {
    const sprint = this.sprints.find(s => s.id === sprintId);
    if (sprint) {
      sprint.status = 'ACTIVE';
      sprint.startDate = new Date().toISOString();
      sprint.updatedAt = new Date().toISOString();
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
    }
    return sprint;
  }

  getEpics(projectId?: string) {
    if (projectId) return this.epics.filter(e => e.projectId === projectId);
    return this.epics;
  }
  createEpic(projectId: string, name: string, summary?: string, color: string = '#8777d9') {
    const newEpic: Epic = {
      id: 'epic-' + Date.now(),
      projectId,
      name,
      summary,
      color,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.epics.push(newEpic);
    return newEpic;
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
      subtasks: issue.subtasks || [],
      comments: (issue.comments || []).map(c => ({
        ...c,
        author: this.users.find(u => u.id === c.authorId)
      })),
      attachments: issue.attachments || [],
    };
  }

  createIssue(data: Partial<Issue>) {
    const project = this.projects.find(p => p.id === data.projectId) || this.projects[0];
    const projectIssues = this.issues.filter(i => i.projectId === project.id);
    const nextNum = 100 + projectIssues.length + 1;
    const key = project.key + '-' + nextNum;

    const newIssue: Issue = {
      id: 'issue-' + Date.now(),
      key,
      projectId: project.id,
      type: data.type || 'STORY',
      summary: data.summary || 'Untitled Issue',
      description: data.description || '',
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      severity: data.severity,
      storyPoints: data.storyPoints,
      order: projectIssues.length + 1,
      assigneeId: data.assigneeId,
      reporterId: data.reporterId || this.currentUser.id,
      sprintId: data.sprintId,
      epicId: data.epicId,
      dueDate: data.dueDate,
      environment: data.environment,
      reproduceSteps: data.reproduceSteps,
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.issues.push(newIssue);

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
        message: \`\${this.currentUser.name} assigned you to \${newIssue.key}: \${newIssue.summary}\`,
        link: newIssue.key,
      });
    }

    return this.hydrateIssue(newIssue);
  }

  updateIssue(id: string, updates: Partial<Issue>) {
    const index = this.issues.findIndex(i => i.id === id || i.key === id);
    if (index === -1) return null;

    const oldIssue = { ...this.issues[index] };
    const updated = { ...oldIssue, ...updates, updatedAt: new Date().toISOString() };
    this.issues[index] = updated;

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
          message: \`\${this.currentUser.name} assigned you to \${updated.key}\`,
          link: updated.key,
        });
      }
    }

    return this.hydrateIssue(updated);
  }

  deleteIssue(id: string) {
    const index = this.issues.findIndex(i => i.id === id || i.key === id);
    if (index !== -1) {
      return this.issues.splice(index, 1)[0];
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
          message: \`\${this.currentUser.name} commented: "\${content.slice(0, 60)}..."\`,
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
      return att;
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
}

const globalStore = (global as any).__jiraStore || new JiraDataStore();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__jiraStore = globalStore;
}

export const db = globalStore;
`);

console.log('Finished store.ts generation');
