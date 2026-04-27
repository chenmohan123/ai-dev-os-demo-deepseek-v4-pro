import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error, notFound } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'role:list', async () => {
    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
    });
    if (!role) return notFound('角色不存在');
    return success({
      ...role,
      permissionIds: role.permissions.map((rp) => rp.permissionId),
    });
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'role:edit', async () => {
    try {
      const body = await req.json();
      const { name, description, permissionIds } = body;

      const existing = await prisma.role.findUnique({ where: { id: params.id } });
      if (!existing) return notFound('角色不存在');

      // Update permissions
      if (permissionIds !== undefined) {
        await prisma.rolePermission.deleteMany({ where: { roleId: params.id } });
        if (permissionIds.length > 0) {
          await prisma.rolePermission.createMany({
            data: permissionIds.map((id: string) => ({ roleId: params.id, permissionId: id })),
          });
        }
      }

      const role = await prisma.role.update({
        where: { id: params.id },
        data: {
          name: name || existing.name,
          description: description !== undefined ? description : existing.description,
        },
        include: {
          _count: { select: { users: true } },
          permissions: { include: { permission: true } },
        },
      });

      return success(role, '角色更新成功');
    } catch (e) {
      console.error(e);
      return error('更新角色失败', 500);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'role:delete', async () => {
    const existing = await prisma.role.findUnique({
      where: { id: params.id },
      include: { _count: { select: { users: true } } },
    });
    if (!existing) return notFound('角色不存在');
    if (existing._count.users > 0) {
      return error('该角色下还有用户，无法删除', 400);
    }

    await prisma.role.delete({ where: { id: params.id } });
    return success(null, '角色已删除');
  });
}
