import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { issueId, filename, fileSize, fileType, fileUrl } = await req.json();
    const attachment = db.addAttachment(issueId, { filename, fileSize, fileType, fileUrl });
    if (!attachment) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json({ attachment, message: 'Attachment added' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add attachment' }, { status: 400 });
  }
}
