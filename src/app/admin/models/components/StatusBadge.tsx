import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ModelStatus } from '../types';

interface StatusBadgeProps {
  status: ModelStatus;
  className?: string;
}

const STATUS_STYLES: Record<ModelStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-50 text-slate-600 border-slate-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
};

const DOT_COLORS: Record<ModelStatus, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-slate-400',
  error: 'bg-rose-500',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span
      className={twMerge(
        clsx(
          'px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 w-fit uppercase tracking-wider',
          STATUS_STYLES[status]
        ),
        className
      )}
      role="status"
      aria-label={`Status: ${status}`}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', DOT_COLORS[status])} />
      {status}
    </span>
  );
};
