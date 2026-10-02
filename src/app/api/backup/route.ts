import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  try {
    const backup = db.exportBackup();
    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="wezblue-jira-backup-' + dateStr + '.json"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }
    const success = db.importBackup(data);
    return NextResponse.json({
      success,
      message: 'Workspace data restored successfully. All tickets, epics, and documents updated.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
