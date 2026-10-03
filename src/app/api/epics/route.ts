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

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = body.id || searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Epic ID required' }, { status: 400 });
    const epic = db.updateEpic(id, body);
    if (!epic) return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    return NextResponse.json({ epic, message: 'Epic updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update epic' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {}
    }
    if (!id) return NextResponse.json({ error: 'Epic ID required' }, { status: 400 });
    const deleted = db.deleteEpic(id);
    if (!deleted) return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Epic deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete epic' }, { status: 400 });
  }
}

