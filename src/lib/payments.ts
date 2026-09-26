import { grant, grantSubscriptionMonth, type DB } from './ledger';
import { WaffoPancake, verifyWebhook, type WebhookEventData } from '@waffo/pancake-ts';
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

export async function cancelUserSubscription(env: Env, userId: string, id: string) {
  const owned = await env.DB.prepare("SELECT id FROM user_subscription WHERE id=? AND user_id=? AND status='active'").bind(id, userId).first();
  if (!owned) return false;
  const client = new WaffoPancake({ merchantId: env.WAFFO_MERCHANT_ID!, privateKey: env.WAFFO_PRIVATE_KEY! });
  const result = await client.orders.cancelSubscription({ orderId: id });
  if (result.status !== 'canceling' && result.status !== 'canceled') throw new Error('Cancellation not confirmed');
  await env.DB.prepare('UPDATE user_subscription SET status=?,updated_at=? WHERE id=? AND user_id=?').bind(result.status, Date.now(), id, userId).run();
  return true;
}

export async function handlePaymentWebhook(env: Env, request: Request, now = Date.now()) {
  const body = await request.text();
  if (!env.WAFFO_CALLBACK_PUBLIC_KEY) return Response.json({ message: 'failed' }, { status: 401 });
  let settled: ReturnType<typeof readSettledPayment>;
  try { settled = readSettledPayment(body, request.headers.get('x-waffo-signature'), env.WAFFO_CALLBACK_PUBLIC_KEY); }
  catch { return Response.json({ message: 'failed' }, { status: 401 }); }
  if (settled === 'ignored') {
    try {
      const event = verifyWebhook<WebhookEventData>(body, request.headers.get('x-waffo-signature'), { publicKey: env.WAFFO_CALLBACK_PUBLIC_KEY });
      if (event.eventType === 'subscription.canceled' || event.eventType === 'subscription.canceling') {
        const userId = event.data.orderMetadata?.userId;
        if (userId && (!event.data.merchantProvidedBuyerIdentity || event.data.merchantProvidedBuyerIdentity === userId))
          await env.DB.prepare('UPDATE user_subscription SET status=?,updated_at=? WHERE id=? AND user_id=?').bind(event.eventType === 'subscription.canceled' ? 'canceled' : 'canceling',now,event.data.orderId,userId).run();
      }
    } catch { return Response.json({ message: 'failed' }); }
    return Response.json({ message: 'success' });
  }
  if (settled === 'rejected') return Response.json({ message: 'failed' });
  try {
    const outcome = await grantVerifiedPayment(env.DB, settled, site.plans, now);
    if (outcome === 'rejected') return Response.json({ message: 'failed' });
    await env.DB.prepare('INSERT OR IGNORE INTO payment_record (id,user_id,plan_id,subscription_id,billing,amount,currency,status,created_at) VALUES (?,?,?,?,?,?,?, ?,?)')
      .bind(settled.paymentId, settled.userId, settled.planId, settled.billing === 'year' ? settled.subscriptionId : null, settled.billing, settled.amount ?? planById(settled.planId)!.amount, settled.currency ?? planById(settled.planId)!.currency, 'paid', now).run();
    if (settled.billing === 'year') await env.DB.prepare(`INSERT INTO user_subscription (id,user_id,plan_id,status,period_start,period_end,updated_at) VALUES (?,?,?,'active',?,?,?) ON CONFLICT(id) DO UPDATE SET status='active',period_start=excluded.period_start,period_end=excluded.period_end,updated_at=excluded.updated_at WHERE user_id=excluded.user_id`)
      .bind(settled.subscriptionId, settled.userId, settled.planId, settled.periodStart ? Date.parse(settled.periodStart) : null, settled.periodEnd ? Date.parse(settled.periodEnd) : null, now).run();
  } catch {
    return Response.json({ message: 'failed' });
  }
  return Response.json({ message: 'success' });
}
