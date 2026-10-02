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
