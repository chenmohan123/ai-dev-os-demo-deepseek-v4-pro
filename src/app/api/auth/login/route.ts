import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { signToken, setTokenCookie } from '@/lib/auth';
import { success, error } from '@/lib/api-response';

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return error('邮箱或密码错误', 401);
    }

    if (user.status === 0) {
      return error('账号已被禁用，请联系管理员', 403);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return error('邮箱或密码错误', 401);
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    await setTokenCookie(token);

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      roleId: user.roleId,
    }, '登录成功');
  } catch {
    return error('服务器错误', 500);
  }
}
