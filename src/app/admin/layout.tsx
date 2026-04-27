'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ThemeProvider } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/admin/login');
    }
  }, [user, loading, isAuthPage, router]);

  // Auth pages: clean layout
  if (isAuthPage) {
    return (
      <ThemeProvider>
        <div className="min-h-screen">{children}</div>
      </ThemeProvider>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AdminSidebar />
        <div className="lg:ml-64 transition-all duration-300">
          <AdminTopbar />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
