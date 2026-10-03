import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const action = body.action || (body.status === 'ACTIVE' ? 'START' : body.status === 'COMPLETED' ? 'COMPLETE' : undefined);
    const moveToSprintId = body.moveToSprintId;
    let sprint;
    if (action === 'START') {
      sprint = db.startSprint(params.id);
    } else if (action === 'COMPLETE') {
      sprint = db.completeSprint(params.id, moveToSprintId);
    }
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }
    return NextResponse.json({ sprint, message: `Sprint updated successfully` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sprint' }, { status: 400 });
  }
}
