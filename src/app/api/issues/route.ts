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
