import { WorkspaceContent } from '@/components/workspace-content';
import { localeFor } from '@/lib/config';
export const dynamic = 'force-dynamic';
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string; page?: string; unread?: string }> }) {
  const { locale } = await params;
  return <WorkspaceContent locale={localeFor(locale)} section="payments" query={await searchParams} />;
}
