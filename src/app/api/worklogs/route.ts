import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const issueId = body.issueId;
    const hours = body.hours !== undefined ? body.hours : body.hoursSpent;
    const comment = body.comment;
    if (!issueId || hours === undefined || hours === null) {
      return NextResponse.json({ error: 'issueId and hours (or hoursSpent) are required' }, { status: 400 });
    }
    const updatedIssue = db.logWork(issueId, Number(hours), comment);
    if (!updatedIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    return NextResponse.json({ 
      issue: updatedIssue, 
      message: `${hours} hours logged successfully` 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log work' }, { status: 500 });
  }
}
