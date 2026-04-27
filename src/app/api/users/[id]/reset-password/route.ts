import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error, notFound } from '@/lib/api-response';
import { hashPassword } from '@/lib/password';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'user:edit', async () => {
    try {
      const body = await req.json();
      const { password } = body;

      if (!password || password.length < 6) {
        return error('密码至少6个字符');
      }

      const existing = await prisma.user.findUnique({ where: { id: params.id } });
      if (!existing) return notFound('用户不存在');

      const hashed = await hashPassword(password);
      await prisma.user.update({
        where: { id: params.id },
        data: { password: hashed },
      });

      return success(null, '密码已重置');
    } catch (e) {
      console.error(e);
      return error('重置密码失败', 500);
    }
  });
}
