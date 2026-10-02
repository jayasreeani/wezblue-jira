import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const spaces = db.getSpaces(projectId);
  return NextResponse.json({ spaces });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.key) {
      return NextResponse.json({ error: 'Name and Key are required' }, { status: 400 });
    }
    const space = db.createSpace(body);
    return NextResponse.json({ space }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
