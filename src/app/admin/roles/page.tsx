'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DataTable } from '@/components/admin/DataTable';
import { PermissionCheckboxGrid } from '@/components/admin/PermissionCheckboxGrid';
import { Badge } from '@/components/ui/Badge';
import { usePermission } from '@/lib/auth-context';
import type { PermissionData, RoleData } from '@/types';

export default function RoleManagePage() {
  const canCreate = usePermission('role:create');
  const canEdit = usePermission('role:edit');
  const canDelete = usePermission('role:delete');

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleData | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPermIds, setFormPermIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions'),
      ]);
      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();
      if (rolesData.success) setRoles(rolesData.data);
      if (permsData.success) setPermissions(permsData.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditRole(null);
    setFormName('');
    setFormDesc('');
    setFormPermIds([]);
    setModalOpen(true);
  };

  const openEdit = async (role: RoleData) => {
    setEditRole(role);
    setFormName(role.name);
    setFormDesc(role.description || '');
    try {
      const res = await fetch(`/api/roles/${role.id}`);
      const data = await res.json();
      if (data.success) {
        setFormPermIds(data.data.permissionIds || []);
      }
    } catch { /* ignore */ }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editRole) {
        await fetch(`/api/roles/${editRole.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, description: formDesc, permissionIds: formPermIds }),
        });
      } else {
        await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, description: formDesc, permissionIds: formPermIds }),
        });
      }
      setModalOpen(false);
      fetchData();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/roles/${deleteTarget}`, { method: 'DELETE' });
    setDeleteModal(false);
    setDeleteTarget(null);
    fetchData();
  };

  const columns = [
    {
      key: 'name',
      header: '角色名称',
      render: (item: RoleData) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: '描述',
      render: (item: RoleData) => (
        <span className="text-slate-500 dark:text-slate-400 text-sm">
          {item.description || '-'}
        </span>
      ),
    },
    {
      key: 'users',
      header: '用户数',
      render: (item: RoleData) => (
        <Badge variant="default">{item._count?.users || 0}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (item: RoleData) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(item)}>
              编辑
            </Button>
          )}
          {canDelete && item.name !== '超级管理员' && (
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">角色管理</h1>
        {canCreate && (
          <Button variant="gradient" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            新建角色
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={roles} loading={loading} rowKey={(r) => r.id} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRole ? '编辑角色' : '新建角色'}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="角色名称" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例如：编辑、作者" />
          <Textarea label="描述" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="角色描述..." rows={2} />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              权限分配
            </label>
            <div className="max-h-80 overflow-y-auto">
              <PermissionCheckboxGrid
                permissions={permissions}
                selectedIds={formPermIds}
                onChange={setFormPermIds}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button variant="gradient" onClick={handleSave} loading={saving}>
              {editRole ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={handleDelete} title="删除角色" message="确定要删除此角色吗？" />
    </div>
  );
}
