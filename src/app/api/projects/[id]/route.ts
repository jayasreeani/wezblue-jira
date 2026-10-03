import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const project = db.getProjectById(params.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = db.updateProject(params.id, body);
    if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ project: updated, message: 'Project updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const success = db.deleteProject(params.id);
    if (!success) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
