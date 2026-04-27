'use client';

import React from 'react';
import { clsx } from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  rowKey?: (item: T) => string;
  emptyText?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  selectedIds,
  onSelect,
  onSelectAll,
  rowKey = (item: T) => (item as Record<string, unknown>).id as string,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            {onSelect && onSelectAll && (
              <th className="w-10 py-3 px-3">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds?.length === data.length}
                  onChange={onSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                {columns.map((col, j) => (
                  <td key={col.key} className="py-3 px-4">
                    <div className="h-4 skeleton rounded w-3/4" style={{ animationDelay: `${j * 0.1}s` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onSelect ? 1 : 0)}
                className="py-12 text-center text-slate-400 dark:text-slate-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={rowKey(item)}
                className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {onSelect && (
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds?.includes(rowKey(item)) || false}
                      onChange={() => onSelect(rowKey(item))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={clsx('py-3 px-4', col.className)}>
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] || '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
