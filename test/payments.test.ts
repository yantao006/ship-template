import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createSign, generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { balance } from '../src/lib/ledger';
import { grantVerifiedPayment, handlePaymentWebhook } from '../src/lib/payments';
import { createWaffoOrder } from '../src/lib/waffo';
import type { Env } from '../src/lib/env';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
const plans = [
  { id: 'pack', billing: 'once' as const, credits: 100, amount: '9.90', currency: 'USD', description: 'Credit pack' },
  { id: 'annual', billing: 'year' as const, credits: 80, amount: '79.00', currency: 'USD', description: 'Annual plan' },
];
const env = { WAFFO_API_KEY: 'api-key', WAFFO_MERCHANT_ID: 'merchant-1', WAFFO_PRIVATE_KEY: privateKey, WAFFO_PRODUCT_ID: 'kanvora-goods', WAFFO_CALLBACK_PUBLIC_KEY: publicKey } as Env;

function sign(body: string) {
  return createSign('SHA256').update(body).sign(privateKey, 'base64');
}
function notice(planId: string, orderId: string, userId = 'user-1', status = 'PAY_SUCCESS') {
  return JSON.stringify({ eventType: 'PAYMENT_NOTIFICATION', result: { orderStatus: status, acquiringOrderId: orderId, extendInfo: JSON.stringify({ userId, planId }), userInfo: { userId } } });
}

let mf: Miniflare, db: D1Database;
before(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'test-payments' } });
  db = await mf.getD1Database('DB') as unknown as D1Database;
  for (const sql of readFileSync('migrations/0001_initial.sql', 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
});
after(async () => mf?.dispose());

test('rejects a missing or tampered Waffo signature', async () => {
  const body = notice('pack', 'order-sign', 'user-sign');
  assert.equal(await (await handlePaymentWebhook({ ...env, DB: db }, new Request('https://awesomejev.link/api/webhooks/payment', { method: 'POST', body }))).json().then(r => r.message), 'failed');
  const tampered = body.replace('user-sign', 'user-evil');
  const rejected = await handlePaymentWebhook({ ...env, DB: db }, new Request('https://awesomejev.link/api/webhooks/payment', { method: 'POST', headers: { 'X-SIGNATURE': sign(body) }, body: tampered }));
  assert.equal(rejected.status, 401);
  assert.equal(await balance(db, 'user-sign'), 0);
});

test('one-time payment grants once and a replay does not add credits', async () => {
  const body = notice('pack', 'order-once', 'user-once');
  const headers = { 'X-SIGNATURE': sign(body) };
  const first = await handlePaymentWebhook({ ...env, DB: db }, new Request('https://awesomejev.link/api/webhooks/payment', { method: 'POST', headers, body }));
  const second = await handlePaymentWebhook({ ...env, DB: db }, new Request('https://awesomejev.link/api/webhooks/payment', { method: 'POST', headers, body }));
  assert.equal((await first.json()).message, 'success');
  assert.equal((await second.json()).message, 'success');
  assert.equal(await balance(db, 'user-once'), 100);
  assert.equal(await grantVerifiedPayment(db, JSON.parse(body), plans), 'replay');
});

test('annual payment grants the current month only and the same month does not grant again', async () => {
  const now = Date.UTC(2026, 8, 15);
  const body = notice('annual', 'order-year', 'user-year');
  assert.equal(await grantVerifiedPayment(db, JSON.parse(body), plans, now), 'granted');
  assert.equal(await grantVerifiedPayment(db, JSON.parse(body), plans, now), 'replay');
  assert.equal(await balance(db, 'user-year', now), 80);
  assert.equal(await balance(db, 'user-year', Date.UTC(2026, 9, 1)), 0);
  const lots = await db.prepare("SELECT granted FROM credit_lot WHERE source='subscription_month' AND user_id='user-year'").all<{ granted: number }>();
  assert.equal(lots.results.length, 1);
  assert.equal(lots.results[0].granted, 80);
});

test('create order sends the confirmed Waffo fields and returns the payment URL', async () => {
  let sent = '';
  const orderAction = JSON.stringify({ actionType: 'WEB', webUrl: 'https://checkout.waffo.com/pay/session' });
  const responseBody = JSON.stringify({ code: '0', msg: 'Success', data: { orderAction } });
  const created = await createWaffoOrder(env, {
    userId: 'user-1', userEmail: 'user@example.com', planId: 'pack', description: 'Credit pack', amount: '9.90', currency: 'USD',
    notifyUrl: 'https://awesomejev.link/api/webhooks/payment', successRedirectUrl: 'https://awesomejev.link/en/pricing', failedRedirectUrl: 'https://awesomejev.link/en/pricing', cancelRedirectUrl: 'https://awesomejev.link/en/pricing', coupon: 'SAVE10', requestedAt: '2026-09-25T00:00:00.000Z', requestId: 'a'.repeat(32),
  }, async (_url, init) => {
    sent = String(init?.body);
    return new Response(responseBody, { headers: { 'X-SIGNATURE': sign(responseBody) } });
  });
  const payload = JSON.parse(sent);
  assert.equal(created.paymentUrl, 'https://checkout.waffo.com/pay/session');
  assert.equal(payload.merchantInfo.merchantId, 'merchant-1');
  assert.equal(payload.goodsInfo.goodsId, 'kanvora-goods');
  assert.equal(payload.paymentInfo.productName, 'ONE_TIME_PAYMENT');
  assert.equal(payload.orderAmount, '9.90');
  assert.equal(payload.orderCurrency, 'USD');
  assert.deepEqual(JSON.parse(payload.extendInfo), { userId: 'user-1', planId: 'pack' });
  assert.equal(payload.userInfo.userId, 'user-1');
  assert.equal(payload.promotionInfo.promotionCode, 'SAVE10');
  assert.equal(payload.paymentInfo.productName.includes('TRIAL'), false);
  assert.equal('referral' in payload, false);
});
