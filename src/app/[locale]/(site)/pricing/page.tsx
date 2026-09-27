import { PricingContent } from '@/components/pricing-content';
import { localeFor } from '@/lib/config';

export const dynamic = 'force-dynamic';
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PricingContent locale={localeFor(locale)} />;
}
