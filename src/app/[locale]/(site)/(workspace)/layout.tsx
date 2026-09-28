import type { ReactNode } from 'react';
import { localeFor } from '@/lib/config';
import { WorkspaceShell } from '@/components/workspace-shell';

export default async function WorkspaceLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <WorkspaceShell locale={localeFor(locale)}>{children}</WorkspaceShell>;
}
