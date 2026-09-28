import type { ReactNode } from 'react';
import { messages } from '@/lib/config';
import { navigationLinks } from '@/lib/routes';
import { WorkspaceSectionNav } from './workspace-section-nav';

export function WorkspaceShell({ locale, children }: { locale: keyof typeof messages; children: ReactNode }) {
  const copy = messages[locale];
  return <div className="workspace-page">
    <div className="workspace-layout">
      <aside className="workspace-sidebar" aria-label={copy.dashboard.navigation}>
        <WorkspaceSectionNav links={navigationLinks(locale).filter(link => link.id === 'dashboard' || link.id === 'credits')} label={copy.dashboard.navigation} />
        <p className="sidebar-footnote">{copy.dashboard.preview}</p>
      </aside>
      <main className="workspace-main">{children}</main>
    </div>
  </div>;
}
