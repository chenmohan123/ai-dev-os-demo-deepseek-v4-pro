import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BreadcrumbNav } from '@/components/site/BreadcrumbNav';
import { ArticleContent } from '@/components/site/ArticleContent';
import { TOCSidebar, MobileTOC } from '@/components/site/TOCSidebar';
import { SocialShare } from '@/components/site/SocialShare';
import { Badge } from '@/components/ui/Badge';
import { Calendar, User, Clock } from 'lucide-react';
import { getTOCItems } from '@/lib/markdown';

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      categories: {
        include: { category: true },
      },
    },
  });

  if (!article || article.status !== 1) {
    notFound();
  }

  const tocItems = getTOCItems(article.content);
  const date = new Date(article.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const breadcrumbs = [
    { label: '文章', href: '/articles' },
    { label: article.title },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbs} />

      <MobileTOC items={tocItems} />

      <div className="flex gap-10">
        <article className="flex-1 min-w-0">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {article.categories.map((ac) => (
                <Badge key={ac.category.id} variant="primary">
                  {ac.category.name}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {article.author.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {Math.ceil(article.content.length / 500)} 分钟阅读
              </span>
            </div>
          </header>

          {/* Cover image */}
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full rounded-3xl mb-10 shadow-lg object-cover max-h-[500px]"
            />
          )}

          {/* Content */}
          <ArticleContent content={article.content} />

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <SocialShare />
          </div>
        </article>

        {/* Desktop TOC sidebar */}
        <aside className="w-64 flex-shrink-0">
          <TOCSidebar items={tocItems} />
        </aside>
      </div>
    </div>
  );
}
