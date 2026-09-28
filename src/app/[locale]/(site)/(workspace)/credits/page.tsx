import { WorkspaceContent } from '@/components/workspace-content';
import { localeFor } from '@/lib/config';

export const dynamic = 'force-dynamic';
export default async function CreditsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <WorkspaceContent locale={localeFor(locale)} section="credits" />;
}
