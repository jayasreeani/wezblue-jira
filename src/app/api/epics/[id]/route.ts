import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const epic = db.getEpics().find(e => e.id === params.id);
  if (!epic) return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
  return NextResponse.json({ epic });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = db.updateEpic(params.id, body);
    if (!updated) return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    return NextResponse.json({ epic: updated, message: 'Epic updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update epic' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = db.deleteEpic(params.id);
    if (!deleted) return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Epic deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete epic' }, { status: 400 });
  }
}
