import React from 'react';
import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ArticleCardProps {
  title: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  categoryName?: string;
  categorySlug?: string;
  createdAt: string;
  index?: number;
}

export function ArticleCard({
  title,
  slug,
  summary,
  coverImage,
  categoryName,
  createdAt,
  index = 0,
}: ArticleCardProps) {
  const date = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/articles/${slug}`}
      className="group block"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <article className="glass-card overflow-hidden stagger-item hover-lift h-full flex flex-col">
        <div className="relative overflow-hidden aspect-video">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <span className="text-4xl font-bold text-indigo-300 dark:text-indigo-600">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            {categoryName && (
              <Badge variant="primary">{categoryName}</Badge>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {date}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>

          {summary && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1 mb-3">
              {summary}
            </p>
          )}

          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            阅读更多
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
