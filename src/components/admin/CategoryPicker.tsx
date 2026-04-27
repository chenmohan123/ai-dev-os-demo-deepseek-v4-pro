'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import type { CategoryTreeNode } from '@/types';

interface CategoryPickerProps {
  categories: CategoryTreeNode[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function CategoryPicker({
  categories,
  selectedIds,
  onChange,
  placeholder = '选择分类',
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedNames = categories
    .flatMap((c) => [c, ...c.children])
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.name);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-left min-h-[42px]"
      >
        {selectedIds.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs"
              >
                {name}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cat = categories.flatMap((c) => [c, ...c.children]).find((c) => c.name === name);
                    if (cat) toggleCategory(cat.id);
                  }}
                />
              </span>
            ))}
          </div>
        )}
        <ChevronDown className={clsx('w-4 h-4 text-slate-400 ml-auto flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 max-h-64 overflow-y-auto animate-scale-in">
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索分类..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm input-glow"
            />
          </div>
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              selectedIds={selectedIds}
              toggleCategory={toggleCategory}
              search={search}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryItem({
  category,
  selectedIds,
  toggleCategory,
  search,
  level = 0,
}: {
  category: CategoryTreeNode;
  selectedIds: string[];
  toggleCategory: (id: string) => void;
  search: string;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedIds.includes(category.id);

  const matchesSearch = search === '' || category.name.toLowerCase().includes(search.toLowerCase());
  const childrenMatchSearch = category.children?.some(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (search && !matchesSearch && !childrenMatchSearch) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => toggleCategory(category.id)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        style={{ paddingLeft: `${12 + level * 20}px` }}
      >
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleCategory(category.id)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className={clsx(isSelected && 'text-indigo-600 dark:text-indigo-400 font-medium')}>
          {category.name}
        </span>
      </button>
      {hasChildren && expanded && (
        <div>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedIds={selectedIds}
              toggleCategory={toggleCategory}
              search={search}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
