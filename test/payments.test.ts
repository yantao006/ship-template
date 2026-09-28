import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createSign, generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { balance } from '../src/lib/ledger';
import { grantVerifiedPayment, handlePaymentWebhook, startCheckout } from '../src/lib/payments';
import site from '../site/site.config';
import { productForPlan, type WaffoProduct } from '../src/lib/waffo-products';
import { createWaffoOrder, readSettledPayment } from '../src/lib/waffo';
import type { Env } from '../src/lib/env';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
const catalog = Object.fromEntries(site.plans.map((plan, index) => [plan.id, {
  id: `PROD_${String(index).padStart(22, '0')}`, amount: plan.amount, currency: plan.currency,
  billingPeriod: plan.billing === 'once' ? 'once' : plan.billing === 'month' ? 'monthly' : 'yearly',
}])) as Record<string, WaffoProduct>;
const productId = catalog.starter.id;
const env = { WAFFO_MERCHANT_ID: 'MER_merchant00000000000001', WAFFO_PRIVATE_KEY: privateKey, WAFFO_PRODUCTS: JSON.stringify(catalog), WAFFO_CALLBACK_PUBLIC_KEY: publicKey } as Env;

function sign(body: string, at = Date.now()) {
  const signature = createSign('RSA-SHA256').update(`${at}.${body}`).sign(privateKey, 'base64');
  return `t=${at},v1=${signature}`;
}
function event(eventType: string, planId: string, paymentId: string, userId = 'user-1', orderId = paymentId) {
  const plan = site.plans.find(item => item.id === planId)!;
  const billing = plan.billing;
  return JSON.stringify({
    id: `delivery-${paymentId}`,
    timestamp: '2026-09-25T00:00:00.000Z',
    eventType,
    eventId: paymentId,
    storeId: `STO_${'0'.repeat(22)}`,
    mode: 'test',
    data: {
      orderId,
      ...(billing === 'once' ? { orderStatus: 'completed' } : {}),
      buyerEmail: 'user@example.com',
      merchantProvidedBuyerIdentity: userId,
      currency: 'USD',
      amount: plan.amount,
      chargedAmount: plan.amount,
      listPrice: { total: plan.amount, subtotal: plan.amount, taxAmount: '0.00' },
      taxAmount: '0.00',
      productName: plan.description,
      paymentId,
      paymentStatus: 'succeeded',
      orderMetadata: { userId, planId, billing },
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
  for (const id of ['user-renewal', 'user-real-pack', 'user-real-year', 'user-real-month']) {
    await db.prepare('INSERT INTO user(id,name,email,created_at,updated_at) VALUES (?,?,?,?,?)').bind(id, id, `${id}@example.com`, 1, 1).run();
  }
});
after(async () => mf?.dispose());

test('rejects a missing or tampered Pancake signature', async () => {
  const body = event('order.completed', 'starter', 'pay-sign', 'user-sign');
  assert.equal((await handlePaymentWebhook({ ...env, DB: db }, webhook(body, ''))).status, 401);
  const tampered = body.replace('user-sign', 'user-evil');
  const rejected = await handlePaymentWebhook({ ...env, DB: db }, webhook(tampered, sign(body)));
  assert.equal(rejected.status, 401);
  assert.equal(await balance(db, 'user-sign'), 0);
  const settled = readSettledPayment(body, sign(body), publicKey);
  assert.equal(typeof settled === 'object' && settled.userId, 'user-sign');
});

test('one-time grant is idempotent and unmatched products cannot grant through the live webhook', async () => {
  const body = event('order.completed', 'starter', 'pay-once', 'user-once');
  const rejected = await handlePaymentWebhook({ ...env, WAFFO_PRODUCTS: undefined, DB: db }, webhook(body));
  assert.equal((await rejected.json()).message, 'failed');
  assert.equal(await balance(db, 'user-once'), 0);
  const settled = readSettledPayment(body, sign(body), publicKey);
  assert.equal(settled === 'ignored' || settled === 'rejected', false);
  if (settled === 'ignored' || settled === 'rejected') return;
  assert.equal(await grantVerifiedPayment(db, settled), 'granted');
  assert.equal(await grantVerifiedPayment(db, settled), 'replay');
  assert.equal(await balance(db, 'user-once'), site.plans.find(plan => plan.id === 'starter')!.credits);
});

test('annual payment grants the current month only and the same month does not grant again', async () => {
  const now = Date.UTC(2026, 8, 15);
  const body = event('subscription.payment_succeeded', 'lite-year', 'pay-year', 'user-year', 'order-year');
  const renewed = event('subscription.payment_succeeded', 'lite-year', 'pay-year-2', 'user-year', 'order-year');
  const settled = readSettledPayment(body, sign(body), publicKey);
  const again = readSettledPayment(renewed, sign(renewed), publicKey);
  if (settled === 'ignored' || settled === 'rejected' || again === 'ignored' || again === 'rejected') throw new Error('subscription event rejected');
  assert.equal(await grantVerifiedPayment(db, settled, site.plans, now), 'granted');
  assert.equal(await grantVerifiedPayment(db, settled, site.plans, now), 'replay');
  assert.equal(await grantVerifiedPayment(db, again, site.plans, now), 'replay');
  assert.equal(await balance(db, 'user-year', now), site.plans.find(plan => plan.id === 'lite-year')!.credits);
  assert.equal(await balance(db, 'user-year', Date.UTC(2026, 9, 1)), 0);
  const lots = await db.prepare("SELECT granted FROM credit_lot WHERE source='subscription_month' AND user_id='user-year'").all<{ granted: number }>();
  assert.equal(lots.results.length, 1);
  assert.equal(lots.results[0].granted, site.plans.find(plan => plan.id === 'lite-year')!.credits);
});

test('subscription activation alone cannot grant without its separate settled payment', async () => {
  const body = event('subscription.activated', 'lite-month', 'pay-activation-only', 'user-activation');
  assert.equal(readSettledPayment(body, sign(body), publicKey), 'ignored');
  assert.equal((await (await handlePaymentWebhook({ ...env, DB: db }, webhook(body))).json()).message, 'success');
  assert.equal(await balance(db, 'user-activation'), 0);
});

test('a paid monthly renewal grants the next month once, not extra credits in the previous month', async () => {
  const september = Date.UTC(2026, 8, 15);
  const october = Date.UTC(2026, 9, 15);
  const first = event('subscription.payment_succeeded', 'standard-month', 'pay-month-1', 'user-renewal', 'order-renewal');
  const next = event('subscription.payment_succeeded', 'standard-month', 'pay-month-2', 'user-renewal', 'order-renewal');
  for (const [body, now] of [[first, september], [next, october], [next, october]] as const) {
    assert.equal((await (await handlePaymentWebhook({ ...env, DB: db }, webhook(body), now)).json()).message, 'success');
  }
  const lots = await db.prepare("SELECT granted FROM credit_lot WHERE source='subscription_month' AND user_id='user-renewal'").all<{ granted: number }>();
  assert.deepEqual(lots.results.map(lot => lot.granted), [1500, 1500]);
  assert.equal(await balance(db, 'user-renewal', october), 1500);
});

test('a delayed signed callback for a deleted account is acknowledged without restoring credits', async () => {
  const body = event('order.completed', 'starter', 'pay-deleted', 'deleted-user');
  assert.equal((await (await handlePaymentWebhook({ ...env, DB: db }, webhook(body))).json()).message, 'success');
  assert.equal(await balance(db, 'deleted-user'), 0);
});

test('test catalog matches every displayed price, period and unique product', () => {
  for (const plan of site.plans) {
    assert.deepEqual(productForPlan(env, plan), catalog[plan.id]);
    assert.equal(productForPlan({ WAFFO_PRODUCTS: JSON.stringify({ [plan.id]: { ...catalog[plan.id], amount: '0.01' } }) }, plan), null);
    assert.deepEqual(productForPlan({ WAFFO_PRODUCTS: JSON.stringify({ [plan.id]: { ...catalog[plan.id], billingPeriod: 'yearly' } }) },
      plan), plan.billing === 'year' ? catalog[plan.id] : null);
  }
  assert.equal(productForPlan({ WAFFO_PRODUCTS: '{' }, site.plans[0]), null);
  const duplicate = { ...catalog, starter: { ...catalog.starter, id: catalog.value.id } };
  assert.equal(productForPlan({ WAFFO_PRODUCTS: JSON.stringify(duplicate) }, site.plans.find(plan => plan.id === 'starter')!), null);
});

test('signed test webhooks accept dashboard products without metadata but reject wrong amounts, periods, modes or conflicting metadata', async () => {
  for (const [planId, kind, userId] of [
    ['starter', 'order.completed', 'user-real-pack'],
    ['lite-year', 'subscription.payment_succeeded', 'user-real-year'],
    ['lite-month', 'subscription.payment_succeeded', 'user-real-month'],
  ]) {
    const plan = site.plans.find(item => item.id === planId)!;
    const original = event(kind, planId, `pay-${planId}`, userId);
    const attempts = [
      original.replace(`"chargedAmount":"${plan.amount}"`, '"chargedAmount":"0.01"'),
      original.replace(`"total":"${plan.amount}"`, '"total":"9999.00"'),
      original.replace('"currency":"USD"', '"currency":"EUR"'),
      original.replace('"mode":"test"', '"mode":"prod"'),
      original.replace(`"productName":"${plan.description}"`, `"productName":"${plan.description}","productMetadata":{"planId":"other"}`),
      original.replace(`"billing":"${plan.billing}"`, '"billing":"wrong"'),
      original.replace(`"chargedAmount":"${plan.amount}",`, ''),
      ...(plan.billing === 'once' ? [] : [original.replace(`"billing":"${plan.billing}"`, '"billing":"once"')]),
    ];
    for (const body of attempts) {
      assert.equal((await (await handlePaymentWebhook({ ...env, DB: db }, webhook(body))).json()).message, 'failed');
    }
    assert.equal(await balance(db, userId), 0);
    const now = Date.UTC(2026, 8, 15);
    assert.equal((await (await handlePaymentWebhook({ ...env, DB: db }, webhook(original), now)).json()).message, 'success');
    assert.equal((await (await handlePaymentWebhook({ ...env, DB: db }, webhook(original), now)).json()).message, 'success');
    assert.equal(await balance(db, userId, now), plan.credits);
  }
});

test('create order calls Pancake checkout for the matching test product and returns the payment URL', async () => {
  const calls: { url: string; body: string; merchant: string }[] = [];
  const created = await createWaffoOrder(env, {
    userId: 'user-1', userEmail: 'user@example.com', planId: 'starter', billing: 'once', description: 'Starter credit pack', amount: '39.90', currency: 'USD',
    notifyUrl: 'https://awesomejev.link/api/webhooks/payment', successRedirectUrl: 'https://awesomejev.link/en/pricing', failedRedirectUrl: 'https://awesomejev.link/en/pricing', cancelRedirectUrl: 'https://awesomejev.link/en/pricing', requestId: 'checkout-1',
  }, catalog.starter, async (url, init) => {
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
  assert.deepEqual(payload.metadata, { userId: 'user-1', planId: 'starter', billing: 'once' });
  assert.equal('referral' in payload, false);
});

test('checkout selects each current product without allowing a different price or billing period', async () => {
  const sessions: Record<string, unknown>[] = [];
  const fakeFetch: typeof fetch = async (url, init) => {
    if (String(url).endsWith('/issue-session-token')) return Response.json({ data: { token: 'token', expiresAt: '2026-09-25T01:00:00.000Z' } });
    sessions.push(JSON.parse(String(init?.body)));
    return Response.json({ data: { sessionId: 'session', checkoutUrl: 'https://checkout.waffo.com/pay/session', expiresAt: '2026-09-25T01:00:00.000Z' } });
  };
  for (const plan of site.plans) {
    const order = {
      userId: 'user', userEmail: 'user@example.com', planId: plan.id, billing: plan.billing, description: plan.description,
      amount: plan.amount, currency: plan.currency, notifyUrl: 'https://example.com/webhook',
      successRedirectUrl: 'https://example.com/pricing', failedRedirectUrl: 'https://example.com/pricing', cancelRedirectUrl: 'https://example.com/pricing',
    };
    const product = productForPlan(env, plan)!;
    assert.ok(product);
    await startCheckout(env, order, product, fakeFetch);
    const session = sessions.at(-1)!;
    assert.equal(session.productId, product.id);
    assert.equal(session.productType, plan.billing === 'once' ? 'onetime' : 'subscription');
    assert.equal(session.currency, plan.currency);
    await assert.rejects(startCheckout(env, { ...order, amount: '0.01' }, product, fakeFetch), /mismatch/);
    await assert.rejects(startCheckout(env, order, { ...product, amount: '0.01' }, fakeFetch), /mismatch/);
  }
  assert.equal(sessions.length, site.plans.length);
});
