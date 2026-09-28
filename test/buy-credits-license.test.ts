import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import site from '../site/site.config';
import en from '../site/messages/en';
import zh from '../site/messages/zh';
import { BuyCreditsContent, defaultPurchaseSelection } from '../src/components/account/buy-credits-dialog';
import { CommercialLicense } from '../src/components/pricing/commercial-license';
import { isSiteShellPath } from '../src/lib/routes';
import { planCopy } from '../src/lib/plan-copy';
import { annualSavingsPercent } from '../src/components/pricing/plan-display';

const plans = site.plans.map(plan => ({ ...plan, name: planCopy('en', plan.id).name, checkoutEnabled: false }));

test('buy credits lists configured plans and annual savings but never invents a countdown or payable product', () => {
  const markup = renderToStaticMarkup(createElement(BuyCreditsContent, { plans, copy: en.account, pricing: en.pricing, brand: site.brand, locale: 'en' }));
  assert.match(markup, new RegExp(`${annualSavingsPercent(plans)}% OFF`));
  assert.match(markup, /Standard/);
  assert.match(markup, /1,500 credits \/ month/);
  assert.match(markup, /\$24\.9/);
  assert.match(markup, /Get Started/);
  assert.match(markup, /Checkout unavailable|prices have not been matched/);
  assert.doesNotMatch(markup, /ENDS IN|\d\d:\d\d:\d\d/);
  for (const plan of site.plans.filter(plan => plan.billing === 'year')) assert.match(markup, new RegExp(planCopy('en', plan.id).name));
  const pack = renderToStaticMarkup(createElement(BuyCreditsContent, { plans: plans.filter(plan => plan.billing === 'once'), copy: en.account, pricing: en.pricing, brand: site.brand, locale: 'en' }));
  assert.match(pack, /Credit Packs/);
});

test('purchase tabs retain independent defaults, with the catalog midpoint selected for packs', () => {
  assert.deepEqual(defaultPurchaseSelection(plans), { month: 'standard-month', year: 'standard-year', once: 'pro-pack' });
  assert.equal(defaultPurchaseSelection(plans.filter(plan => plan.billing === 'once')).once, 'pro-pack');
});

test('commercial license is localized and never offers an unissued certificate', () => {
  assert.ok(isSiteShellPath('/en/commercial-license'));
  assert.ok(isSiteShellPath('/zh/commercial-license'));
  assert.equal(site.account.commercialUseHref, '/commercial-license');
  for (const copy of [en.accountPages, zh.accountPages]) {
    const markup = renderToStaticMarkup(createElement(CommercialLicense, { copy, brand: site.brand, locale: copy === en.accountPages ? 'en' : 'zh' }));
    assert.ok(markup.includes(copy.licenseTitle));
    assert.ok(markup.includes(site.brand));
    assert.ok(markup.includes(copy.licenseViewPlans));
    assert.doesNotMatch(markup, /href=".*\.pdf/);
  }
});
