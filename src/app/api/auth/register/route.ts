import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken, setTokenCookie } from '@/lib/auth';
import { success, error } from '@/lib/api-response';

const registerSchema = z.object({
  name: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error('该邮箱已被注册');
    }

    // Find the normal user role
    const normalRole = await prisma.role.findFirst({ where: { name: '普通用户' } });
    if (!normalRole) {
      return error('系统错误：未找到默认角色', 500);
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        roleId: normalRole.id,
        status: 1,
      },
    });

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
    }, '注册成功');
  } catch {
    return error('服务器错误', 500);
  }
}
