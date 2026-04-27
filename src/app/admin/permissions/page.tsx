'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DataTable } from '@/components/admin/DataTable';
import { usePermission } from '@/lib/auth-context';
import type { PermissionData } from '@/types';

export default function PermissionManagePage() {
  const canCreate = usePermission('permission:create');
  const canEdit = usePermission('permission:edit');
  const canDelete = usePermission('permission:delete');

  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editPerm, setEditPerm] = useState<PermissionData | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/permissions');
      const data = await res.json();
      if (data.success) setPermissions(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const openCreate = () => {
    setEditPerm(null);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setModalOpen(true);
  };

  const openEdit = (perm: PermissionData) => {
    setEditPerm(perm);
    setFormName(perm.name);
    setFormCode(perm.code);
    setFormDesc(perm.description || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formCode) return;
    setSaving(true);
    try {
      if (editPerm) {
        await fetch(`/api/permissions/${editPerm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, code: formCode, description: formDesc }),
        });
      } else {
        await fetch('/api/permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, code: formCode, description: formDesc }),
        });
      }
      setModalOpen(false);
      fetchPermissions();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/permissions/${deleteTarget}`, { method: 'DELETE' });
    setDeleteModal(false);
    setDeleteTarget(null);
    fetchPermissions();
  };

  const columns = [
    {
      key: 'name',
      header: '权限名称',
      render: (item: PermissionData) => (
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'code',
      header: '权限代码',
      render: (item: PermissionData) => (
        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-mono text-indigo-600 dark:text-indigo-400">
          {item.code}
        </code>
      ),
    },
    {
      key: 'description',
      header: '描述',
      render: (item: PermissionData) => (
        <span className="text-slate-500 dark:text-slate-400 text-sm">
          {item.description || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (item: PermissionData) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(item)}>
              编辑
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-500" onClick={() => {
              setDeleteTarget(item.id);
              setDeleteModal(true);
            }}>
              删除
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">权限管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            权限代码用于后端 API 级别和前端按钮级别的访问控制
          </p>
        </div>
        {canCreate && (
          <Button variant="gradient" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            新增权限
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={permissions} loading={loading} rowKey={(p) => p.id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editPerm ? '编辑权限' : '新增权限'} size="sm">
        <div className="space-y-4">
          <Input label="权限名称" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例如：创建文章" />
          <Input label="权限代码" value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="例如：article:create" />
          <Textarea label="描述" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="权限描述..." rows={2} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button variant="gradient" onClick={handleSave} loading={saving}>
              {editPerm ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={handleDelete} title="删除权限" message="确定要删除此权限吗？关联此权限的角色将失去该权限。" />
    </div>
  );
}
