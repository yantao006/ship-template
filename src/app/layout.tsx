import type { ReactNode, CSSProperties } from 'react';
import { site, theme } from '@/lib/config';
import './globals.css';

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.brand, template: `%s | ${site.brand}` },
  description: 'An early look at your future video workspace.',
  alternates: { canonical: '/' },
  robots: site.previewOnly ? { index: false, follow: false } : undefined,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  const tokens = { '--bg': theme.background, '--surface': theme.surface, '--text': theme.foreground, '--muted': theme.muted, '--accent': theme.accent, '--line': theme.border, fontFamily: theme.font } as CSSProperties;
  return <html lang={site.defaultLocale}><body style={tokens}>{children}</body></html>;
}
