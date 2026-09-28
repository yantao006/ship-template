'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, CreditCard, FileText, UserRound, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = { account: UserRound, subscription: CreditCard, invoices: FileText, creditCenter: Coins };

export function AccountSectionNav({ label, items }: { label: string; items: readonly { id: string; href: string; label: string }[] }) {
  const pathname = usePathname();
  return <aside className="account-pages-sidebar"><nav aria-label={label}>{items.map(item => {
    const Icon = icons[item.id];
    const current = pathname === item.href;
    return <Link key={item.id} href={item.href} className={current ? 'active' : undefined} aria-current={current ? 'page' : undefined}>{Icon && <Icon size={16} aria-hidden="true" />}{item.label}</Link>;
  })}</nav></aside>;
}
