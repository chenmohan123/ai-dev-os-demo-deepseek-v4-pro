import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error } from '@/lib/api-response';

export async function GET() {
  const roles = await prisma.role.findMany({
    include: {
      _count: { select: { users: true, permissions: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return success(roles);
}

export async function POST(req: NextRequest) {
  return withPermission(req, 'role:create', async () => {
    try {
      const body = await req.json();
      const { name, description, permissionIds } = body;

      if (!name) return error('角色名称不能为空');

      const existing = await prisma.role.findUnique({ where: { name } });
      if (existing) return error('该角色名称已存在');

      const role = await prisma.role.create({
        data: {
          name,
          description: description || null,
          permissions: permissionIds?.length
            ? { create: permissionIds.map((id: string) => ({ permissionId: id })) }
            : undefined,
        },
        include: {
          _count: { select: { users: true } },
          permissions: { include: { permission: true } },
        },
      });

      return success(role, '角色创建成功', 201);
    } catch (e) {
      console.error(e);
      return error('创建角色失败', 500);
    }
  });
}
