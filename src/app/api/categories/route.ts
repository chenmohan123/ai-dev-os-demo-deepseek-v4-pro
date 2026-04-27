import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/api-handler';
import { success, error } from '@/lib/api-response';
import { slugify } from '@/lib/slugify';
import type { CategoryTreeNode } from '@/types';

function buildTree(categories: Array<{
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sort: number;
  _count: { articles: number };
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    sort: number;
    _count: { articles: number };
  }>;
}>, parentId: string | null = null, level: number = 0): CategoryTreeNode[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map((c) => ({
      ...c,
      level,
      children: buildTree(categories, c.id, level + 1),
    }));
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { sort: 'asc' },
    });

    const tree = buildTree(categories);
    return success(tree);
  } catch (e) {
    console.error(e);
    return error('获取分类失败', 500);
  }
}

export async function POST(req: NextRequest) {
  return withPermission(req, 'category:create', async () => {
    try {
      const body = await req.json();
      const { name, parentId } = body;

      if (!name) return error('分类名称不能为空');

      let slug = slugify(name);
      const existing = await prisma.category.findFirst({
        where: { slug, parentId: parentId || null },
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      const maxSort = await prisma.category.findFirst({
        where: { parentId: parentId || null },
        orderBy: { sort: 'desc' },
      });

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          parentId: parentId || null,
          sort: (maxSort?.sort || 0) + 1,
        },
      });

      return success(category, '分类创建成功', 201);
    } catch (e) {
      console.error(e);
      return error('创建分类失败', 500);
    }
  });
}
