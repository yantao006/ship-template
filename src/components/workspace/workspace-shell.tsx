import type { ReactNode } from 'react';
import { messages } from '@/lib/config';
import { navigationLinks } from '@/lib/routes';
import { WorkspaceSectionNav } from './workspace-section-nav';

export function WorkspaceShell({ locale, children }: { locale: keyof typeof messages; children: ReactNode }) {
  const copy = messages[locale];
  return <div className="workspace-page flex flex-col bg-[var(--bg)]">
    <div className="workspace-layout grid flex-1 grid-cols-[245px_minmax(0,1fr)] max-[900px]:grid-cols-[190px_minmax(0,1fr)] max-[640px]:block">
      <aside className="workspace-sidebar flex flex-col gap-[26px] border-r border-[var(--line)] bg-[var(--surface)] px-5 py-[35px] max-[640px]:gap-[26px] max-[640px]:border-r-0 max-[640px]:border-b max-[640px]:px-4 max-[640px]:py-3" aria-label={copy.dashboard.navigation}>
        <WorkspaceSectionNav links={navigationLinks(locale).filter(link => link.id === 'dashboard' || link.id === 'credits')} label={copy.dashboard.navigation} />
        <p className="sidebar-footnote mt-auto mr-3 mb-0 ml-3 text-[length:var(--text-12)] text-[var(--muted)] max-[640px]:hidden">{copy.dashboard.preview}</p>
      </aside>
      <div className="workspace-main w-full max-w-[1050px] min-w-0 px-[clamp(20px,4vw,64px)] pt-[46px] pb-20 max-[640px]:px-4 max-[640px]:pt-7 max-[640px]:pb-[60px]">{children}</div>
    </div>
  </div>;
}
