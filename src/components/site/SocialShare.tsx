'use client';

import React from 'react';
import { Twitter, Facebook, Link2 } from 'lucide-react';

export function SocialShare() {
  const buttons = [
    { icon: Twitter, label: 'Twitter', color: 'hover:text-sky-500' },
    { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Link2, label: 'Copy Link', color: 'hover:text-indigo-500' },
  ];

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400 mr-2">分享</span>
      {buttons.map(({ icon: Icon, label, color }) => (
        <button
          key={label}
          aria-label={label}
          className={`p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${color}`}
          onClick={() => {/* UI only */}}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
