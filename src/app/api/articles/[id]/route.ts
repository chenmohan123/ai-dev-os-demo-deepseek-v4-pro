import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/api-handler';
import { success, error, notFound } from '@/lib/api-response';
import { slugify } from '@/lib/slugify';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async () => {
    const article = await prisma.article.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        categories: { include: { category: true } },
      },
    });

    if (!article) return notFound('文章不存在');

    return success({
      ...article,
      categoryIds: article.categories.map((ac) => ac.categoryId),
    });
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'article:edit', async () => {
    try {
      const body = await req.json();
      const { title, content, summary, coverImage, status: articleStatus, seoTitle, categoryIds } = body;

      const existing = await prisma.article.findUnique({ where: { id: params.id } });
      if (!existing) return notFound('文章不存在');

      let slug = existing.slug;
      if (title && title !== existing.title) {
        slug = slugify(title);
        const slugExists = await prisma.article.findFirst({
          where: { slug, id: { not: params.id } },
        });
        if (slugExists) slug = `${slug}-${Date.now()}`;
      }

      // Update categories if provided
      if (categoryIds !== undefined) {
        await prisma.articleCategory.deleteMany({ where: { articleId: params.id } });
        if (categoryIds.length > 0) {
          await prisma.articleCategory.createMany({
            data: categoryIds.map((id: string) => ({ articleId: params.id, categoryId: id })),
          });
        }
      }

      const article = await prisma.article.update({
        where: { id: params.id },
        data: {
          title: title || existing.title,
          slug,
          content: content || existing.content,
          summary: summary !== undefined ? summary : existing.summary,
          coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
          status: articleStatus !== undefined ? articleStatus : existing.status,
          seoTitle: seoTitle !== undefined ? seoTitle : existing.seoTitle,
        },
        include: {
          categories: { include: { category: true } },
          author: { select: { id: true, name: true } },
        },
      });

      return success(article, '文章更新成功');
    } catch (e) {
      console.error(e);
      return error('更新文章失败', 500);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(req, 'article:delete', async () => {
    const existing = await prisma.article.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('文章不存在');

    await prisma.article.delete({ where: { id: params.id } });
    return success(null, '文章已删除');
  });
}
