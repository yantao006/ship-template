import type { ReactNode } from 'react';
import { site, messages } from '@/lib/config';
import type { WorkspaceSection } from '@/lib/workspace';
import { sections } from '@/lib/workspace';
import { LanguageControl } from './language-control';
import { MarketingNav } from './marketing-nav';

export function WorkspaceShell({ locale, userName, section, children }: { locale: keyof typeof messages; userName?: string; section: WorkspaceSection; children: ReactNode }) {
  const copy = messages[locale];
  const title = copy.workspace.sections[section];
  return <div className="workspace-page">
    <MarketingNav locale={locale} userName={userName} callbackURL={`/${locale}/${section}`} hideLanguage />
    <div className="workspace-layout">
      {userName && <aside className="workspace-sidebar" aria-label={copy.dashboard.navigation}>
        <a className="sidebar-heading" href={`/${locale}`}>{copy.nav.brand}</a>
        <nav aria-label={copy.dashboard.navigation}>
          {sections.map(item => <a key={item} className={section === item ? 'active' : ''} aria-current={section === item ? 'page' : undefined} href={`/${locale}/${item}`}>{copy.workspace.sections[item]}</a>)}
        </nav>
      </aside>}
      <main className="workspace-main">
        <div className="workspace-heading"><div><p className="workspace-breadcrumb">{copy.nav.workspace} / {title}</p><h1>{title}</h1></div><LanguageControl locale={locale} locales={site.locales} label={copy.nav.language} /></div>
        {children}
      </main>
    </div>
  </div>;
}
