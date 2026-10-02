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

// 1. /api/auth/route.ts
writeFile('src/app/api/auth/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const user = db.getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const user = db.setCurrentUser(userId);
    return NextResponse.json({ user, message: 'Active persona switched' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to switch user' }, { status: 400 });
  }
}
`);

// 2. /api/users/route.ts
writeFile('src/app/api/users/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const users = db.getUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newUser = db.addUser(body);
    return NextResponse.json({ user: newUser, message: 'User added successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, role } = await req.json();
    const updated = db.updateUserRole(userId, role);
    return NextResponse.json({ user: updated, message: 'Role updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 400 });
  }
}
`);

// 3. /api/projects/route.ts
writeFile('src/app/api/projects/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const projects = db.getProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = db.createProject(body);
    return NextResponse.json({ project, message: 'Project created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 400 });
  }
}
`);

// 4. /api/projects/[id]/route.ts
writeFile('src/app/api/projects/[id]/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const project = db.getProjectById(params.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json({ project });
}
`);

// 5. /api/epics/route.ts
writeFile('src/app/api/epics/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const epics = db.getEpics(projectId);
  return NextResponse.json({ epics });
}

export async function POST(req: Request) {
  try {
    const { projectId, name, summary, color } = await req.json();
    const epic = db.createEpic(projectId, name, summary, color);
    return NextResponse.json({ epic, message: 'Epic created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create epic' }, { status: 400 });
  }
}
`);

// 6. /api/sprints/route.ts
writeFile('src/app/api/sprints/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const sprints = db.getSprints(projectId);
  return NextResponse.json({ sprints });
}

export async function POST(req: Request) {
  try {
    const { projectId, name, goal, startDate, endDate } = await req.json();
    const sprint = db.createSprint(projectId, name, goal, startDate, endDate);
    return NextResponse.json({ sprint, message: 'Sprint created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sprint' }, { status: 400 });
  }
}
`);

// 7. /api/sprints/[id]/route.ts
writeFile('src/app/api/sprints/[id]/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { action, moveToSprintId } = await req.json();
    let sprint;
    if (action === 'START') {
      sprint = db.startSprint(params.id);
    } else if (action === 'COMPLETE') {
      sprint = db.completeSprint(params.id, moveToSprintId);
    }
    return NextResponse.json({ sprint, message: \`Sprint \${action.toLowerCase()}ed\` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sprint' }, { status: 400 });
  }
}
`);

// 8. /api/issues/route.ts
writeFile('src/app/api/issues/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const sprintId = searchParams.get('sprintId') || undefined;
  const type = searchParams.get('type') || undefined;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const issues = db.getIssues({ projectId, sprintId, type, status, search });
  return NextResponse.json({ issues });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const issue = db.createIssue(body);
    return NextResponse.json({ issue, message: 'Issue created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 400 });
  }
}
`);

// 9. /api/issues/[id]/route.ts
writeFile('src/app/api/issues/[id]/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const issue = db.getIssueById(params.id);
  if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  return NextResponse.json({ issue });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = db.updateIssue(params.id, body);
    if (!updated) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json({ issue: updated, message: 'Issue updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const deleted = db.deleteIssue(params.id);
  if (!deleted) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  return NextResponse.json({ message: 'Issue deleted successfully' });
}
`);

// 10. /api/comments/route.ts
writeFile('src/app/api/comments/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { issueId, content } = await req.json();
    const comment = db.addComment(issueId, content);
    if (!comment) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json({ comment, message: 'Comment added' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 400 });
  }
}
`);

// 11. /api/attachments/route.ts
writeFile('src/app/api/attachments/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { issueId, filename, fileSize, fileType, fileUrl } = await req.json();
    const attachment = db.addAttachment(issueId, { filename, fileSize, fileType, fileUrl });
    if (!attachment) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json({ attachment, message: 'Attachment added' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add attachment' }, { status: 400 });
  }
}
`);

