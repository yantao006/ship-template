import { headers } from 'next/headers';
import { readSession } from '@/lib/request-context';
import { site, messages } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { planCopy } from '@/lib/plan-copy';
import { MarketingNav } from './marketing-nav';
import { PricingCheckout } from './pricing-checkout';

export async function PricingContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const env = workerEnv();
  const requestHeaders = await headers();
  const session = await readSession(env, requestHeaders);
  const copy = messages[locale];
  const cards = site.plans.map(plan => ({
    id: plan.id,
    billing: plan.billing,
    credits: plan.credits,
    amount: plan.amount,
    currency: plan.currency,
    ...planCopy(locale, plan.id),
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
