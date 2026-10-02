import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const project = db.getProjectById(params.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json({ project });
}