// 12. /api/activity/route.ts
writeFile('src/app/api/activity/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const logs = db.getActivityLogs(projectId, limit);
  return NextResponse.json({ logs });
}
`);

// 13. /api/notifications/route.ts
writeFile('src/app/api/notifications/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const currentUser = db.getCurrentUser();
  const notifications = db.getNotifications(currentUser.id);
  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  try {
    const { id, markAll } = await req.json();
    const currentUser = db.getCurrentUser();
    if (markAll) {
      db.markAllNotificationsRead(currentUser.id);
    } else if (id) {
      db.markNotificationRead(id);
    }
    const notifications = db.getNotifications(currentUser.id);
    return NextResponse.json({ notifications, message: 'Notifications updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 400 });
  }
}
`);

// 14. /api/reports/route.ts
writeFile('src/app/api/reports/route.ts', `
import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-1';

  const issues = db.getIssues({ projectId });
  const sprints = db.getSprints(projectId);

  // Velocity data
  const velocityData = sprints.map(s => {
    const sprintIssues = issues.filter(i => i.sprintId === s.id);
    const committed = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const completed = sprintIssues.filter(i => i.status === 'DONE').reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    return {
      sprintName: s.name.replace('Nova ', ''),
      committed,
      completed,
    };
  });

  // Burndown data for active sprint
  const activeSprint = sprints.find(s => s.status === 'ACTIVE') || sprints[0];
  const activeIssues = issues.filter(i => i.sprintId === activeSprint?.id);
  const totalPoints = activeIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = activeIssues.filter(i => i.status === 'DONE').reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  // Generate 10-day sprint burndown curve
  const burndownData = [
    { day: 'Day 1', ideal: totalPoints, actual: totalPoints },
    { day: 'Day 2', ideal: Math.round(totalPoints * 0.9), actual: totalPoints },
    { day: 'Day 3', ideal: Math.round(totalPoints * 0.8), actual: totalPoints - 3 },
    { day: 'Day 4', ideal: Math.round(totalPoints * 0.7), actual: totalPoints - 5 },
    { day: 'Day 5', ideal: Math.round(totalPoints * 0.6), actual: totalPoints - 8 },
    { day: 'Day 6', ideal: Math.round(totalPoints * 0.5), actual: totalPoints - 10 },
    { day: 'Day 7', ideal: Math.round(totalPoints * 0.4), actual: totalPoints - 15 },
    { day: 'Day 8', ideal: Math.round(totalPoints * 0.3), actual: totalPoints - donePoints },
    { day: 'Day 9', ideal: Math.round(totalPoints * 0.2), actual: null },
    { day: 'Day 10', ideal: 0, actual: null },
  ];

  // Distribution by Status
  const statusCounts = {
    BACKLOG: issues.filter(i => i.status === 'BACKLOG').length,
    TODO: issues.filter(i => i.status === 'TODO').length,
    IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS').length,
    IN_REVIEW: issues.filter(i => i.status === 'IN_REVIEW').length,
    DONE: issues.filter(i => i.status === 'DONE').length,
  };

  // Distribution by Type
  const typeCounts = {
    STORY: issues.filter(i => i.type === 'STORY').length,
    TASK: issues.filter(i => i.type === 'TASK').length,
    BUG: issues.filter(i => i.type === 'BUG').length,
    EPIC: issues.filter(i => i.type === 'EPIC').length,
  };

  // Distribution by Priority
  const priorityCounts = {
    HIGHEST: issues.filter(i => i.priority === 'HIGHEST').length,
    HIGH: issues.filter(i => i.priority === 'HIGH').length,
    MEDIUM: issues.filter(i => i.priority === 'MEDIUM').length,
    LOW: issues.filter(i => i.priority === 'LOW').length,
    LOWEST: issues.filter(i => i.priority === 'LOWEST').length,
  };

  return NextResponse.json({
    activeSprint,
    totalIssues: issues.length,
    totalStoryPoints: totalPoints,
    completedStoryPoints: donePoints,
    velocityData,
    burndownData,
    statusCounts,
    typeCounts,
    priorityCounts,
  });
}
`);

console.log('Finished API routes generation');
