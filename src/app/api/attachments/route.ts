import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { issueId, docId, filename, fileSize, fileType, fileUrl } = await req.json();
    if (docId) {
      const attachment = db.addDocAttachment(docId, { filename, fileSize, fileType, fileUrl });
      if (!attachment) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      return NextResponse.json({ attachment, message: 'Doc attachment added' }, { status: 201 });
    }
    const attachment = db.addAttachment(issueId, { filename, fileSize, fileType, fileUrl });
    if (!attachment) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    return NextResponse.json({ attachment, message: 'Attachment added' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add attachment' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const docId = url.searchParams.get('docId');
    const attachmentId = url.searchParams.get('attachmentId');
    if (docId && attachmentId) {
      const success = db.deleteDocAttachment(docId, attachmentId);
      return NextResponse.json({ success });
    }
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 400 });
  }
}
