import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hasAnnualOffer, planDisplay, pricingFeatureLines } from '../src/components/pricing/plan-display';

const plans = [
  { id: 'max-month', tier: 'max', billing: 'month' as const, credits: 100, amount: '20', currency: 'USD', checkoutEnabled: true },
  { id: 'max-year', tier: 'max', billing: 'year' as const, credits: 100, amount: '120', currency: 'USD', checkoutEnabled: true },
  { id: 'pack', billing: 'once' as const, credits: 50, amount: '5', currency: 'USD', checkoutEnabled: false },
];

test('plan display computes annual equivalents, max multiplier, and checkout gating for both views', () => {
  assert.deepEqual(planDisplay(plans[1], plans, 2), { factor: 2, price: 20, total: 240, previousPrice: 40, discount: 50, credits: 200, canCheckout: false });
  assert.equal(planDisplay(plans[1], plans).canCheckout, true);
  assert.equal(planDisplay(plans[2], plans).canCheckout, false);
  assert.equal(hasAnnualOffer(plans), true);
  assert.equal(hasAnnualOffer([{ ...plans[0], currency: 'EUR' }, plans[1]]), false);
  assert.equal(hasAnnualOffer([{ ...plans[0], amount: '10' }, plans[1]]), false);
  assert.equal(hasAnnualOffer([plans[1]]), false);
  assert.deepEqual(pricingFeatureLines(plans[1], 'year', { planFeatures: { max: ['Always', { yearly: 'Annual' }] }, packFeatures: [] }), ['Always', 'Annual']);
  assert.deepEqual(pricingFeatureLines(plans[2], 'once', { planFeatures: {}, packFeatures: ['{count} credits'] }), ['50 credits']);
});

test('pricing restores only selection after auth and never initiates checkout on restore', () => {
  const source = readFileSync('src/components/pricing/pricing-checkout.tsx', 'utf8');
  const restore = source.slice(source.indexOf('useEffect(() => {'), source.indexOf('const actionable'));
  assert.match(restore, /setSelectedPlan\(selection\.id\)/);
  assert.doesNotMatch(restore, /checkout\(|paymentUrl|location\.assign/);
});

test('browser auth flow functions are shared without changing password and OTP boundaries', () => {
  const flow = readFileSync('src/components/auth/flows.ts', 'utf8');
  const password = readFileSync('src/components/auth/sign-in-card.tsx', 'utf8');
  const otp = readFileSync('src/components/auth/minimax-auth-card.tsx', 'utf8');
  assert.match(flow, /authClient\.signIn\.social/);
  assert.match(flow, /\/api\/invites\/validate/);
  assert.match(flow, /type: 'sign-in'/);
  assert.match(password, /authClient\.signIn\.email\(\{ email, password \}\)/);
  assert.match(otp, /sendSignInCode\(email\)/);
});
