import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color = '#10a37f' }: SpinnerProps) {
  return (
    <div className={`${styles.spinner} ${styles[size]}`} style={{ borderTopColor: color }} />
  );
}