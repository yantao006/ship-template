import { site, messages, videoTool } from '@/lib/config';
import { planCopy } from '@/lib/plan-copy';
import { PricingCheckout } from './pricing-checkout';
import './pricing.css';

export async function PricingContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const copy = messages[locale];
  const plans = site.plans.map(plan => ({
    ...plan,
    ...planCopy(locale, plan.id),
    checkoutEnabled: !!site.checkoutPlanId && site.checkoutPlanId === plan.id && plan.billing !== 'month',
  }));
  const models = videoTool.models.map(model => ({
    id: model.id,
    name: (copy.videoTool.models as Record<string, string>)[model.id] ?? model.id,
    icon: model.icon,
    kind: model.workflowIds.includes('text-video') ? 'video' as const : 'image' as const,
    cost: 'costByDuration' in model && model.costByDuration ? Math.min(...Object.values(model.costByDuration)) : null,
  }));
  return <div className="site-shell pricing-experience">
    <PricingCheckout locale={locale} plans={plans} models={models} brand={site.brand} copy={copy.pricing} />
  </div>;
}
