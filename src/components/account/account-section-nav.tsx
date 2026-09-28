'use client';

import { SidebarItem } from '@/components/ui/controls';
import { usePathname } from 'next/navigation';
import { Coins, CreditCard, FileText, UserRound, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = { account: UserRound, subscription: CreditCard, invoices: FileText, creditCenter: Coins };

export function AccountSectionNav({ label, items }: { label: string; items: readonly { id: string; href: string; label: string }[] }) {
  const pathname = usePathname();
  return <aside className="account-pages-sidebar max-[700px]:mb-7 max-[700px]:overflow-x-auto"><nav aria-label={label} className="grid gap-1 [--nav-active-weight:var(--weight-bold)] max-[700px]:w-full max-[700px]:grid-cols-2">{items.map(item => {
    const Icon = icons[item.id];
    const current = pathname === item.href;
    return <SidebarItem key={item.id} href={item.href} active={current} className="flex min-h-9 items-center gap-[9px] px-3 py-2 leading-5 max-[700px]:whitespace-nowrap">{Icon && <Icon size={16} aria-hidden="true" />}{item.label}</SidebarItem>;
  })}</nav></aside>;
}
