import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const currentUser = db.getCurrentUser();
  const notifications = db.getNotifications(currentUser.id);
  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  try {
    const { id, markAll } = await req.json();
    const currentUser = db.getCurrentUser();
    if (markAll) {
      db.markAllNotificationsRead(currentUser.id);
    } else if (id) {
      db.markNotificationRead(id);
    }
    const notifications = db.getNotifications(currentUser.id);
    return NextResponse.json({ notifications, message: 'Notifications updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 400 });
  }
}
