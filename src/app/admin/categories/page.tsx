'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePermission } from '@/lib/auth-context';
import type { CategoryTreeNode } from '@/types';

export default function CategoryManagePage() {
  const canCreate = usePermission('category:create');
  const canEdit = usePermission('category:edit');
  const canDelete = usePermission('category:delete');

  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTreeNode | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = (pId: string | null = null) => {
    setEditingCategory(null);
    setName('');
    setParentId(pId);
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryTreeNode) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParentId(cat.parentId);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, parentId }),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, parentId }),
        });
      }
      setModalOpen(false);
      fetchCategories();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/categories/${deleteTarget}`, { method: 'DELETE' });
    setDeleteModal(false);
    setDeleteTarget(null);
    fetchCategories();
  };

  const handleSort = async (id: string, direction: 'up' | 'down') => {
    const flat = flattenCategories(categories);
    const idx = flat.findIndex((c) => c.id === id);
    if (idx === -1) return;

    const sibling = direction === 'up' ? flat[idx - 1] : flat[idx + 1];
    if (!sibling || sibling.parentId !== flat[idx].parentId) return;

    await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sort: direction === 'up' ? sibling.sort - 1 : sibling.sort + 1 }),
    });
    await fetch(`/api/categories/${sibling.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sort: direction === 'up' ? flat[idx].sort + 1 : flat[idx].sort - 1 }),
    });
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">分类管理</h1>
        {canCreate && (
          <Button variant="gradient" icon={<Plus className="w-4 h-4" />} onClick={() => openCreate(null)}>
            新建分类
          </Button>
        )}
      </div>

      {categories.length === 0 ? (
        <Card>
          <EmptyState
            icon="category"
            title="暂无分类"
            description="创建分类来组织文章内容"
            action={canCreate ? (
              <Button variant="gradient" onClick={() => openCreate(null)}>
                创建第一个分类
              </Button>
            ) : undefined}
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={openEdit}
                onDelete={(id) => { setDeleteTarget(id); setDeleteModal(true); }}
                onCreateChild={openCreate}
                onSort={handleSort}
                level={0}
              />
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? '编辑分类' : '新建分类'}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="分类名称"
            placeholder="输入分类名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button variant="gradient" onClick={handleSave} loading={saving}>
              {editingCategory ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="删除分类"
        message="确定要删除此分类吗？子分类将提升到上一级。"
      />
    </div>
  );
}

function CategoryRow({
  category,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onCreateChild,
  onSort,
  level,
}: {
  category: CategoryTreeNode;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (cat: CategoryTreeNode) => void;
  onDelete: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onSort: (id: string, direction: 'up' | 'down') => void;
  level: number;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <div
        className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        <div className="flex items-center gap-1 text-slate-400">
          <button onClick={() => onSort(category.id, 'up')} className="p-0.5 hover:text-slate-600">
            <ChevronRight className="w-3 h-3 -rotate-90" />
          </button>
          <button onClick={() => onSort(category.id, 'down')} className="p-0.5 hover:text-slate-600">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </button>
        </div>

        {category.children.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-slate-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">{category.name}</span>
        <span className="text-xs text-slate-400">{category._count?.articles || 0} 篇文章</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onCreateChild(category.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(category.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {expanded && category.children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateChild={onCreateChild}
          onSort={onSort}
          level={level + 1}
        />
      ))}
    </>
  );
}

function flattenCategories(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  function walk(nodes: CategoryTreeNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children) walk(node.children);
    }
  }
  walk(tree);
  return result;
}
