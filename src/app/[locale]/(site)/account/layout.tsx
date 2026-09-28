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
  return <div className="account-pages"><div className="account-pages-layout">
    <AccountSectionNav label={copy.dashboard.navigation} items={items} />
    <div className="account-pages-main">{children}</div>
  </div></div>;
}
