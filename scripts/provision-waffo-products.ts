// Run only in the already-authorized test merchant environment with WAFFO_PRIVATE_KEY present.
// This script does not publish products to production or print credential/product values.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { WaffoPancake, BillingPeriod, TaxCategory } from '@waffo/pancake-ts';
import site from '../site/site.config';
import { productForPlan, type WaffoProduct } from '../src/lib/waffo-products';

const path = '.waffo-products.json';
const { WAFFO_MERCHANT_ID, WAFFO_PRIVATE_KEY, WAFFO_TEST_STORE_ID, WAFFO_TEST_MODE_CONFIRMED } = process.env;
if (!WAFFO_MERCHANT_ID || !WAFFO_PRIVATE_KEY || !/^STO_[A-Za-z0-9]{22}$/.test(WAFFO_TEST_STORE_ID ?? '') || WAFFO_TEST_MODE_CONFIRMED !== '1') {
  throw new Error('Existing test merchant credentials, test store ID and explicit WAFFO_TEST_MODE_CONFIRMED=1 are required; no products created');
}
const client = new WaffoPancake({ merchantId: WAFFO_MERCHANT_ID, privateKey: WAFFO_PRIVATE_KEY });
const catalog: Record<string, WaffoProduct> = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
for (const plan of site.plans) {
  if (catalog[plan.id]) {
    if (!productForPlan({ WAFFO_PRODUCTS: JSON.stringify(catalog) }, plan)) throw new Error(`Stale product mapping for ${plan.id}; verify manually before resuming`);
    continue;
  }
  const prices = { [plan.currency]: { amount: plan.amount, taxCategory: plan.billing === 'once' ? TaxCategory.DigitalGoods : TaxCategory.SaaS } };
  const metadata = { planId: plan.id };
  const result = plan.billing === 'once'
    ? await client.onetimeProducts.create({ storeId: WAFFO_TEST_STORE_ID!, name: plan.description, prices, metadata })
    : await client.subscriptionProducts.create({ storeId: WAFFO_TEST_STORE_ID!, name: plan.description, prices, metadata,
        billingPeriod: plan.billing === 'month' ? BillingPeriod.Monthly : BillingPeriod.Yearly });
  const product = result.product;
  const billingPeriod = plan.billing === 'once' ? 'once' : plan.billing === 'month' ? 'monthly' : 'yearly';
  if (product.storeId !== WAFFO_TEST_STORE_ID || product.prices[plan.currency]?.amount !== plan.amount ||
      product.metadata?.planId !== plan.id || ('billingPeriod' in product && product.billingPeriod !== billingPeriod)) {
    throw new Error(`Product creation did not return the expected price and period for ${plan.id}; stop and investigate`);
  }
  catalog[plan.id] = { id: product.id, amount: plan.amount, currency: plan.currency, billingPeriod };
  writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`, { mode: 0o600 });
  console.log(`Verified test product for ${plan.id}; mapping saved`);
}
console.log(`All ${site.plans.length} prices verified; install ${path} as the WAFFO_PRODUCTS Worker secret, then test checkout`);
