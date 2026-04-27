'use client';

import React from 'react';
import { clsx } from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'transition-all duration-200 input-glow',
          'px-4 py-2.5 text-sm',
          error
            ? 'border-red-400 focus:ring-red-200'
            : 'border-slate-200 dark:border-slate-600',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
