import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { issueId, content } = await req.json();
    const comment = db.addComment(issueId, content);
    if (!comment) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json({ comment, message: 'Comment added' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 400 });
  }
}
