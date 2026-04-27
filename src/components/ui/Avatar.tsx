import React from 'react';
import { clsx } from 'clsx';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx('rounded-full object-cover border-2 border-white dark:border-slate-700', sizes[size], className)}
      />
    );
  }

  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : '';

  return (
    <div
      className={clsx(
        'rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
        'flex items-center justify-center font-medium border-2 border-white dark:border-slate-700',
        sizes[size],
        className
      )}
    >
      {initials || <User className="w-4 h-4" />}
    </div>
  );
}
