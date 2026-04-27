import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error } from '@/lib/api-response';

export async function GET() {
  const permissions = await prisma.permission.findMany({
    orderBy: { code: 'asc' },
  });
  return success(permissions);
}

export async function POST(req: NextRequest) {
  return withPermission(req, 'permission:create', async () => {
    try {
      const body = await req.json();
      const { name, code, description } = body;

      if (!name || !code) return error('权限名称和代码不能为空');

      const existing = await prisma.permission.findUnique({ where: { code } });
      if (existing) return error('该权限代码已存在');

      const permission = await prisma.permission.create({
        data: { name, code, description: description || null },
      });

      return success(permission, '权限创建成功', 201);
    } catch (e) {
      console.error(e);
      return error('创建权限失败', 500);
    }
  });
}
