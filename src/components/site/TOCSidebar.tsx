'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCSidebarProps {
  items: TOCItem[];
}

export function TOCSidebar({ items }: TOCSidebarProps) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="hidden xl:block">
      <div className="sticky top-24">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <List className="w-4 h-4" />
          目录
        </div>
        <nav className="space-y-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={clsx(
                'block text-sm transition-colors py-1 border-l-2',
                item.level === 2 ? 'pl-3' : 'pl-6',
                activeId === item.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function MobileTOC({ items }: { items: TOCItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <List className="w-4 h-4" />
          目录
        </span>
        <span className="text-xs text-slate-400">{items.length} 个章节</span>
      </button>
      {open && (
        <nav className="mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 animate-scale-in">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="block text-sm py-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
            >
              {item.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
