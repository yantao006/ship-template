import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import second from '../fixtures/second-site/site/site.config';
import en from '../fixtures/second-site/site/messages/en';
import zh from '../fixtures/second-site/site/messages/zh';
import tool from '../fixtures/second-site/site/video-tool.config';
import { FakeEmail } from '../src/lib/email';
import { notifyPasswordReset, notifySignInCode } from '../src/lib/notifications';
import { MinimaxAuthCard } from '../src/components/auth/minimax-auth-card';
import { browserNavCopy } from '../src/lib/browser-nav-copy';
import { AccountDialogs, type Activity } from '../src/components/account/account-dialogs';
import { PricingCheckout } from '../src/components/pricing/pricing-checkout';
import { BuyCreditsContent } from '../src/components/account/buy-credits-dialog';
import { money, annualSavingsPercent } from '../src/components/pricing/plan-display';
import { CHECKIN_STREAK_DAYS } from '../src/components/account/account-popover-state';
import { check } from '../scripts/site-check';

const activity: Activity = { balance: 10, referralCode: 'abc', checkInDays: [], submissions: [], referralCount: 0, purchases: [], leaderboard: [], referralHistory: [] };
const plans = second.plans.map(plan => ({ ...plan, name: en.planCopy[plan.id as keyof typeof en.planCopy].name, checkoutEnabled: false }));
const forbidden = /Awesomejev|support@awesomejev\.com|support@awesomejev\.link|50%|30 credits|30 积分|16 张|16 max/;

test('second site renders its own identity, configured rewards and only supported annual claims', async () => {
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
  assert.equal(annualSavingsPercent(plans), 0);
  assert.equal('logo' in second, false);
  for (const [locale, copy] of [['en', en], ['zh', zh]] as const) {
    const auth = renderToStaticMarkup(createElement(MinimaxAuthCard, {
      copy: browserNavCopy(copy), card: copy.signIn.card, signupCredits: second.signupCredits,
      brand: second.brand, supportEmail: second.account.contactEmail,
      methods: { email: { enabled: true, requireVerification: false, passwordReset: true }, google: { enabled: false }, github: { enabled: false } },
      inviteRequired: false, locale, callbackURL: '/', onAuthenticated: async () => {},
    }));
    assert.match(auth, /Second Video/);
    assert.doesNotMatch(auth, /minimax-auth-photo|brand\/logo/);
    const icons = { checkin: createElement('svg'), share: createElement('svg'), invite: createElement('svg') };
    const renderDialog = (dialog: 'checkin' | 'invite' | 'feedback', feedbackEmail?: string) => renderToStaticMarkup(createElement(AccountDialogs, {
      dialog, onClose: () => {}, copy: copy.account, labels: { credits: copy.nav.availableCredits }, settings: { ...second.account, feedbackEmail },
      plans, pricing: copy.pricing, activity, busy: false, error: '', notice: '', locale, dateLocale: locale === 'en' ? 'en-US' : 'zh-CN',
      siteUrl: second.url, brand: second.brand, viewerEmail: 'viewer@example.com', icons,
      onCopyText: () => {}, onAction: async () => true, onRefresh: () => {},
    }));
    const checkin = renderDialog('checkin');
    assert.match(checkin, /\+2/);
    assert.equal((checkin.match(/class="future"/g) ?? []).length, CHECKIN_STREAK_DAYS - 1);
    assert.ok(checkin.includes(copy.account.checkinLead.replace('{credits}', '2')));
    const invite = renderDialog('invite');
    assert.match(invite, /\+5|5 CREDITS|5 积分/);
    assert.ok(invite.includes(copy.account.inviteSummary.replace('{inviter}', '5').replace('{friend}', '3')));
    assert.match(renderDialog('feedback'), /mailto:support@other\.example/);
    assert.match(renderDialog('feedback', 'feedback@other.example'), /mailto:feedback@other\.example/);
    const pricing = renderToStaticMarkup(createElement(PricingCheckout, { locale, plans, models: [], brand: second.brand, copy: copy.pricing }));
    assert.doesNotMatch(pricing, /pricing-banner|pricing-launch|% OFF/);
    assert.ok(pricing.includes(copy.pricing.title));
    const purchase = renderToStaticMarkup(createElement(BuyCreditsContent, { plans, copy: copy.account, pricing: copy.pricing, brand: second.brand, locale }));
    assert.doesNotMatch(purchase, /buy-credits-offer|% OFF/);
    for (const output of [auth, checkin, invite, pricing, purchase]) assert.doesNotMatch(output, forbidden);
  }
  assert.match(readFileSync('src/components/shell/Header.tsx', 'utf8'), /brand=\{site\.brand\}/);
  assert.match(readFileSync('src/components/shell/Footer.tsx', 'utf8'), /\{site\.brand\}/);
  assert.match(readFileSync('src/components/shell/Footer.tsx', 'utf8'), /site\.account\.contactEmail/);
  assert.equal(tool.models.length, 2);
  assert.equal(second.plans.length, 2);
  assert.equal(money(24, 'EUR', 'de-DE'), '24,0 €');
  const mail = new FakeEmail();
  await notifySignInCode(mail, second, 'viewer@example.com', '123456', 'en');
  await notifyPasswordReset(mail, second, 'viewer@example.com', 'https://other.example/reset-password');
  assert.match(mail.sent[0].subject, /Second Video/);
  assert.match(mail.sent[0].text, /Second Video/);
  assert.match(mail.sent[1].subject, /Second Video/);
  assert.match(mail.sent[1].text, /Second Video/);
  for (const message of mail.sent) assert.doesNotMatch(`${message.subject} ${message.text}`, forbidden);
});

test('site-check detects drift in assets, plans, tool ids, placeholders and reward claims', async () => {
  const root = resolve('fixtures/second-site');
  const inspect = async (needle: string) => assert.ok((await check(root)).errors.some(error => error.includes(needle)), needle);
  const config = second as unknown as Record<string, unknown>;
  config.logo = { src: '/missing-logo.svg', alt: 'Missing' };
  try { await inspect('Logo path'); } finally { delete config.logo; }
  const planCopy = en.planCopy as Record<string, { name: string }>;
  const pack = planCopy.pack;
  delete planCopy.pack;
  try { await inspect('plan-copy ids'); } finally { planCopy.pack = pack; }
  const models = en.videoTool.models as Record<string, string>;
  const model = models['bench-clip'];
  delete models['bench-clip'];
  try { await inspect('Tool en models'); } finally { models['bench-clip'] = model; }
  const old = zh.account.checkinLead;
  zh.account.checkinLead = '领取 1 积分';
  try {
    await inspect('Copy placeholder mismatch');
    await inspect('hard-coded reward');
  } finally { zh.account.checkinLead = old; }
  assert.deepEqual((await check(root)).errors, []);
});
