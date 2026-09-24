import type { ReactNode } from 'react';
import { site, theme } from '@/lib/config';

export const metadata = { metadataBase: new URL(site.url), title: { default: site.brand, template: `%s | ${site.brand}` }, description: `${site.brand} video creation`, alternates: { canonical: '/' } };
export default function RootLayout({ children }: {children: ReactNode}) {
  return <html lang={site.defaultLocale}><body style={{ margin: 0, background: theme.background, color: theme.foreground, fontFamily: theme.font }}><main>{children}</main></body></html>;
}
