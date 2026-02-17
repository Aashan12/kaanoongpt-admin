import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, color = '#10a37f', showLabel = true }: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.bar} style={{ width: `${percentage}%`, backgroundColor: color }} />
      {showLabel && <span className={styles.label}>{Math.round(percentage)}%</span>}
    </div>
  );
}