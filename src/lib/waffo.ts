import { createSign, createVerify } from 'node:crypto';
import type { Env } from './env';

const ORDER_URL = 'https://api.waffo.com/api/v1/order/create';

export type CheckoutOrder = {
  userId: string;
  userEmail: string;
  planId: string;
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

function pem(value: string) {
  return value.replaceAll('\\n', '\n');
}

export function verifyWaffoSignature(body: string, signature: string | null, publicKeyPem: string) {
  if (!signature || !publicKeyPem) return false;
  try {
    return createVerify('SHA256').update(body).verify(pem(publicKeyPem), signature, 'base64');
  } catch {
    return false;
  }
}

function signBody(body: string, privateKeyPem: string) {
  return createSign('SHA256').update(body).sign(pem(privateKeyPem), 'base64');
}

function paymentUrl(orderAction: string) {
  const action = JSON.parse(orderAction) as { actionType?: string; webUrl?: string; deeplinkUrl?: string };
  const url = action.actionType === 'DEEPLINK' ? action.deeplinkUrl : action.webUrl;
  if (!url) throw new Error(action.actionType === 'DEEPLINK' ? 'orderAction.deeplinkUrl missing' : 'orderAction.webUrl missing');
  return url;
}

export async function createWaffoOrder(env: Env, order: CheckoutOrder, fetchImpl: typeof fetch = fetch) {
  const missing = ['WAFFO_API_KEY', 'WAFFO_MERCHANT_ID', 'WAFFO_PRIVATE_KEY', 'WAFFO_PRODUCT_ID', 'WAFFO_CALLBACK_PUBLIC_KEY'].filter(name => !env[name as keyof Env]);
  if (missing.length) throw new Error(`${missing[0]} missing`);
  const paymentRequestId = order.requestId ?? crypto.randomUUID().replaceAll('-', '');
  const extendInfo = JSON.stringify({ userId: order.userId, planId: order.planId });
  if (extendInfo.length > 128) throw new Error('extendInfo exceeds 128');
  const payload: Record<string, unknown> = {
    paymentRequestId,
    merchantOrderId: paymentRequestId,
    orderCurrency: order.currency,
    orderAmount: order.amount,
    orderDescription: order.description,
    orderRequestedAt: order.requestedAt ?? new Date().toISOString(),
    notifyUrl: order.notifyUrl,
    successRedirectUrl: order.successRedirectUrl,
    failedRedirectUrl: order.failedRedirectUrl,
    cancelRedirectUrl: order.cancelRedirectUrl,
    extendInfo,
    merchantInfo: { merchantId: env.WAFFO_MERCHANT_ID },
    userInfo: { userId: order.userId, userEmail: order.userEmail, userTerminal: 'WEB' },
    goodsInfo: { goodsId: env.WAFFO_PRODUCT_ID, goodsName: order.description.slice(0, 64), goodsUrl: order.successRedirectUrl.slice(0, 128) },
    paymentInfo: { productName: 'ONE_TIME_PAYMENT' },
  };
  if (order.coupon) payload.promotionInfo = { promotionCode: order.coupon };
  const body = JSON.stringify(payload);
  const response = await fetchImpl(ORDER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': env.WAFFO_API_KEY!,
      'X-SIGNATURE': signBody(body, env.WAFFO_PRIVATE_KEY!),
      'X-API-VERSION': '1.0.0',
    },
    body,
  });
  const text = await response.text();
  if (!verifyWaffoSignature(text, response.headers.get('x-signature'), env.WAFFO_CALLBACK_PUBLIC_KEY!)) throw new Error('Waffo response signature rejected');
  const parsed = JSON.parse(text) as { code?: string; data?: { orderAction?: string } };
  if (parsed.code !== '0' || !parsed.data?.orderAction) throw new Error('Waffo order was not created');
  return { paymentUrl: paymentUrl(parsed.data.orderAction) };
}
