import { WaffoPancake, verifyWebhook, type AuthenticatedCheckoutParams, type WebhookEventData } from '@waffo/pancake-ts';
import type { Env } from './env';
import type { WaffoProduct } from './waffo-products';

export type CheckoutOrder = {
  userId: string;
  userEmail: string;
  planId: string;
  billing: 'once' | 'month' | 'year';
  description: string;
  amount: string;
  currency: string;
  notifyUrl: string;
  successRedirectUrl: string;
  failedRedirectUrl: string;
  cancelRedirectUrl: string;
  requestedAt?: string;
  requestId?: string;
};

export type SettledPayment = {
  userId: string;
  planId: string;
  paymentId: string;
  subscriptionId: string;
  billing: 'once' | 'month' | 'year';
  amount: string;
  currency: string;
  total?: string;
  billingPeriod?: string;
  productPlanId?: string;
  mode: string;
};

const checkoutSecrets = ['WAFFO_MERCHANT_ID', 'WAFFO_PRIVATE_KEY', 'WAFFO_CALLBACK_PUBLIC_KEY'] as const;

function requireSecrets(env: Env) {
  const missing = checkoutSecrets.find(name => !env[name]);
  if (missing) throw new Error(`${missing} missing`);
}

export async function createWaffoOrder(env: Env, order: CheckoutOrder, product: WaffoProduct, fetchImpl: typeof fetch = fetch) {
  requireSecrets(env);
  const period = order.billing === 'once' ? 'once' : order.billing === 'month' ? 'monthly' : 'yearly';
  if (!product || product.amount !== order.amount || product.currency !== order.currency || product.billingPeriod !== period) {
    throw new Error('Waffo product price or billing mismatch');
  }
  const client = new WaffoPancake({
    merchantId: env.WAFFO_MERCHANT_ID!,
    privateKey: env.WAFFO_PRIVATE_KEY!,
    fetch: fetchImpl,
  });
  const metadata: Record<string, string> = { userId: order.userId, planId: order.planId, billing: order.billing };
  const params: AuthenticatedCheckoutParams & { productType: 'onetime' | 'subscription' } = {
    productId: product.id,
    productType: order.billing === 'once' ? 'onetime' : 'subscription',
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
  // Activated is a subscription state event, not the payment event. Waffo sends a
  // separate payment_succeeded for both the first charge and each renewal.
  if (event.eventType !== 'order.completed' && event.eventType !== 'subscription.payment_succeeded') return 'ignored';
  const data = event.data as WebhookEventData & { chargedAmount?: string; listPrice?: { total?: string } };
  const userId = data.orderMetadata?.userId;
  const planId = data.orderMetadata?.planId;
  const billing = data.orderMetadata?.billing;
  const echoed = data.merchantProvidedBuyerIdentity;
  if (!userId || !planId || !data.paymentId || !data.orderId || !data.chargedAmount ||
      data.paymentStatus !== 'succeeded' || (echoed && echoed !== userId) ||
      (data.amount && data.amount !== data.chargedAmount)) return 'rejected';
  if (event.eventType === 'order.completed') {
    if (billing !== 'once' || data.orderStatus !== 'completed') return 'rejected';
    return { userId, planId, paymentId: data.paymentId, subscriptionId: data.orderId, billing, amount: data.chargedAmount,
      currency: data.currency, total: data.listPrice?.total ?? data.total, productPlanId: data.productMetadata?.planId, mode: event.mode };
  }
  // A subscription.payment_succeeded event is payment-only: Waffo deliberately omits
  // orderStatus and billingPeriod. The checkout's signed order metadata binds the period.
  if (billing !== 'month' && billing !== 'year') return 'rejected';
  const period = billing === 'month' ? 'monthly' : 'yearly';
  if (data.billingPeriod && data.billingPeriod !== period) return 'rejected';
  return { userId, planId, paymentId: data.paymentId, subscriptionId: data.orderId, billing, amount: data.chargedAmount,
    currency: data.currency, total: data.listPrice?.total ?? data.total, billingPeriod: period,
    productPlanId: data.productMetadata?.planId, mode: event.mode };
}
