import React from 'react';
import { clsx } from 'clsx';
import type { TestStatus } from '../types';

interface TestStatusIndicatorProps {
  status: TestStatus;
  className?: string;
}

const STYLES: Record<Exclude<TestStatus, 'never'>, string> = {
  success: 'text-emerald-600',
  failed: 'text-rose-600',
  pending: 'text-amber-500 animate-pulse',
};

const LABELS: Record<Exclude<TestStatus, 'never'>, string> = {
  success: '✓ Online',
  failed: '✗ Offline',
  pending: '● Testing',
};

export const TestStatusIndicator: React.FC<TestStatusIndicatorProps> = ({ status, className }) => {
  if (!status || status === 'never') return null;

  return (
    <span
      className={clsx('text-[10px] font-semibold flex items-center gap-1', STYLES[status], className)}
      role="status"
      aria-label={`Test status: ${LABELS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
};
