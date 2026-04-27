'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { usePermission } from '@/lib/auth-context';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  author: { name: string };
  categories: Array<{ category: { id: string; name: string } }>;
}

export default function ArticleListPage() {
  const canCreate = usePermission('article:create');
  const canEdit = usePermission('article:edit');
  const canDelete = usePermission('article:delete');
  const canPublish = usePermission('article:publish');

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('pageSize', '10');

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
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/articles/${deleteTarget}`, { method: 'DELETE' });
      setDeleteModal(false);
      setDeleteTarget(null);
      fetchArticles();
    } catch {
      // ignore
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    }
    setSelectedIds([]);
    fetchArticles();
  };

  const columns = [
    {
      key: 'title',
      header: '标题',
      render: (item: Article) => (
        <div className="flex items-center gap-2">
          <Link
            href={canEdit ? `/admin/articles/${item.slug}/edit` : '#'}
            className="text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors truncate max-w-[300px] block"
          >
            {item.title}
          </Link>
        </div>
      ),
    },
    {
      key: 'categories',
      header: '分类',
      render: (item: Article) => (
        <div className="flex gap-1 flex-wrap">
          {item.categories?.slice(0, 2).map((ac) => (
            <Badge key={ac.category.id} variant="default" className="text-xs">
              {ac.category.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: '状态',
      render: (item: Article) => <StatusBadge status={item.status} />,
    },
    {
      key: 'author',
      header: '作者',
      render: (item: Article) => item.author.name,
    },
    {
      key: 'updatedAt',
      header: '更新时间',
      render: (item: Article) => new Date(item.updatedAt).toLocaleDateString('zh-CN'),
    },
    {
      key: 'actions',
      header: '操作',
      render: (item: Article) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <Link href={`/admin/articles/${item.slug}/edit`}>
              <Button variant="ghost" size="sm" icon={<Pencil className="w-4 h-4" />}>
                编辑
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-500 hover:text-red-600"
              onClick={() => {
                setDeleteTarget(item.id);
                setDeleteModal(true);
              }}
            >
              删除
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">文章管理</h1>
        {canCreate && (
          <Link href="/admin/articles/new">
            <Button variant="gradient" icon={<Plus className="w-4 h-4" />}>
              新建文章
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          options={[
            { value: '', label: '全部状态' },
            { value: '1', label: '已发布' },
            { value: '0', label: '草稿' },
          ]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-full sm:w-40"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <span className="text-sm text-red-700 dark:text-red-400">
            已选择 {selectedIds.length} 项
          </span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            批量删除
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={articles}
        loading={loading}
        selectedIds={selectedIds}
        onSelect={(id) =>
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }
        onSelectAll={() =>
          setSelectedIds(
            selectedIds.length === articles.length
              ? []
              : articles.map((a) => a.id)
          )
        }
        rowKey={(item) => item.id}
      />

      {!loading && total > 10 && (
        <Pagination current={page} total={total} pageSize={10} onChange={setPage} />
      )}

      <ConfirmModal
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="删除文章"
        message="确定要删除这篇文章吗？此操作不可撤销。"
      />
    </div>
  );
}
