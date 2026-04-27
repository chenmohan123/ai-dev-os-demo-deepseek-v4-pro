'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAuth } from '@/lib/auth-context';

const pathLabels: Record<string, string> = {
  '/admin/dashboard': '仪表盘',
  '/admin/articles': '文章管理',
  '/admin/categories': '分类管理',
  '/admin/users': '用户管理',
  '/admin/roles': '角色管理',
  '/admin/permissions': '权限管理',
};

export function AdminTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const currentLabel = Object.entries(pathLabels).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] || '';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>管理后台</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-white font-medium">{currentLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                </button>
              }
              items={[
                {
                  label: '退出登录',
                  onClick: handleLogout,
                  icon: <LogOut className="w-4 h-4" />,
                  danger: true,
                },
              ]}
            />
          )}
        </div>
      </div>
    </header>
  );
}
