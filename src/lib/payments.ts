import { grant, grantSubscriptionMonth, type DB } from './ledger';
import { site } from './config';
import type { Env } from './env';
import { createWaffoOrder, readSettledPayment, type CheckoutOrder, type SettledPayment } from './waffo';

export type SitePlan = { id: string; billing: 'once' | 'year'; credits: number; amount: string; currency: string; description: string };

export function planById(id: string, plans: SitePlan[] = site.plans) {
  return plans.find(plan => plan.id === id);
}

export async function startCheckout(env: Env, order: CheckoutOrder, fetchImpl?: typeof fetch) {
  return createWaffoOrder(env, order, fetchImpl);
}

export async function grantVerifiedPayment(db: DB, payment: SettledPayment, plans: SitePlan[] = site.plans, now = Date.now()) {
  const plan = planById(payment.planId, plans);
  if (!plan || plan.billing !== payment.billing) return 'rejected' as const;
  if (plan.billing === 'once') {
    const created = await grant(db, { userId: payment.userId, source: 'payment', sourceId: payment.paymentId, credits: plan.credits, now });
    return created ? 'granted' as const : 'replay' as const;
  }
  const date = new Date(now);
  const created = await grantSubscriptionMonth(db, {
    userId: payment.userId,
    subscriptionId: payment.subscriptionId,
    yearStart: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    monthIndex: 0,
    credits: plan.credits,
  });
  return created ? 'granted' as const : 'replay' as const;
}

export async function handlePaymentWebhook(env: Env, request: Request, now = Date.now()) {
  const body = await request.text();
  if (!env.WAFFO_CALLBACK_PUBLIC_KEY) return Response.json({ message: 'failed' }, { status: 401 });
  let settled: ReturnType<typeof readSettledPayment>;
  try { settled = readSettledPayment(body, request.headers.get('x-waffo-signature'), env.WAFFO_CALLBACK_PUBLIC_KEY); }
  catch { return Response.json({ message: 'failed' }, { status: 401 }); }
  if (settled === 'ignored') return Response.json({ message: 'success' });
  if (settled === 'rejected') return Response.json({ message: 'failed' });
  try {
    const outcome = await grantVerifiedPayment(env.DB, settled, site.plans, now);
    if (outcome === 'rejected') return Response.json({ message: 'failed' });
  } catch {
    return Response.json({ message: 'failed' });
  }
  return Response.json({ message: 'success' });
}
