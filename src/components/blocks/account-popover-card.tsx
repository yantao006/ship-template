import React, { type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';

export type PopoverRow = {
  id: string;
  icon: ReactNode;
  label: string;
  badge?: {
    label: string;
    boxed: boolean;
    boxColor?: string;
    textColor?: string;
  };
  dividerBelow?: boolean;
  textColor?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function AccountPopoverRow({ row, itemRole }: { row: PopoverRow; itemRole?: 'menuitem' }) {
  const content = <><span className="account-row-icon" aria-hidden="true">{row.icon}</span><span className="account-row-label">{row.label}</span>{row.badge && <span className={`account-row-badge${row.badge.boxed ? ' boxed' : ''}`} style={{ '--badge-box-color': row.badge.boxColor, color: row.badge.textColor } as CSSProperties}>{row.badge.label}</span>}</>;
  const style = { color: row.textColor };
  return <div className={`account-row${row.dividerBelow ? ' account-row-divider' : ''}`}>
    {row.href !== undefined
      ? <Link href={row.href} role={itemRole} style={style} onClick={row.onClick}>{content}</Link>
      : <button type="button" role={itemRole} style={style} disabled={row.disabled} onClick={row.onClick}>{content}</button>}
  </div>;
}

export function AccountPopoverCard({ header, rows, role, label, className }: { header: ReactNode; rows: readonly PopoverRow[]; role: 'dialog' | 'menu'; label: string; className?: string }) {
  return <div className={`account-popover${className ? ` ${className}` : ''}`} role={role} aria-label={label}>
    {header}
    <div className="account-rows">{rows.map(row => <AccountPopoverRow key={row.id} row={row} itemRole={role === 'menu' ? 'menuitem' : undefined} />)}</div>
  </div>;
}
