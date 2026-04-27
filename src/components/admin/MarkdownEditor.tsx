'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { clsx } from 'clsx';
import { Maximize2, Minimize2, Eye, Edit3 } from 'lucide-react';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [preview, setPreview] = useState<'edit' | 'live' | 'preview'>('live');

  return (
    <div className={clsx(
      'rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden',
      fullscreen && 'fixed inset-0 z-[60] rounded-none'
    )}
      data-color-mode="light"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreview('edit')}
            className={clsx(
              'p-1.5 rounded-lg text-xs font-medium transition-colors',
              preview === 'edit'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreview('live')}
            className={clsx(
              'p-1.5 rounded-lg text-xs font-medium transition-colors',
              preview === 'live'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setFullscreen(!fullscreen)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <div className={clsx(fullscreen ? 'h-[calc(100%-48px)]' : 'h-[500px]')}>
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview={preview}
          height={fullscreen ? undefined : 500}
          visibleDragbar={false}
          hideToolbar={false}
          className="h-full"
        />
      </div>
    </div>
  );
}
