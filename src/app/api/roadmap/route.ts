import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  try {
    const initiatives = db.getRoadmapInitiatives();
    return NextResponse.json({ initiatives });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const initiative = db.createRoadmapInitiative(body);
    return NextResponse.json({ initiative }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
