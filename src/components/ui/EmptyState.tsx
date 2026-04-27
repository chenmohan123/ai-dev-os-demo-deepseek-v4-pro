import React from 'react';
import { FileText, FolderOpen, Users, Shield, Key } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'article' | 'category' | 'user' | 'role' | 'permission';
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const icons = {
  article: FileText,
  category: FolderOpen,
  user: Users,
  role: Shield,
  permission: Key,
};

export function EmptyState({ icon = 'article', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
