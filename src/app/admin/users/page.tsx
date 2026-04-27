'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Key, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { usePermission } from '@/lib/auth-context';

interface UserItem {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: number;
  role: { id: string; name: string };
  createdAt: string;
  _count: { articles: number };
}

interface RoleOption {
  id: string;
  name: string;
}

export default function UserManagePage() {
  const canCreate = usePermission('user:create');
  const canEdit = usePermission('user:edit');
  const canDelete = usePermission('user:delete');
  const canToggle = usePermission('user:toggle-status');

  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleId, setFormRoleId] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [resetPwModal, setResetPwModal] = useState(false);
  const [resetPwTarget, setResetPwTarget] = useState<string | null>(null);
  const [resetPwValue, setResetPwValue] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('pageSize', '10');
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.items);
        setTotal(data.data.total);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, page]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success) setRoles(data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const openCreate = () => {
    setEditUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRoleId(roles[0]?.id || '');
    setModalOpen(true);
  };

  const openEdit = (user: UserItem) => {
    setEditUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRoleId(user.role.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formEmail) return;
    setSaving(true);
    try {
      if (editUser) {
        const body: Record<string, unknown> = { name: formName, email: formEmail, roleId: formRoleId };
        if (formPassword) body.password = formPassword;
        await fetch(`/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, email: formEmail, password: formPassword || '123456', roleId: formRoleId }),
        });
      }
      setModalOpen(false);
      fetchUsers();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/users/${deleteTarget}`, { method: 'DELETE' });
    setDeleteModal(false);
    setDeleteTarget(null);
    fetchUsers();
  };

  const handleToggleStatus = async (user: UserItem) => {
    await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: user.status === 1 ? 0 : 1 }),
    });
    fetchUsers();
  };

  const handleResetPassword = async () => {
    if (!resetPwTarget || !resetPwValue) return;
    await fetch(`/api/users/${resetPwTarget}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPwValue }),
    });
    setResetPwModal(false);
    setResetPwTarget(null);
    setResetPwValue('');
  };

  const columns = [
    {
      key: 'user',
      header: '用户',
      render: (item: UserItem) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} src={item.avatar} size="sm" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-xs text-slate-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: '角色',
      render: (item: UserItem) => <Badge variant="primary">{item.role.name}</Badge>,
    },
    {
      key: 'articles',
      header: '文章数',
      render: (item: UserItem) => item._count.articles,
    },
    {
      key: 'status',
      header: '状态',
      render: (item: UserItem) => (
        canToggle ? (
          <Toggle checked={item.status === 1} onChange={() => handleToggleStatus(item)} />
        ) : (
          <Badge variant={item.status === 1 ? 'success' : 'danger'}>
            {item.status === 1 ? '启用' : '禁用'}
          </Badge>
        )
      ),
    },
    {
      key: 'createdAt',
      header: '创建时间',
      render: (item: UserItem) => new Date(item.createdAt).toLocaleDateString('zh-CN'),
    },
    {
      key: 'actions',
      header: '操作',
      render: (item: UserItem) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <>
              <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(item)}>
                编辑
              </Button>
              <Button variant="ghost" size="sm" icon={<Key className="w-3 h-3" />} onClick={() => {
                setResetPwTarget(item.id);
                setResetPwValue('');
                setResetPwModal(true);
              }}>
                重置密码
              </Button>
            </>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">用户管理</h1>
        {canCreate && (
          <Button variant="gradient" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            新建用户
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
      </div>

      <DataTable columns={columns} data={users} loading={loading} rowKey={(u) => u.id} />
      {!loading && total > 10 && <Pagination current={page} total={total} pageSize={10} onChange={setPage} />}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? '编辑用户' : '新建用户'} size="sm">
        <div className="space-y-4">
          <Input label="用户名" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="邮箱" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          <Input label={editUser ? '新密码 (留空不修改)' : '密码'} type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
          <Select
            label="角色"
            value={formRoleId}
            onChange={(e) => setFormRoleId(e.target.value)}
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button variant="gradient" onClick={handleSave} loading={saving}>
              {editUser ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={handleDelete} title="删除用户" message="确定要删除此用户吗？此操作不可撤销。" />

      {/* Reset Password Modal */}
      <Modal open={resetPwModal} onClose={() => setResetPwModal(false)} title="重置密码" size="sm">
        <div className="space-y-4">
          <Input label="新密码" type="password" value={resetPwValue} onChange={(e) => setResetPwValue(e.target.value)} placeholder="输入新密码（至少6位）" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setResetPwModal(false)}>取消</Button>
            <Button variant="gradient" onClick={handleResetPassword}>确认重置</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
