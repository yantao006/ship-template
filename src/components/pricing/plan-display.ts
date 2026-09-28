// Presentation-only plan arithmetic shared by the pricing page and purchase dialog.
export type BillingPeriod = 'month' | 'year' | 'once';
export type DisplayPlan = { id: string; tier?: string; billing: BillingPeriod; credits: number; amount: string; checkoutEnabled: boolean };
export type PlanFeature = string | { yearly: string };
export type FeatureCopy = { planFeatures: Record<string, PlanFeature[]>; packFeatures: string[] };

export const money = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
export const count = (value: number) => value.toLocaleString('en-US');

export function pricingFeatureLines(plan: Pick<DisplayPlan, 'id' | 'tier' | 'credits'>, mode: BillingPeriod, copy: FeatureCopy) {
  if (mode === 'once') return copy.packFeatures.map(line => line.replace('{count}', count(plan.credits)));
  const features = copy.planFeatures[plan.tier ?? plan.id];
  if (!features) throw new Error(`Missing pricing features for ${plan.id}`);
  return features.flatMap(feature => typeof feature === 'string' ? [feature] : mode === 'year' ? [feature.yearly] : []);
}

export function planDisplay(plan: DisplayPlan, plans: DisplayPlan[], multiple = 1) {
  const factor = plan.tier === 'max' ? multiple : 1;
  const monthly = plans.find(item => item.tier === plan.tier && item.billing === 'month');
  const price = Number(plan.amount) * factor / (plan.billing === 'year' ? 12 : 1);
  const previousPrice = plan.billing === 'year' && monthly ? Number(monthly.amount) * factor : undefined;
  return {
    factor, price, total: Number(plan.amount) * factor, previousPrice,
    discount: previousPrice ? Math.round((1 - price / previousPrice) * 100) : 0,
    credits: plan.credits * factor,
    canCheckout: plan.checkoutEnabled && factor === 1,
  };
}

export function hasAnnualOffer(plans: DisplayPlan[]) {
  return plans.some(plan => plan.billing === 'year' && planDisplay(plan, plans).discount >= 50);
}
