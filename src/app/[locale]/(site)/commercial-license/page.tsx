import { CommercialLicense } from '@/components/pricing/commercial-license';
import { localeFor, messages, site } from '@/lib/config';
import '@/components/pricing/commercial-license.css';

export const dynamic = 'force-dynamic';
export default async function CommercialLicensePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeFor((await params).locale);
  return <CommercialLicense copy={messages[locale].accountPages} brand={site.brand} locale={locale} />;
}
