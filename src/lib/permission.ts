import { prisma } from './prisma';

export async function checkPermission(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!user || user.status === 0) return false;

  return user.role.permissions.some((rp) => rp.permission.code === code);
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!user || user.status === 0) return [];

  return user.role.permissions.map((rp) => rp.permission.code);
}

export function requirePermission(code: string) {
  return async (userId: string) => {
    return checkPermission(userId, code);
  };
}
