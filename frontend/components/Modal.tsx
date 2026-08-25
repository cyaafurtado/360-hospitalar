'use client';
import type { ReactNode } from 'react';
import { Icon } from '../lib/icons';

export function Modal({
  onClose,
  icon = 'shield2',
  tone = 'warn',
  title,
  children,
}: {
  onClose: () => void;
  icon?: string;
  tone?: 'warn' | 'success';
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="sol-modal-overlay" onClick={onClose}>
      <div className="sol-modal" onClick={(e) => e.stopPropagation()}>
        <div className={'sol-modal-icon ' + tone}>
          <Icon name={icon} size={24} stroke={2.4} />
        </div>
        <h2 className="sol-modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
