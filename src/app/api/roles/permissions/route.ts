import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Role, RolePermissions } from '@/lib/types';

export async function GET() {
  const permissions = db.getRolePermissions();
  return NextResponse.json({ permissions });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.reset) {
      const resetPerms = db.resetRolePermissions();
      return NextResponse.json({ 
        permissions: resetPerms, 
        message: 'Role permissions reset to Jira defaults' 
      });
    }

    if (body.singleRole && body.permissionKey !== undefined && body.value !== undefined) {
      const updated = db.updateSingleRolePermission(
        body.singleRole as Role, 
        body.permissionKey as keyof RolePermissions, 
        Boolean(body.value)
      );
      return NextResponse.json({ 
        permissions: updated, 
        message: `Updated permission ${body.permissionKey} for ${body.singleRole}` 
      });
    }

    if (body.permissions) {
      const updated = db.updateRolePermissions(body.permissions);
      return NextResponse.json({ 
        permissions: updated, 
        message: 'Enterprise permission schemes saved successfully' 
      });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update permissions' }, { status: 500 });
  }
}
