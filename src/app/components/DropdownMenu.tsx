import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './DropdownMenu.module.css';

interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
}

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.dropdown}>
      <button onClick={() => setOpen(!open)} className={styles.trigger}>
        {trigger}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className={styles.menu}>
          {items.map((item, i) => (
            <button key={i} onClick={() => { item.onClick(); setOpen(false); }} className={styles.item}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}