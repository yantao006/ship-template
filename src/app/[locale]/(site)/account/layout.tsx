import type { ReactNode } from 'react';
import { AccountSectionNav } from '@/components/account/account-section-nav';
import { localeFor, messages } from '@/lib/config';
import { routePath } from '@/lib/route-paths';
import '@/components/account/account-pages.css';

const sections = ['account', 'subscription', 'invoices', 'creditCenter'] as const;

export default async function AccountLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = localeFor((await params).locale);
  const copy = messages[locale];
  const labels = copy.accountPages;
  const items = sections.map(id => ({ id, href: routePath(locale, id), label: id === 'creditCenter' ? labels.credits : labels[id] }));
  return <div className="account-pages bg-[var(--bg)] text-[var(--text)]"><div className="account-pages-layout mx-auto grid w-[min(100%_-_48px,992px)] grid-cols-[224px_minmax(0,744px)] gap-6 pt-8 pb-16 max-[700px]:block max-[700px]:w-[min(100%_-_32px,560px)] max-[700px]:pt-[18px]">
    <AccountSectionNav label={copy.dashboard.navigation} items={items} />
    <div className="account-pages-main min-w-0 pt-0">{children}</div>
  </div></div>;
}
