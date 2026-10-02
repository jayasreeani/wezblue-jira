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
