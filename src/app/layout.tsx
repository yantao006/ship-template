import type { ReactNode } from 'react';
import { site, theme } from '@/lib/config';
import { themeTokenStylesheet } from '@/lib/theme-tokens';
import './globals.css';
import '@/components/blocks/tags.css';

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.brand, template: `%s | ${site.brand}` },
  description: 'An early look at your future video workspace.',
  alternates: { canonical: '/' },
  robots: site.previewOnly ? { index: false, follow: false } : undefined,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang={site.defaultLocale} data-mode="auto" data-default-mode={theme.defaultMode.other}>
    <head><style dangerouslySetInnerHTML={{ __html: themeTokenStylesheet() }} /></head>
    <body>{children}</body>
  </html>;
}
