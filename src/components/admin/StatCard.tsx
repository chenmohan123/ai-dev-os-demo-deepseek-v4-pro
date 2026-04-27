'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'indigo' | 'emerald' | 'amber' | 'sky';
  suffix?: string;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
  },
};

export function StatCard({ label, value, icon: Icon, color, suffix }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 500;
      const start = 0;
      const increment = (value - start) / (duration / 16);
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <div className={clsx('rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg', colorMap[color].bg, 'border-transparent')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className={clsx('text-3xl font-bold mt-1', colorMap[color].text)}>
            {typeof value === 'number' ? displayValue : value}
            {suffix && <span className="text-lg font-normal ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colorMap[color].iconBg)}>
          <Icon className={clsx('w-6 h-6', colorMap[color].text)} />
        </div>
      </div>
    </div>
  );
}
