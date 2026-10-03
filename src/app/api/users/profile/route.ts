import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, avatar, jobTitle, department, currentPassword, newPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Password change requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }
      const passResult = db.changePassword(userId, currentPassword, newPassword);
      if (!passResult.success) {
        return NextResponse.json({ error: passResult.error || 'Password change failed' }, { status: 400 });
      }
    }

    // 2. Profile attributes update
    const updatedUser = db.updateUserProfile(userId, {
      name,
      avatar,
      jobTitle,
      department,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile and security settings saved successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
