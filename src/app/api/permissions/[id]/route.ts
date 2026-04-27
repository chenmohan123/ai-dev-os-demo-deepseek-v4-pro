import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error, notFound } from '@/lib/api-response';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'permission:edit', async () => {
    try {
      const body = await req.json();
      const { name, code, description } = body;

      const existing = await prisma.permission.findUnique({ where: { id: params.id } });
      if (!existing) return notFound('权限不存在');

      const permission = await prisma.permission.update({
        where: { id: params.id },
        data: {
          name: name || existing.name,
          code: code || existing.code,
          description: description !== undefined ? description : existing.description,
        },
      });
      return success(permission, '权限更新成功');
    } catch (e) {
      console.error(e);
      return error('更新权限失败', 500);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'permission:delete', async () => {
    const existing = await prisma.permission.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('权限不存在');
    await prisma.permission.delete({ where: { id: params.id } });
    return success(null, '权限已删除');
  });
}
