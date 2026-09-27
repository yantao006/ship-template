import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import site from '../site/site.config';
import theme from '../site/theme.config';
import en from '../site/messages/en/pricing';
import zh from '../site/messages/zh/pricing';
import { planById, grantVerifiedPayment } from '../src/lib/payments';

const tiers = [
  ['lite', '29.90', '14.90', 600],
  ['standard', '49.90', '24.90', 1500],
  ['pro', '99.90', '49.90', 3600],
  ['max', '199.90', '99.90', 8000],
] as const;
const packs = [
  ['starter', '39.90', 800], ['value', '79.90', 2000], ['pro-pack', '199.90', 7500],
  ['bulk', '999.90', 50000], ['mega', '2599.00', 160000],
] as const;

test('reference subscription and pack prices are sourced from one site catalog', () => {
  assert.equal(site.plans.length, 13);
  for (const [tier, monthly, yearlyMonthly, credits] of tiers) {
    const month = planById(`${tier}-month`)!;
    const year = planById(`${tier}-year`)!;
    assert.equal(month.amount, monthly);
    assert.equal(year.amount, (Number(yearlyMonthly) * 12).toFixed(2));
    assert.equal(month.credits, credits);
    assert.equal(year.credits, credits);
    assert.equal(month.currency, 'USD');
    assert.equal(year.currency, 'USD');
  }
  for (const [id, amount, credits] of packs) {
    const plan = planById(id)!;
    assert.equal(plan.billing, 'once');
    assert.equal(plan.amount, amount);
    assert.equal(plan.credits, credits);
    assert.equal(plan.currency, 'USD');
  }
  assert.equal(site.signupCredits, 30);
});

test('unverified Waffo product cannot open checkout or grant a new catalog plan', async () => {
  assert.equal(site.checkoutPlanId, null);
  const route = readFileSync('src/app/api/checkout/route.ts', 'utf8');
  assert.match(route, /!site\.checkoutPlanId \|\| plan\.id !== site\.checkoutPlanId/);
  const client = readFileSync('src/components/pricing-checkout.tsx', 'utf8');
  assert.match(client, /disabled=\{!canPay \|\| !!pending\}/);
  assert.match(client, /factor === 1/);
  const webhook = readFileSync('src/lib/payments.ts', 'utf8');
  assert.match(webhook, /!site\.checkoutPlanId \|\| settled\.planId !== site\.checkoutPlanId/);
  const rejected = await grantVerifiedPayment({} as never, { userId: 'user', paymentId: 'payment', planId: 'lite-month', billing: 'once', subscriptionId: 'order' });
  assert.equal(rejected, 'rejected');
});

test('pricing has locale parity and paired theme tokens without imported clone pricing', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort());
  assert.deepEqual(Object.keys(theme.pricing.light).sort(), Object.keys(theme.pricing.dark).sort());
  const content = readFileSync('src/components/pricing-content.tsx', 'utf8');
  assert.match(content, /planCopy\(locale, plan\.id\)/);
  assert.match(content, /videoTool\.models/);
  assert.match(content, /brand=\{site\.brand\}/);
  assert.doesNotMatch(content, /MiniMax H3|Awesomejev/);
});
