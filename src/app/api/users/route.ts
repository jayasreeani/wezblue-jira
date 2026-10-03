import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const users = db.getUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newUser = db.addUser(body);
    return NextResponse.json({ user: newUser, message: 'User added successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, role, jobTitle, avatar, department, name, password } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updated = db.updateUserProfile(userId, {
      role,
      jobTitle,
      avatar,
      department,
      name,
      password,
    });

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updated, message: 'User updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 400 });
  }
}
