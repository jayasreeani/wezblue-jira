import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const user = db.getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Corporate email & password login
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

    // 2. Persona switch (RBAC tester)
    if (body.userId) {
      const user = db.setCurrentUser(body.userId);
      return NextResponse.json({ user, message: 'Active persona switched' });
    }

    return NextResponse.json({ error: 'Email or UserId is required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to authenticate' }, { status: 400 });
  }
}
