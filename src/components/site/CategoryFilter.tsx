'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import type { CategoryTreeNode } from '@/types';

interface CategoryFilterProps {
  categories: CategoryTreeNode[];
  selected: string | undefined;
  onChange: (id: string | undefined) => void;
}

function CategoryItem({
  category,
  selected,
  onChange,
}: {
  category: CategoryTreeNode;
  selected: string | undefined;
  onChange: (id: string | undefined) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;
  const isSelected = selected === category.id;

  return (
    <div>
      <button
        onClick={() => {
          onChange(isSelected ? undefined : category.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={clsx(
          'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors text-left',
          isSelected
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        )}
        style={{ paddingLeft: `${12 + category.level * 20}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )
        ) : (
          <FolderOpen className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="flex-1 truncate">{category.name}</span>
        {category._count && (
          <span className="text-xs text-slate-400">{category._count.articles}</span>
        )}
      </button>
      {hasChildren && expanded && (
        <div>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selected={selected}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 px-3">分类筛选</h3>
      <div className="space-y-0.5">
        <button
          onClick={() => onChange(undefined)}
          className={clsx(
            'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors text-left',
            !selected
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          )}
        >
          <FolderOpen className="w-4 h-4" />
          <span>全部文章</span>
        </button>
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            selected={selected}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}
