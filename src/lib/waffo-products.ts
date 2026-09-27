import type { Env } from './env';
import type { SitePlan } from './payments';

export type WaffoProduct = { id: string; amount: string; currency: string; billingPeriod: 'once' | 'monthly' | 'yearly' };

const periodFor = (billing: SitePlan['billing']) => billing === 'once' ? 'once' : billing === 'month' ? 'monthly' : 'yearly';

// The catalog secret is an attestation from the test-product provisioning step, not a price override.
// An absent, malformed, duplicate, or stale entry fails closed. No legacy single-product fallback.
export function productForPlan(env: Pick<Env, 'WAFFO_PRODUCTS'>, plan: SitePlan): WaffoProduct | null {
  if (!env.WAFFO_PRODUCTS) return null;
  let catalog: unknown;
  try { catalog = JSON.parse(env.WAFFO_PRODUCTS); } catch { return null; }
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) return null;
  const entries = Object.entries(catalog);
  const product = (catalog as Record<string, unknown>)[plan.id];
  if (!product || typeof product !== 'object' || Array.isArray(product)) return null;
  const candidate = product as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || !/^PROD_[A-Za-z0-9]{22}$/.test(candidate.id) ||
      candidate.amount !== plan.amount || candidate.currency !== plan.currency || candidate.billingPeriod !== periodFor(plan.billing)) return null;
  // A single Waffo product must not be mapped to different plans or periods.
  if (entries.some(([id, value]) => id !== plan.id && value && typeof value === 'object' && (value as Record<string, unknown>).id === candidate.id)) return null;
  return candidate as WaffoProduct;
}
