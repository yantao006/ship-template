import { AccountSectionPage } from '@/components/account/account-pages-content';
import { localeFor } from '@/lib/config';

export const dynamic = 'force-dynamic';
export default async function SubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  return <AccountSectionPage locale={localeFor((await params).locale)} section="subscription" />;
}
