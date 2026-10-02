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
