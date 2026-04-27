'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { CategoryPicker } from '@/components/admin/CategoryPicker';
import { slugify } from '@/lib/slugify';
import type { CategoryTreeNode } from '@/types';

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState(0);
  const [seoTitle, setSeoTitle] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data); });
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (publishStatus?: number) => {
    setSaving(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          summary: summary || null,
          coverImage: coverImage || null,
          status: publishStatus !== undefined ? publishStatus : status,
          seoTitle: seoTitle || null,
          categoryIds: selectedCategoryIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/articles');
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">新建文章</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => handleSubmit(0)}
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            保存草稿
          </Button>
          <Button
            variant="gradient"
            onClick={() => handleSubmit(1)}
            loading={saving}
            icon={<Send className="w-4 h-4" />}
          >
            发布
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Input
              label="文章标题"
              placeholder="输入文章标题..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-semibold"
            />

            <div className="mt-4">
              <Input
                label="Slug"
                placeholder="article-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                内容 (Markdown)
              </label>
              <MarkdownEditor value={content} onChange={setContent} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">发布设置</h3>
            <Select
              label="状态"
              options={[
                { value: '0', label: '草稿' },
                { value: '1', label: '发布' },
              ]}
              value={String(status)}
              onChange={(e) => setStatus(Number(e.target.value))}
            />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">SEO</h3>
            <div className="space-y-3">
              <Input
                label="SEO 标题"
                placeholder="搜索引擎显示的标题"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
              <Textarea
                label="摘要"
                placeholder="文章摘要..."
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <Input
                label="封面图 URL"
                placeholder="https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">分类</h3>
            <CategoryPicker
              categories={categories}
              selectedIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
