'use client';

import { SidebarItem } from '@/components/ui/controls';
import { usePathname } from 'next/navigation';


export function WorkspaceSectionNav({ links, label }: { links: { id: string; href: string; label: string }[]; label: string }) {
  const pathname = usePathname();
  return <nav aria-label={label} className="grid gap-[5px] max-[640px]:flex max-[640px]:gap-2">
    {links.map(link =>
      <SidebarItem key={link.id} href={link.href} active={pathname === link.href} className="block px-3 py-[11px] max-[640px]:px-[10px] max-[640px]:py-2 max-[640px]:text-[length:var(--text-12)]">{link.label}</SidebarItem>)}
  </nav>;
}
