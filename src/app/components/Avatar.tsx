import React from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  initials?: string;
}

export function Avatar({ src, alt, size = 'md', initials }: AvatarProps) {
  return (
    <div className={`${styles.avatar} ${styles[size]}`}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span>{initials || alt.charAt(0)}</span>
      )}
    </div>
  );
}