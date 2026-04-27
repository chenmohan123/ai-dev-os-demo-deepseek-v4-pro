'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  Shield,
  Key,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/ui/Avatar';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: string;
}

const menuItems: MenuItem[] = [
  { label: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
  { label: '文章管理', href: '/admin/articles', icon: FileText, permission: 'article:list' },
  { label: '分类管理', href: '/admin/categories', icon: FolderTree, permission: 'category:list' },
  { label: '用户管理', href: '/admin/users', icon: Users, permission: 'user:list' },
  { label: '角色管理', href: '/admin/roles', icon: Shield, permission: 'role:list' },
  { label: '权限管理', href: '/admin/permissions', icon: Key, permission: 'permission:list' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = menuItems.filter((item) => hasPermission(item.permission));

  return (
    <>
      {/* Mobile backdrop */}
      <MobileSidebar items={visibleItems} pathname={pathname} user={user} />

      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-all duration-300',
          'bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700">
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">DevHub</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User info */}
        {!collapsed && user && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role?.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium',
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-indigo-500 transition-colors"
            >
              ← 返回官网
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

function MobileSidebar({
  items,
  pathname,
  user,
}: {
  items: MenuItem[];
  pathname: string;
  user: { name: string; avatar: string | null; role?: { name: string } } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-2xl gradient-primary shadow-lg flex items-center justify-center"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[55] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700">
              <Link href="/admin/dashboard" className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">DevHub</span>
              </Link>
            </div>

            {user && (
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.role?.name}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium',
                      active
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
