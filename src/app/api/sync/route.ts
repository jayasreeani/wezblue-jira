import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  try {
    await db.syncWithCloud();
    return NextResponse.json({
      success: true,
      issues: db.getIssues(),
      sprints: db.getSprints(),
      epics: db.getEpics(),
      projects: db.getProjects(),
      users: db.getUsers(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sync failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await db.syncWithCloud();

    let hasChanges = false;

    if (Array.isArray(body.issues) && body.issues.length > 0) {
      db.mergeRemoteSnapshot({ issues: body.issues });
      hasChanges = true;
    }
    if (Array.isArray(body.epics) && body.epics.length > 0) {
      db.mergeRemoteSnapshot({ epics: body.epics });
      hasChanges = true;
    }
    if (Array.isArray(body.sprints) && body.sprints.length > 0) {
      db.mergeRemoteSnapshot({ sprints: body.sprints });
      hasChanges = true;
    }
    if (Array.isArray(body.projects) && body.projects.length > 0) {
      db.mergeRemoteSnapshot({ projects: body.projects });
      hasChanges = true;
    }
    if (Array.isArray(body.users) && body.users.length > 0) {
      db.mergeRemoteSnapshot({ users: body.users });
      hasChanges = true;
    }

    if (hasChanges) {
      db.persist();
      await db.persistToCloud();
    }

    return NextResponse.json({
      success: true,
      issues: db.getIssues(),
      sprints: db.getSprints(),
      epics: db.getEpics(),
      projects: db.getProjects(),
      users: db.getUsers(),
      message: 'Workspace data synchronized across all team members successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 400 });
  }
}
