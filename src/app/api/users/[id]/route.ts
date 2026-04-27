import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error, notFound } from '@/lib/api-response';
import { hashPassword } from '@/lib/password';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'user:list', async () => {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, avatar: true,
        status: true, roleId: true, createdAt: true,
        role: { select: { id: true, name: true } },
      },
    });
    if (!user) return notFound('用户不存在');
    return success(user);
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'user:edit', async () => {
    try {
      const body = await req.json();
      const { name, email, avatar, roleId, status } = body;

      const existing = await prisma.user.findUnique({ where: { id: params.id } });
      if (!existing) return notFound('用户不存在');

      const user = await prisma.user.update({
        where: { id: params.id },
        data: {
          name: name !== undefined ? name : existing.name,
          email: email !== undefined ? email : existing.email,
          avatar: avatar !== undefined ? avatar : existing.avatar,
          roleId: roleId !== undefined ? roleId : existing.roleId,
          status: status !== undefined ? status : existing.status,
        },
        select: {
          id: true, name: true, email: true, avatar: true,
          status: true, roleId: true, createdAt: true,
          role: { select: { id: true, name: true } },
        },
      });

      return success(user, '用户更新成功');
    } catch (e) {
      console.error(e);
      return error('更新用户失败', 500);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'user:delete', async () => {
    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('用户不存在');
    await prisma.user.delete({ where: { id: params.id } });
    return success(null, '用户已删除');
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'user:toggle-status', async () => {
    const body = await req.json();
    const { status } = body;

    await prisma.user.update({
      where: { id: params.id },
      data: { status },
    });

    return success(null, status === 1 ? '用户已启用' : '用户已禁用');
  });
}
