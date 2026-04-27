import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/api-handler';
import { success, error } from '@/lib/api-response';
import { slugify } from '@/lib/slugify';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (status) {
      where.status = parseInt(status);
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          categories: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return success({ items, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return error('获取文章列表失败', 500);
  }
}

export async function POST(req: NextRequest) {
  return withPermission(req, 'article:create', async (userId) => {
    try {
      const body = await req.json();
      const { title, content, summary, coverImage, status: articleStatus, seoTitle, categoryIds } = body;

      if (!title || !content) {
        return error('标题和内容不能为空');
      }

      let slug = slugify(title);
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      const article = await prisma.article.create({
        data: {
          title,
          slug,
          content,
          summary: summary || null,
          coverImage: coverImage || null,
          status: articleStatus || 0,
          seoTitle: seoTitle || null,
          authorId: userId,
          categories: categoryIds?.length
            ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
            : undefined,
        },
        include: {
          categories: { include: { category: true } },
          author: { select: { id: true, name: true } },
        },
      });

      return success(article, '文章创建成功', 201);
    } catch (e) {
      console.error(e);
      return error('创建文章失败', 500);
    }
  });
}
