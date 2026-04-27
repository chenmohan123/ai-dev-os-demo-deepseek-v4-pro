'use client';

import React from 'react';
import { clsx } from 'clsx';
import type { PermissionData } from '@/types';

interface PermissionCheckboxGridProps {
  permissions: PermissionData[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const MODULE_GROUPS: Record<string, string> = {
  dashboard: '仪表盘',
  article: '文章管理',
  category: '分类管理',
  user: '用户管理',
  role: '角色管理',
  permission: '权限管理',
};

export function PermissionCheckboxGrid({ permissions, selectedIds, onChange }: PermissionCheckboxGridProps) {
  const grouped: Record<string, PermissionData[]> = {};
  for (const perm of permissions) {
    const module = perm.code.split(':')[0];
    if (!grouped[module]) grouped[module] = [];
    grouped[module].push(perm);
  }

  const togglePermission = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const toggleGroup = (module: string) => {
    const groupIds = grouped[module].map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !groupIds.includes(id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...groupIds]));
      onChange(newIds);
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([module, perms]) => {
        const allSelected = perms.every((p) => selectedIds.includes(p.id));
        const someSelected = perms.some((p) => selectedIds.includes(p.id));
        return (
          <div key={module} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 cursor-pointer border-b border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={() => toggleGroup(module)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {MODULE_GROUPS[module] || module}
              </span>
            </label>
            <div className="p-3 grid grid-cols-2 gap-2">
              {perms.map((perm) => (
                <label
                  key={perm.id}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm',
                    selectedIds.includes(perm.id)
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium">{perm.name}</span>
                    <span className="text-xs text-slate-400 ml-1 font-mono">{perm.code}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
