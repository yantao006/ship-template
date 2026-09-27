import type { ReactNode } from 'react';
import { site, messages } from '@/lib/config';
import { SiteShell } from '@/components/site-shell';

export default function DefaultSiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell locale={site.defaultLocale as keyof typeof messages}>{children}</SiteShell>;
}
