import { prisma } from '@/lib/prisma';
import { HeroSection } from '@/components/site/HeroSection';
import { ArticleGrid } from '@/components/site/ArticleGrid';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { status: 1 },
    include: {
      categories: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return (
    <>
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              最新文章
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              探索我们的精选内容
            </p>
          </div>
          <Link href="/articles">
            <Button variant="ghost" icon={<ArrowRight className="w-4 h-4" />}>
              查看全部
            </Button>
          </Link>
        </div>
        <ArticleGrid
          articles={JSON.parse(JSON.stringify(articles))}
        />
      </section>
    </>
  );
}
