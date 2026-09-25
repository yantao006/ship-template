import { headers } from 'next/headers';
import { createAuth } from '@/lib/auth';
import { site, messages } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { MarketingNav } from './marketing-nav';
import { PricingCheckout } from './pricing-checkout';

export async function PricingContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const env = workerEnv();
  const requestHeaders = await headers();
  const session = await createAuth(env, requestHeaders.get('host')?.split(':')[0]).api.getSession({ headers: requestHeaders });
  const copy = messages[locale];
  const cards = site.plans.map(plan => ({
    id: plan.id,
    billing: plan.billing,
    credits: plan.credits,
    amount: plan.amount,
    currency: plan.currency,
    name: plan.id === 'annual' ? copy.pricing.annualName : copy.pricing.packName,
    detail: plan.id === 'annual' ? copy.pricing.annualDetail : copy.pricing.packDetail,
  }));
  return <div className="site-shell">
    <MarketingNav locale={locale} userName={session?.user.name} />
    <section className="pricing" aria-labelledby="pricing-title">
      <h1 id="pricing-title">{copy.pricing.title}</h1>
      <p className="pricing-lead">{copy.pricing.lead}</p>
      <PricingCheckout locale={locale} plans={cards} copy={copy.pricing} />
    </section>
  </div>;
}
