import type { ReactNode } from 'react';
import { localeFor } from '@/lib/config';
import { SiteShell } from '@/components/shell/site-shell';

export default async function LocalizedSiteLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <SiteShell locale={localeFor(locale)}>{children}</SiteShell>;
}
