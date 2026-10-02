import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { action, moveToSprintId } = await req.json();
    let sprint;
    if (action === 'START') {
      sprint = db.startSprint(params.id);
    } else if (action === 'COMPLETE') {
      sprint = db.completeSprint(params.id, moveToSprintId);
    }
    return NextResponse.json({ sprint, message: `Sprint ${action.toLowerCase()}ed` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sprint' }, { status: 400 });
  }
}
