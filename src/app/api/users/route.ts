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
    const { userId, role } = await req.json();
    const updated = db.updateUserRole(userId, role);
    return NextResponse.json({ user: updated, message: 'Role updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 400 });
  }
}
