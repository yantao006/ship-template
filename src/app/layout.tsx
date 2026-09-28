import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { site, theme, messages, localeFor } from '@/lib/config';
import { requestLocaleHeader, requestSiteShellHeader } from '@/lib/routes';
import { themeTokenStylesheet } from '@/lib/theme-tokens';
import { ThemeModeInitializer } from '@/components/shell/theme-mode-initializer';
import './globals.css';
import '@/components/styles/tags.css';

async function requestLocale() {
  return localeFor((await headers()).get(requestLocaleHeader) ?? site.defaultLocale);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  return {
    metadataBase: new URL(site.url),
    title: { default: site.brand, template: `%s | ${site.brand}` },
    description: messages[locale].metadata.description,
    alternates: { canonical: '/' },
    robots: site.previewOnly ? { index: false, follow: false } : undefined,
  };
}
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await requestLocale();
  const defaultMode = (await headers()).get(requestSiteShellHeader) === '1' ? theme.defaultMode.home : theme.defaultMode.other;
  return <html lang={locale} data-mode="auto" data-default-mode={defaultMode}>
    <head><style dangerouslySetInnerHTML={{ __html: themeTokenStylesheet() }} /></head>
    <body><ThemeModeInitializer defaultMode={defaultMode} />{children}</body>
  </html>;
}
