import type { ReactNode } from 'react';
import { messages } from '@/lib/config';
import { navigationLinks, type NavigationId } from '@/lib/routes';

export function WorkspaceShell({ locale, title, currentItem, children }: { locale: keyof typeof messages; title: string; currentItem: NavigationId; children: ReactNode }) {
  const copy = messages[locale];
  return <div className="workspace-page">
    <div className="workspace-layout">
      <aside className="workspace-sidebar" aria-label={copy.dashboard.navigation}>
        <nav aria-label={copy.dashboard.navigation}>
          {navigationLinks(locale).filter(link => link.id === 'dashboard' || link.id === 'credits').map(link => <a key={link.id} className={currentItem === link.id ? 'active' : ''} aria-current={currentItem === link.id ? 'page' : undefined} href={link.href}>{link.label}</a>)}
        </nav>
        <p className="sidebar-footnote">{copy.dashboard.preview}</p>
      </aside>
      <main className="workspace-main">
        <div className="workspace-heading"><div><p className="workspace-breadcrumb">{copy.nav.workspace} / {title}</p><h1>{title}</h1></div></div>
        {children}
      </main>
    </div>
  </div>;
}
