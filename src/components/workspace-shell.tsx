import type { ReactNode } from 'react';
import { site, messages } from '@/lib/config';
import { navigationLinks, routePath, type NavigationId } from '@/lib/routes';
import { LanguageControl } from './language-control';
import { MarketingNav } from './marketing-nav';

export function WorkspaceShell({ locale, userName, title, currentItem, children }: { locale: keyof typeof messages; userName?: string; title: string; currentItem: NavigationId; children: ReactNode }) {
  const copy = messages[locale];
  return <div className="workspace-page">
    <MarketingNav locale={locale} userName={userName} callbackURL={routePath(locale, 'dashboard')} hideLanguage />
    <div className="workspace-layout">
      <aside className="workspace-sidebar" aria-label={copy.dashboard.navigation}>
        <a className="sidebar-heading" href={routePath(locale, 'home')}>{copy.nav.brand}</a>
        <nav aria-label={copy.dashboard.navigation}>
          {navigationLinks(locale).filter(link => link.id === 'dashboard' || link.id === 'credits').map(link => <a key={link.id} className={currentItem === link.id ? 'active' : ''} aria-current={currentItem === link.id ? 'page' : undefined} href={link.href}>{link.label}</a>)}
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
