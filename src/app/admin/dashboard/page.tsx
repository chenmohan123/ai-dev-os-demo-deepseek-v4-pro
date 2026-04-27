'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Users, Eye, FolderTree, Pencil } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/auth-context';

interface DashboardStats {
  articles: number;
  users: number;
  categories: number;
  recentArticles: Array<{
    id: string;
    slug: string;
    title: string;
    status: number;
    createdAt: string;
    author: { name: string };
    categories: Array<{ category: { id: string; name: string } }>;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/articles?page=1&pageSize=5');
        const data = await res.json();

        const usersRes = await fetch('/api/users?page=1&pageSize=1');
        const usersData = await usersRes.json();

        const catsRes = await fetch('/api/categories');
        const catsData = await catsRes.json();

        setStats({
          articles: data.data?.total || 0,
          users: usersData.data?.total || 0,
          categories: Array.isArray(catsData.data) ? catsData.data.length : 0,
          recentArticles: data.data?.items || [],
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          欢迎回来，{user?.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">这是你的内容管理概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="文章总数" value={stats?.articles || 0} icon={FileText} color="indigo" />
        <StatCard label="用户总数" value={stats?.users || 0} icon={Users} color="emerald" />
        <StatCard label="今日访问" value={128} icon={Eye} color="amber" suffix="次" />
        <StatCard label="分类数量" value={stats?.categories || 0} icon={FolderTree} color="sky" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">最近文章</h2>
          <Link
            href="/admin/articles"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            查看全部
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-slate-400">标题</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-slate-400">分类</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-slate-400">状态</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-slate-400">作者</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-slate-400">时间</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentArticles.map((article) => (
                <tr key={article.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <Link
                        href={`/admin/articles/${article.slug}/edit`}
                        className="text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[300px] block"
                      >
                        {article.title}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 flex-wrap">
                      {article.categories?.slice(0, 2).map((ac) => (
                        <Badge key={ac.category.id} variant="default" className="text-xs">
                          {ac.category.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={article.status === 1 ? 'success' : 'warning'}>
                      {article.status === 1 ? '已发布' : '草稿'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    {article.author.name}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
              {(!stats?.recentArticles || stats.recentArticles.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    暂无文章
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
