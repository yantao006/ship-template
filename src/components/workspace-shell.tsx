import type { ReactNode } from 'react';
import { site, messages } from '@/lib/config';
import { LanguageControl } from './language-control';
import { MarketingNav } from './marketing-nav';

export function WorkspaceShell({ locale, userName, title, children }: { locale: keyof typeof messages; userName?: string; title: string; children: ReactNode }) {
  const copy = messages[locale];
  return <div className="workspace-page">
    <MarketingNav locale={locale} userName={userName} callbackURL={`/${locale}/dashboard`} hideLanguage />
    <div className="workspace-layout">
      <aside className="workspace-sidebar" aria-label={copy.dashboard.navigation}>
        <a className="sidebar-heading" href={`/${locale}`}>{copy.nav.brand}</a>
        <nav aria-label={copy.dashboard.navigation}>
          <a className={title === copy.dashboard.title ? 'active' : ''} href={`/${locale}/dashboard`}>{copy.nav.workspace}</a>
          <a className={title === copy.credits.title ? 'active' : ''} href={`/${locale}/credits`}>{copy.nav.credits}</a>
        </nav>
        <p className="sidebar-footnote">{copy.dashboard.preview}</p>
      </aside>
      <main className="workspace-main">
        <div className="workspace-heading"><div><p className="workspace-breadcrumb">{copy.nav.workspace} / {title}</p><h1>{title}</h1></div><LanguageControl locale={locale} locales={site.locales} label={copy.nav.language} /></div>
        {children}
      </main>
    </div>
  </div>;
}
