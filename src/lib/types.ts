export type Role =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "PRODUCT_OWNER"
  | "ARCHITECT"
  | "SCRUM_MASTER"
  | "UI_UX_DESIGNER"
  | "DEVELOPER"
  | "QA_ENGINEER"
  | "VIEWER";

export type ProjectTemplate = "SCRUM" | "KANBAN";

export type SprintStatus = "FUTURE" | "ACTIVE" | "COMPLETED";

export type IssueType = "EPIC" | "STORY" | "TASK" | "BUG";

export type IssueStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "IN_QA"
  | "IN_STAKEHOLDER_VALIDATION"
  | "DONE";

export type Priority = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | "LOWEST";

export type BugSeverity = "CRITICAL" | "MAJOR" | "MINOR" | "TRIVIAL";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  jobTitle?: string;
  department?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  role: Role;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  template: ProjectTemplate;
  leadId?: string;
  lead?: User;
  members?: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  velocity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  summary?: string;
  color: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  issueId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploaderId: string;
  uploader?: User;
  createdAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  author?: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLog {
  id: string;
  issueId: string;
  userId: string;
  user?: User;
  hours: number;
  comment?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  issueId?: string;
  issueKey?: string;
  userId: string;
  user?: User;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  key: string;
  projectId: string;
  type: IssueType;
  summary: string;
  description?: string;
  status: IssueStatus;
  priority: Priority;
  severity?: BugSeverity;
  
  // Dual Estimation (Points & Hours)
  storyPoints?: number;
  actualPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  remainingHours?: number;

  order: number;
  assigneeId?: string;
  assignee?: User;
  reporterId?: string;
  reporter?: User;
  sprintId?: string;
  sprint?: Sprint;
  epicId?: string;
  epic?: Epic;
  
  // Link Task / Bug to a User Story
  parentStoryId?: string;
  parentStory?: Issue;
  linkedIssues?: Issue[];

  parentId?: string;
  subtasks?: Subtask[];
  dueDate?: string;
  plannedCompletionDate?: string;
  actualCompletionDate?: string;
  environment?: string;
  reproduceSteps?: string;
  figmaUrl?: string;
  linkedDocIds?: string[];
  linkedDocs?: ConfluenceDoc[];

  // Epic -> Feature -> User Story -> AC -> Phase Hierarchy
  feature?: string;
  acceptanceCriteria?: string;
  phase?: string;

  comments?: Comment[];
  attachments?: Attachment[];
  activityLogs?: ActivityLog[];
  workLogs?: WorkLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// RBAC Permissions Matrix
export interface RolePermissions {
  canCreateProject: boolean;
  canManageProjectSettings: boolean;
  canManageMembers: boolean;
  canCreateSprint: boolean;
  canStartCompleteSprint: boolean;
  canCreateIssue: boolean;
  canEditIssue: boolean;
  canDeleteIssue: boolean;
  canTransitionIssueStatus: boolean;
  canAssignIssue: boolean;
  canAddComment: boolean;
  canManageUsers: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  ADMIN: {
    canCreateProject: true,
    canManageProjectSettings: true,
    canManageMembers: true,
    canCreateSprint: true,
    canStartCompleteSprint: true,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: true,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: true,
  },
  PROJECT_MANAGER: {
    canCreateProject: true,
    canManageProjectSettings: true,
    canManageMembers: true,
    canCreateSprint: true,
    canStartCompleteSprint: true,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: true,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: false,
  },
  PRODUCT_OWNER: {
    canCreateProject: false,
    canManageProjectSettings: false,
    canManageMembers: false,
    canCreateSprint: true,
    canStartCompleteSprint: true,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: false,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: false,
  },
  ARCHITECT: {
    canCreateProject: true,
    canManageProjectSettings: true,
    canManageMembers: true,
    canCreateSprint: true,
    canStartCompleteSprint: true,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: true,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: false,
  },
  SCRUM_MASTER: {
    canCreateProject: false,
    canManageProjectSettings: false,
    canManageMembers: true,
    canCreateSprint: true,
    canStartCompleteSprint: true,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: true,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: false,
  },
  UI_UX_DESIGNER: {
    canCreateProject: false,
    canManageProjectSettings: false,
    canManageMembers: false,
    canCreateSprint: false,
    canStartCompleteSprint: false,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: false,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: false,
  },
  DEVELOPER: {
    canCreateProject: false,
    canManageProjectSettings: false,
    canManageMembers: false,
    canCreateSprint: false,
    canStartCompleteSprint: false,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: false,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: false,
  },
  QA_ENGINEER: {
    canCreateProject: false,
    canManageProjectSettings: false,
    canManageMembers: false,
    canCreateSprint: false,
    canStartCompleteSprint: false,
    canCreateIssue: true,
    canEditIssue: true,
    canDeleteIssue: false,
    canTransitionIssueStatus: true,
    canAssignIssue: true,
    canAddComment: true,
    canManageUsers: false,
  },
  VIEWER: {
    canCreateProject: false,
    canManageProjectSettings: false,
    canManageMembers: false,
    canCreateSprint: false,
    canStartCompleteSprint: false,
    canCreateIssue: false,
    canEditIssue: false,
    canDeleteIssue: false,
    canTransitionIssueStatus: false,
    canAssignIssue: false,
    canAddComment: false,
    canManageUsers: false,
  },
};

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  PROJECT_MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
  PRODUCT_OWNER: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ARCHITECT: 'bg-amber-100 text-amber-800 border-amber-200',
  SCRUM_MASTER: 'bg-teal-100 text-teal-800 border-teal-200',
  UI_UX_DESIGNER: 'bg-pink-100 text-pink-800 border-pink-200',
  DEVELOPER: 'bg-blue-100 text-blue-800 border-blue-200',
  QA_ENGINEER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  VIEWER: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin (Tool Owner)',
  PROJECT_MANAGER: 'Project Manager',
  PRODUCT_OWNER: 'Product Owner',
  ARCHITECT: 'Architect',
  SCRUM_MASTER: 'Scrum Master',
  UI_UX_DESIGNER: 'UI/UX Designer',
  DEVELOPER: 'Developer',
  QA_ENGINEER: 'QA Engineer',
  VIEWER: 'Viewer',
};

// ================= Confluence & ROVO Knowledge Types =================

export type DocStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

export type DocCategory = 
  | "PRD" 
  | "ARCHITECTURE" 
  | "RUNBOOK" 
  | "RETROSPECTIVE" 
  | "MEETING_NOTES" 
  | "DECISION_RECORD" 
  | "GENERAL";

export interface ConfluenceSpace {
  id: string;
  key: string; // e.g. ENG, PRD, OPS
  name: string;
  description: string;
  icon?: string;
  color: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfluenceDoc {
  id: string;
  spaceId: string;
  space?: ConfluenceSpace;
  title: string;
  content: string;
  excerpt: string;
  parentId?: string;
  status: DocStatus;
  category: DocCategory;
  authorId: string;
  author?: User;
  linkedIssueKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RovoSource {
  type: 'jira' | 'confluence';
  id: string;
  keyOrTitle: string;
  snippet?: string;
  url?: string;
}

export type WezAISource = RovoSource;

export interface RovoMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: RovoSource[];
}

export type WezAIMessage = RovoMessage;

