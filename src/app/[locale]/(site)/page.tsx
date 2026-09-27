import { HomeContent } from '@/components/home-content';
import { localeFor } from '@/lib/config';

export const dynamic = 'force-dynamic';
export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <HomeContent locale={localeFor(locale)} />;
}
