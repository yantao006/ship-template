import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createSign, generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { balance } from '../src/lib/ledger';
import { grantVerifiedPayment, handlePaymentWebhook } from '../src/lib/payments';
import { createWaffoOrder, readSettledPayment } from '../src/lib/waffo';
import type { Env } from '../src/lib/env';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
const productId = 'PROD_kanvoraGoods0000000000';
const plans = [
  { id: 'pack', billing: 'once' as const, credits: 100, amount: '9.90', currency: 'USD', description: 'Credit pack' },
  { id: 'annual', billing: 'year' as const, credits: 80, amount: '79.00', currency: 'USD', description: 'Annual plan' },
];
const env = { WAFFO_MERCHANT_ID: 'MER_merchant00000000000001', WAFFO_PRIVATE_KEY: privateKey, WAFFO_PRODUCT_ID: productId, WAFFO_CALLBACK_PUBLIC_KEY: publicKey } as Env;

function sign(body: string, at = Date.now()) {
  const signature = createSign('RSA-SHA256').update(`${at}.${body}`).sign(privateKey, 'base64');
  return `t=${at},v1=${signature}`;
}
function event(eventType: string, planId: string, paymentId: string, userId = 'user-1', orderId = paymentId) {
  const billing = planId === 'annual' ? 'year' : 'once';
  return JSON.stringify({
    id: `delivery-${paymentId}`,
    timestamp: '2026-09-25T00:00:00.000Z',
    eventType,
    eventId: paymentId,
    storeId: 'STO_kanvoraStore0000000000',
    mode: 'prod',
    data: {
      orderId,
      orderStatus: billing === 'year' ? 'active' : 'completed',
      buyerEmail: 'user@example.com',
      merchantProvidedBuyerIdentity: userId,
      currency: 'USD',
      amount: billing === 'year' ? '79.00' : '9.90',
      taxAmount: '0.00',
      productName: billing === 'year' ? 'Annual plan' : 'Credit pack',
      paymentId,
      paymentStatus: 'succeeded',
      orderMetadata: { userId, planId },
    },
  });
}
function webhook(body: string, signature = sign(body)) {
  return new Request('https://awesomejev.link/api/webhooks/payment', { method: 'POST', headers: signature ? { 'X-Waffo-Signature': signature } : {}, body });
}

let mf: Miniflare, db: D1Database;
before(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'test-payments' } });
  db = await mf.getD1Database('DB') as unknown as D1Database;
  for (const sql of readFileSync('migrations/0001_initial.sql', 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
});
after(async () => mf?.dispose());

test('rejects a missing or tampered Pancake signature', async () => {
  const body = event('order.completed', 'pack', 'pay-sign', 'user-sign');
  assert.equal((await handlePaymentWebhook({ ...env, DB: db }, webhook(body, ''))).status, 401);
  const tampered = body.replace('user-sign', 'user-evil');
  const rejected = await handlePaymentWebhook({ ...env, DB: db }, webhook(tampered, sign(body)));
  assert.equal(rejected.status, 401);
  assert.equal(await balance(db, 'user-sign'), 0);
  const settled = readSettledPayment(body, sign(body), publicKey);
  assert.equal(typeof settled === 'object' && settled.userId, 'user-sign');
});

test('one-time payment grants once and a replay does not add credits', async () => {
  const body = event('order.completed', 'pack', 'pay-once', 'user-once');
  const first = await handlePaymentWebhook({ ...env, DB: db }, webhook(body));
  const second = await handlePaymentWebhook({ ...env, DB: db }, webhook(body));
  assert.equal((await first.json()).message, 'success');
  assert.equal((await second.json()).message, 'success');
  assert.equal(await balance(db, 'user-once'), 100);
  const settled = readSettledPayment(body, sign(body), publicKey);
  assert.equal(settled === 'ignored' || settled === 'rejected', false);
  if (settled === 'ignored' || settled === 'rejected') return;
  assert.equal(await grantVerifiedPayment(db, settled, plans), 'replay');
});

test('annual payment grants the current month only and the same month does not grant again', async () => {
  const now = Date.UTC(2026, 8, 15);
  const body = event('subscription.payment_succeeded', 'annual', 'pay-year', 'user-year', 'order-year');
  const renewed = event('subscription.activated', 'annual', 'pay-year-2', 'user-year', 'order-year');
  const settled = readSettledPayment(body, sign(body), publicKey);
  const again = readSettledPayment(renewed, sign(renewed), publicKey);
  if (settled === 'ignored' || settled === 'rejected' || again === 'ignored' || again === 'rejected') throw new Error('subscription event rejected');
  assert.equal(await grantVerifiedPayment(db, settled, plans, now), 'granted');
  assert.equal(await grantVerifiedPayment(db, settled, plans, now), 'replay');
  assert.equal(await grantVerifiedPayment(db, again, plans, now), 'replay');
  assert.equal(await balance(db, 'user-year', now), 80);
  assert.equal(await balance(db, 'user-year', Date.UTC(2026, 9, 1)), 0);
  const lots = await db.prepare("SELECT granted FROM credit_lot WHERE source='subscription_month' AND user_id='user-year'").all<{ granted: number }>();
  assert.equal(lots.results.length, 1);
  assert.equal(lots.results[0].granted, 80);
});

test('create order calls Pancake checkout for the existing product and returns the payment URL', async () => {
  const calls: { url: string; body: string; merchant: string }[] = [];
  const created = await createWaffoOrder(env, {
    userId: 'user-1', userEmail: 'user@example.com', planId: 'pack', billing: 'once', description: 'Credit pack', amount: '9.90', currency: 'USD',
    notifyUrl: 'https://awesomejev.link/api/webhooks/payment', successRedirectUrl: 'https://awesomejev.link/en/pricing', failedRedirectUrl: 'https://awesomejev.link/en/pricing', cancelRedirectUrl: 'https://awesomejev.link/en/pricing', coupon: 'SAVE10', requestId: 'checkout-1',
  }, async (url, init) => {
    const headers = new Headers(init?.headers);
    calls.push({ url: String(url), body: String(init?.body), merchant: headers.get('x-merchant-id') ?? '' });
    if (String(url).endsWith('/v1/actions/auth/issue-session-token')) {
      return Response.json({ data: { token: 'session-token', expiresAt: '2026-09-25T01:00:00.000Z' } });
    }
    return Response.json({ data: { sessionId: 'session-1', checkoutUrl: 'https://checkout.waffo.com/pay/session', expiresAt: '2026-09-25T01:00:00.000Z' } });
  });
  assert.equal(created.paymentUrl, 'https://checkout.waffo.com/pay/session#token=session-token');
  assert.equal(calls.some(call => call.url === 'https://api.waffo.com/api/v1/order/create'), false);
  assert.deepEqual(calls.map(call => call.url).sort(), [
    'https://api.waffo.ai/v1/actions/auth/issue-session-token',
    'https://api.waffo.ai/v1/actions/checkout/create-session',
  ]);
  const session = calls.find(call => call.url.endsWith('/create-session'));
  const payload = JSON.parse(session?.body ?? '{}');
  assert.equal(session?.merchant, 'MER_merchant00000000000001');
  assert.equal(payload.productId, productId);
  assert.equal(payload.productType, 'onetime');
  assert.equal(payload.currency, 'USD');
  assert.equal(payload.buyerEmail, 'user@example.com');
  assert.equal(payload.withTrial, false);
  assert.deepEqual(payload.metadata, { userId: 'user-1', planId: 'pack', coupon: 'SAVE10' });
  assert.equal('referral' in payload, false);
});
