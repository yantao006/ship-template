import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import site from '../site/site.config';
import theme from '../site/theme.config';
import en from '../site/messages/en/pricing';
import zh from '../site/messages/zh/pricing';
import { planById, grantVerifiedPayment } from '../src/lib/payments';
import { productForPlan } from '../src/lib/waffo-products';
import { PricingCheckout, pricingFeatureLines } from '../src/components/pricing-checkout';
import secondSite from '../fixtures/second-site/site/site.config';
import secondEn from '../fixtures/second-site/site/messages/en/pricing';
import secondZh from '../fixtures/second-site/site/messages/zh/pricing';

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

test('subscription perks match the cloned cards in yearly and monthly views', () => {
  const common = 'MiniMax H3 + all premium models included';
  const discount = '30% off MiniMax models';
  const commercial = 'Commercial Use License';
  const expected = {
    lite: [common, 'Up to 1 batch generation task', 'Standard generation speed', 'Standard generation success rate', 'Standard customer support', commercial],
    standard: [common, discount, 'Up to 4 batch generation tasks', 'Priority processing speed', 'High generation success rate', 'Priority customer support', commercial],
    pro: [common, discount, 'Up to 10 batch generation tasks', 'Fastest generation speed', 'High generation success rate', 'Dedicated account manager', commercial],
    max: [common, discount, 'Up to 10 batch generation tasks', 'Fastest generation speed', 'High generation success rate', 'Dedicated account manager', commercial],
  };
  for (const [tier, yearlyFeatures] of Object.entries(expected)) {
    const plan = planById(`${tier}-year`)!;
    assert.deepEqual(pricingFeatureLines(plan, 'year', en), yearlyFeatures);
    assert.deepEqual(pricingFeatureLines(plan, 'month', en), yearlyFeatures.filter(line => line !== discount));
    const month = planById(`${tier}-month`)!;
    assert.deepEqual(pricingFeatureLines(month, 'month', en), yearlyFeatures.filter(line => line !== discount));
    assert.equal(pricingFeatureLines(plan, 'year', zh).length, yearlyFeatures.length);
    assert.equal(pricingFeatureLines(plan, 'month', zh).length, yearlyFeatures.length - (tier === 'lite' ? 0 : 1));
  }
  assert.match(pricingFeatureLines(planById('standard-year')!, 'year', zh)[1], /MiniMax/);
  assert.doesNotMatch(pricingFeatureLines(planById('standard-month')!, 'month', zh).join(' '), /7 折/);
});

test('every credit pack shows its configured count, one-year validity and subscription requirement', () => {
  for (const [id, , credits] of packs) {
    const plan = planById(id)!;
    assert.deepEqual(pricingFeatureLines(plan, 'once', en), [
      `${credits.toLocaleString('en-US')} credits`,
      'Credits valid for 1 year',
      'Unlocks all features; premium perks require an active subscription',
    ]);
    assert.deepEqual(pricingFeatureLines(plan, 'once', zh), [
      `${credits.toLocaleString('en-US')} 积分`,
      '积分有效期为 1 年',
      '解锁所有功能；高级会员权益需订阅仍在有效期内',
    ]);
  }
});

test('the configured brand and full feature list render in the default yearly view', () => {
  // Node's tsx JSX transform expects a global React binding for the client component.
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
  const plan = planById('standard-year')!;
  const html = renderToStaticMarkup(React.createElement(PricingCheckout, {
    locale: 'en', plans: [{ ...plan, name: 'Standard', checkoutEnabled: false }], models: [], brand: site.brand, copy: en,
  }));
  assert.match(html, new RegExp(site.brand));
  const features = html.match(/<ul class="pricing-features">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  assert.equal((features.match(/<li/g) ?? []).length, 7);
  for (const line of pricingFeatureLines(plan, 'year', en)) assert.ok(features.includes(line), line);
  assert.doesNotMatch(features, /Preview only|billed yearly/);
});

test('a second site owns its own pricing features rather than inheriting MiniMax claims', () => {
  for (const [config, locales] of [[site, [en, zh]], [secondSite, [secondEn, secondZh]]] as const) {
    for (const copy of locales) {
      for (const plan of config.plans) {
        assert.ok(pricingFeatureLines(plan, plan.billing, copy).every(line => line.trim()), `${plan.id}: missing feature`);
      }
    }
  }
  const annual = { id: 'annual', credits: 240 };
  const pack = { id: 'pack', credits: 350 };
  assert.deepEqual(pricingFeatureLines(annual, 'year', secondEn), ['Configured video models', 'Credits for the current calendar month only']);
  assert.deepEqual(pricingFeatureLines(pack, 'once', secondZh), ['350 积分', '一次性发放积分', '预览版尚未开放视频生成']);
  assert.throws(() => pricingFeatureLines({ id: 'unknown', credits: 1 }, 'year', secondEn), /Missing pricing features/);
});

test('unprovisioned plans stay unpaid; Max multiplier above 1 stays unpaid', async () => {
  for (const plan of site.plans) assert.equal(productForPlan({}, plan), null);
  const route = readFileSync('src/app/api/checkout/route.ts', 'utf8');
  const page = readFileSync('src/components/pricing-content.tsx', 'utf8');
  assert.match(route, /productForPlan\(env, plan\)/);
  assert.match(page, /checkoutEnabled: !!productForPlan\(env, plan\)/);
  assert.doesNotMatch(page, /<Header\b|accountSnapshot\(/, 'the shared site shell owns the header and account snapshot');
  const client = readFileSync('src/components/pricing-checkout.tsx', 'utf8');
  assert.match(client, /disabled=\{!canPay \|\| !!pending\}/);
  assert.match(client, /factor === 1/);
  const webhook = readFileSync('src/lib/payments.ts', 'utf8');
  assert.match(webhook, /settled\.amount !== product\.amount/);
  const rejected = await grantVerifiedPayment({} as never, { userId: 'user', paymentId: 'payment', planId: 'lite-month', billing: 'once', subscriptionId: 'order', amount: '29.90', currency: 'USD', mode: 'test' });
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
