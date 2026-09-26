import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import messages from '../site/messages/en';
import site from '../site/site.config';
import { AccountDialogs, type Dialog } from '../src/components/blocks/account-dialogs';

const copy = messages.account;
const dialogs = ['checkin', 'share', 'invite', 'contact', 'feedback', 'plans', 'invoices'] as const satisfies readonly NonNullable<Dialog>[];
const activity = { balance: 10, referralCode: 'TEST', checkInDays: [], submissions: [], referralCount: 0, purchases: [], leaderboard: [] };
const render = (dialog: NonNullable<Dialog>) => renderToStaticMarkup(createElement(AccountDialogs, {
  dialog, onClose: () => {}, copy, labels: { credits: messages.nav.availableCredits }, settings: site.account,
  plans: site.plans.map(plan => ({ ...plan, name: plan.id })), activity, busy: false, error: '', notice: '',
  locale: 'en', dateLocale: 'en-US', siteUrl: site.url, brand: site.brand,
  icons: { checkin: createElement('svg'), share: createElement('svg'), invite: createElement('svg') },
  onCopyText: () => {}, onAction: async () => true,
}));

test('all seven account dialogs retain their accessible shell and destination content', () => {
  for (const dialog of dialogs) {
    const markup = render(dialog);
    assert.match(markup, new RegExp(`account-${dialog}-dialog`));
    assert.match(markup, /role="dialog" aria-modal="true" aria-labelledby="account-dialog-title"/);
    assert.match(markup, /class="account-close"/);
  }
  for (const dialog of ['checkin', 'share', 'invite'] as const) {
    const markup = render(dialog);
    assert.match(markup, /class="account-hero account-checkin-hero/);
    assert.match(markup, /class="account-hero-icon"/);
  }
  assert.match(render('plans'), /href="\/en\/pricing"/);
  assert.match(render('contact'), /mailto:/);
  assert.match(render('invoices'), /mailto:/);
});
