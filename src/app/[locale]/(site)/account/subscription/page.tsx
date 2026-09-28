import { AccountPagesContent } from '@/components/account-pages-content';
import { localeFor } from '@/lib/config';

export const dynamic = 'force-dynamic';
export default async function SubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  return <AccountPagesContent locale={localeFor((await params).locale)} section="subscription" />;
}
