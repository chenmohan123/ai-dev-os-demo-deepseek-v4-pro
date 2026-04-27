import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error } from '@/lib/api-response';
import { hashPassword } from '@/lib/password';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        roleId: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
        _count: { select: { articles: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return success({ items, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  return withPermission(req, 'user:create', async () => {
    try {
      const body = await req.json();
      const { name, email, password, roleId } = body;

      if (!name || !email || !password) {
        return error('用户名、邮箱和密码不能为空');
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return error('该邮箱已被注册');

      const hashed = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          roleId: roleId || undefined,
          status: 1,
        },
        select: {
          id: true, name: true, email: true, avatar: true,
          status: true, roleId: true, createdAt: true,
          role: { select: { id: true, name: true } },
        },
      });

      return success(user, '用户创建成功', 201);
    } catch (e) {
      console.error(e);
      return error('创建用户失败', 500);
    }
  });
}
