import { AccountSectionPage } from '@/components/account-pages-content';
import { localeFor } from '@/lib/config';

export const dynamic = 'force-dynamic';
export default async function CreditCenterPage({ params }: { params: Promise<{ locale: string }> }) {
  return <AccountSectionPage locale={localeFor((await params).locale)} section="creditCenter" />;
}
