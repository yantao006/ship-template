import { grant, grantSubscriptionMonth, type DB } from './ledger';
import { site } from './config';
import type { Env } from './env';
import { createWaffoOrder, verifyWaffoSignature, type CheckoutOrder } from './waffo';

export type SitePlan = { id: string; billing: 'once' | 'year'; credits: number; amount: string; currency: string; description: string };

type PaymentNotice = {
  eventType?: string;
  result?: {
    orderStatus?: string;
    acquiringOrderId?: string;
    extendInfo?: string;
    userInfo?: { userId?: string };
  };
};

export function planById(id: string, plans: SitePlan[] = site.plans) {
  return plans.find(plan => plan.id === id);
}

export async function startCheckout(env: Env, order: CheckoutOrder, fetchImpl?: typeof fetch) {
  return createWaffoOrder(env, order, fetchImpl);
}

export async function grantVerifiedPayment(db: DB, notice: PaymentNotice, plans: SitePlan[] = site.plans, now = Date.now()) {
  if (notice.eventType !== 'PAYMENT_NOTIFICATION') return 'ignored' as const;
  if (notice.result?.orderStatus !== 'PAY_SUCCESS') return 'ignored' as const;
  let meta: { userId?: string; planId?: string };
  try { meta = JSON.parse(notice.result.extendInfo ?? '') as { userId?: string; planId?: string }; }
  catch { return 'rejected' as const; }
  const userId = meta.userId;
  const echoed = notice.result.userInfo?.userId;
  if (!userId || (echoed && echoed !== userId)) return 'rejected' as const;
  const plan = planById(meta.planId ?? '', plans);
  const paymentId = notice.result.acquiringOrderId;
  if (!plan || !paymentId) return 'rejected' as const;
  if (plan.billing === 'once') {
    const created = await grant(db, { userId, source: 'payment', sourceId: paymentId, credits: plan.credits, now });
    return created ? 'granted' as const : 'replay' as const;
  }
  const date = new Date(now);
  const created = await grantSubscriptionMonth(db, {
    userId,
    subscriptionId: paymentId,
    yearStart: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    monthIndex: 0,
    credits: plan.credits,
  });
  return created ? 'granted' as const : 'replay' as const;
}

export async function handlePaymentWebhook(env: Env, request: Request, now = Date.now()) {
  const body = await request.text();
  if (!env.WAFFO_CALLBACK_PUBLIC_KEY || !verifyWaffoSignature(body, request.headers.get('x-signature'), env.WAFFO_CALLBACK_PUBLIC_KEY)) {
    return Response.json({ message: 'failed' }, { status: 401 });
  }
  let notice: PaymentNotice;
  try { notice = JSON.parse(body) as PaymentNotice; }
  catch { return Response.json({ message: 'failed' }); }
  try {
    const outcome = await grantVerifiedPayment(env.DB, notice, site.plans, now);
    if (outcome === 'rejected') return Response.json({ message: 'failed' });
  } catch {
    return Response.json({ message: 'failed' });
  }
  return Response.json({ message: 'success' });
}
