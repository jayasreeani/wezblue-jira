import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const projects = db.getProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name?.trim() || !body.key?.trim()) {
      return NextResponse.json({ error: 'Project name and key are required' }, { status: 400 });
    }
    const project = db.createProject(body);
    const projects = db.getProjects();
    return NextResponse.json({ project, projects, message: 'Project created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 400 });
  }
}
