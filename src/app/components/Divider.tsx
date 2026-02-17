import React from 'react';
import styles from './Divider.module.css';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  margin?: string;
}

export function Divider({ orientation = 'horizontal', margin = '1rem 0' }: DividerProps) {
  return <div className={`${styles.divider} ${styles[orientation]}`} style={{ margin }} />;
}