import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/api-handler';
import { success, error, notFound } from '@/lib/api-response';
import { slugify } from '@/lib/slugify';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'category:edit', async () => {
    try {
      const body = await req.json();
      const { name, parentId } = body;

      const existing = await prisma.category.findUnique({ where: { id: params.id } });
      if (!existing) return notFound('分类不存在');

      let slug = existing.slug;
      if (name && name !== existing.name) {
        slug = slugify(name);
      }

      const category = await prisma.category.update({
        where: { id: params.id },
        data: {
          name: name || existing.name,
          slug,
          parentId: parentId !== undefined ? parentId : existing.parentId,
        },
      });

      return success(category, '分类更新成功');
    } catch (e) {
      console.error(e);
      return error('更新分类失败', 500);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'category:delete', async () => {
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
      include: { children: true },
    });

    if (!existing) return notFound('分类不存在');

    // Move children to parent level
    if (existing.children.length > 0) {
      await prisma.category.updateMany({
        where: { parentId: params.id },
        data: { parentId: existing.parentId },
      });
    }

    await prisma.category.delete({ where: { id: params.id } });
    return success(null, '分类已删除');
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'category:sort', async () => {
    try {
      const body = await req.json();
      const { sort, parentId } = body;

      await prisma.category.update({
        where: { id: params.id },
        data: {
          sort: sort !== undefined ? sort : undefined,
          parentId: parentId !== undefined ? parentId : undefined,
        },
      });

      return success(null, '排序已更新');
    } catch (e) {
      console.error(e);
      return error('排序更新失败', 500);
    }
  });
}
