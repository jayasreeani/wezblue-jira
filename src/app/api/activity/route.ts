import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const logs = db.getActivityLogs(projectId, limit);
  return NextResponse.json({ logs });
}
