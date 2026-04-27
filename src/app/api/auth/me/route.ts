import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-handler';
import { success } from '@/lib/api-response';
import { getUserPermissions } from '@/lib/permission';

export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return success(null, 'User not found', 404);
    }

    const permissions = await getUserPermissions(userId);

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      roleId: user.roleId,
      role: user.role,
      permissions,
    });
  });
}
