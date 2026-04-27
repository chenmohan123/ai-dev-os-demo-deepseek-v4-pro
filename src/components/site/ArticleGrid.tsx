import React from 'react';
import { ArticleCard } from './ArticleCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  status: number;
  createdAt: string;
  categories?: Array<{ category: { id: string; name: string; slug: string } }>;
}

interface ArticleGridProps {
  articles: ArticleItem[];
  loading?: boolean;
}

export function ArticleGrid({ articles, loading = false }: ArticleGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        icon="article"
        title="暂无文章"
        description="还没有发布任何文章，请稍后再来"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, i) => {
        const firstCat = article.categories?.[0]?.category;
        return (
          <ArticleCard
            key={article.id}
            title={article.title}
            slug={article.slug}
            summary={article.summary}
            coverImage={article.coverImage}
            categoryName={firstCat?.name}
            categorySlug={firstCat?.slug}
            createdAt={article.createdAt}
            index={i}
          />
        );
      })}
    </div>
  );
}
