import { InformationPage } from '@/components/information-page';
import { localeFor } from '@/lib/config';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <InformationPage locale={localeFor(locale)} id="terms" />;
}
