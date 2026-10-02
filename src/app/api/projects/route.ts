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
