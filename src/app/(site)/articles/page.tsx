'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '@/components/site/SearchBar';
import { CategoryFilter } from '@/components/site/CategoryFilter';
import { ArticleGrid } from '@/components/site/ArticleGrid';
import { Pagination } from '@/components/ui/Pagination';
import { BreadcrumbNav } from '@/components/site/BreadcrumbNav';
import type { CategoryTreeNode } from '@/types';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 9;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      params.set('status', '1');
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data.items);
        setTotal(data.data.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={[{ label: '文章列表' }]} />

      <div className="mb-8">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={(id) => { setSelectedCategory(id); setPage(1); }}
          />
        </aside>

        <div className="flex-1">
          <ArticleGrid articles={articles} loading={loading} />
          {!loading && total > pageSize && (
            <div className="mt-10">
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
