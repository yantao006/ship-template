import { InformationPage } from '@/components/information/information-page';
import { localeFor } from '@/lib/config';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <InformationPage locale={localeFor(locale)} id="privacy" />;
}
