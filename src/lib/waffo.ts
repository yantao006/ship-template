import { WaffoPancake, verifyWebhook, type AuthenticatedCheckoutParams, type WebhookEventData } from '@waffo/pancake-ts';
import type { Env } from './env';

export type CheckoutOrder = {
  userId: string;
  userEmail: string;
  planId: string;
  billing: 'once' | 'year';
  description: string;
  amount: string;
  currency: string;
  notifyUrl: string;
  successRedirectUrl: string;
  failedRedirectUrl: string;
  cancelRedirectUrl: string;
  coupon?: string;
  requestedAt?: string;
  requestId?: string;
};

export type SettledPayment = {
  userId: string;
  planId: string;
  paymentId: string;
  subscriptionId: string;
  billing: 'once' | 'year';
  amount?: string;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
};

const checkoutSecrets = ['WAFFO_MERCHANT_ID', 'WAFFO_PRIVATE_KEY', 'WAFFO_PRODUCT_ID', 'WAFFO_CALLBACK_PUBLIC_KEY'] as const;

function requireSecrets(env: Env) {
  const missing = checkoutSecrets.find(name => !env[name]);
  if (missing) throw new Error(`${missing} missing`);
}

export async function createWaffoOrder(env: Env, order: CheckoutOrder, fetchImpl: typeof fetch = fetch) {
  requireSecrets(env);
  const client = new WaffoPancake({
    merchantId: env.WAFFO_MERCHANT_ID!,
    privateKey: env.WAFFO_PRIVATE_KEY!,
    fetch: fetchImpl,
  });
  const metadata: Record<string, string> = { userId: order.userId, planId: order.planId };
  if (order.coupon) metadata.coupon = order.coupon;
  const params: AuthenticatedCheckoutParams & { productType: 'onetime' | 'subscription' } = {
    productId: env.WAFFO_PRODUCT_ID!,
    productType: order.billing === 'year' ? 'subscription' : 'onetime',
    currency: order.currency,
    buyerIdentity: order.userId,
    buyerEmail: order.userEmail,
    withTrial: false,
    successUrl: order.successRedirectUrl,
    orderMerchantExternalId: (order.requestId ?? crypto.randomUUID()).slice(0, 128),
    metadata,
  };
  const created = await client.checkout.authenticated.create(params);
  return { paymentUrl: created.checkoutUrl };
}

export function readSettledPayment(body: string, signature: string | null, publicKey: string): SettledPayment | 'ignored' | 'rejected' {
  const event = verifyWebhook<WebhookEventData>(body, signature, { publicKey });
  if (event.eventType !== 'order.completed' && event.eventType !== 'subscription.activated' && event.eventType !== 'subscription.payment_succeeded') return 'ignored';
  const data = event.data;
  const userId = data.orderMetadata?.userId;
  const planId = data.orderMetadata?.planId;
  const echoed = data.merchantProvidedBuyerIdentity;
  if (!userId || !planId || (echoed && echoed !== userId)) return 'rejected';
  const paymentId = data.paymentId || event.eventId;
  if (!paymentId || !data.orderId) return 'rejected';
  if (data.paymentStatus && data.paymentStatus !== 'succeeded') return 'rejected';
  if (event.eventType === 'order.completed') {
    if (data.orderStatus && data.orderStatus !== 'completed') return 'rejected';
    return { userId, planId, paymentId, subscriptionId: data.orderId, billing: 'once', amount: data.amount, currency: data.currency };
  }
  if (data.orderStatus && data.orderStatus !== 'active') return 'rejected';
  return { userId, planId, paymentId, subscriptionId: data.orderId, billing: 'year', amount: data.amount, currency: data.currency, periodStart: data.currentPeriodStart, periodEnd: data.currentPeriodEnd };
}
