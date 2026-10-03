import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (userId) {
      const user = db.getUserById(userId);
      if (user) {
        db.setCurrentUser(user.id);
        return NextResponse.json({ user });
      }
    }
    const user = db.getCurrentUser();
    return NextResponse.json({ user });
  } catch {
    const user = db.getCurrentUser();
    return NextResponse.json({ user });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Quick Persona Login / RBAC Persona Sign-In
    if (body.quickLogin || (body.userId && !body.password && !body.email)) {
      let user = null;
      if (body.userId) {
        user = db.getUserById(body.userId);
      }
      if (!user && body.email) {
        const cleanEmail = body.email.trim().toLowerCase();
        user = db.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
      }
      if (user) {
        db.setCurrentUser(user.id);
        return NextResponse.json({ 
          user, 
          message: `Successfully authenticated as ${user.name} (${user.role})` 
        });
      }
    }

    // 2. Corporate email & password login
    if (body.email) {
      const result = db.authenticate(body.email, body.password);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Authentication failed' }, { status: 401 });
      }
      return NextResponse.json({ 
        user: result.user, 
        message: 'Successfully authenticated to Wezblue Enterprise Jira' 
      });
    }

    // 3. Persona switch by userId
    if (body.userId) {
      const user = db.setCurrentUser(body.userId);
      return NextResponse.json({ user, message: 'Active persona switched' });
    }

    return NextResponse.json({ error: 'Email or UserId is required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to authenticate' }, { status: 400 });
  }
}
