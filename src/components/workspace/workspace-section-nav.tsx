'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


export function WorkspaceSectionNav({ links, label }: { links: { id: string; href: string; label: string }[]; label: string }) {
  const pathname = usePathname();
  return <nav aria-label={label}>
    {links.map(link =>
      <Link key={link.id} className={`ui-nav-item${pathname === link.href ? ' active' : ''}`} aria-current={pathname === link.href ? 'page' : undefined} href={link.href}>{link.label}</Link>)}
  </nav>;
}
