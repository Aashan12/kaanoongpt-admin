import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({ width = '100%', height = '20px', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeleton} style={{ width, height }} />
      ))}
    </>
  );
}