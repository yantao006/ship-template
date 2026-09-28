import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import messages from '../site/messages/en';
import site from '../site/site.config';
import { AccountDialogs, shareRecommendationText, type Dialog } from '../src/components/blocks/account-dialogs';

const copy = messages.account;
const dialogs = ['checkin', 'share', 'invite', 'contact', 'feedback', 'plans', 'invoices'] as const satisfies readonly NonNullable<Dialog>[];
const activity = { balance: 10, referralCode: '0123456789abcdef0123456789abcdef', checkInDays: [], submissions: [], referralCount: 0, purchases: [], leaderboard: [], referralHistory: [] };
const render = (dialog: NonNullable<Dialog>) => renderToStaticMarkup(createElement(AccountDialogs, {
  dialog, onClose: () => {}, copy, labels: { credits: messages.nav.availableCredits }, settings: site.account,
  plans: site.plans.map(plan => ({ ...plan, name: plan.id, checkoutEnabled: false })), pricing: messages.pricing, activity, busy: false, error: '', notice: '',
  locale: 'en', dateLocale: 'en-US', siteUrl: site.url, brand: site.brand,
  icons: { checkin: createElement('svg'), share: createElement('svg'), invite: createElement('svg') },
  onCopyText: () => {}, onAction: async () => true, onRefresh: () => {},
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
  assert.match(render('plans'), /Get Started/);
  assert.match(render('feedback'), /Feedback &amp; Get Credits/);
  const contact = render('contact');
  assert.match(contact, /mailto:support@awesomejev\.link/);
  assert.match(contact, /Have questions or feedback about Awesomejev Test Video\?/);
  assert.match(contact, /class="account-body account-contact"/);
  assert.doesNotMatch(contact, /Questions about your account or payment/);
  assert.match(render('invoices'), /mailto:/);
  const css = readFileSync('src/components/blocks/account-popovers.css', 'utf8');
  assert.match(css, /\.account-contact-overlay\{backdrop-filter:none\}/);
  for (const id of ['account', 'subscription', 'invoices']) {
    assert.match(css, new RegExp(`\\.account-menu \\.account-row-${id} \\.account-row-icon\\{color:var\\(--account-tone-`));
  }
});

test('invite card uses the official claim link, true empty data and configured rewards', () => {
  const markup = render('invite');
  assert.match(markup, /Get Your Referral Link/);
  assert.match(markup, new RegExp(`${site.account.referral.inviterCredits} CREDITS`));
  assert.match(markup, /class="account-invite-credit-pill">6 credits<\/strong>/);
  assert.match(markup, /invitation-landing\?invite_code=/);
  assert.match(markup, /No rewarded referrals yet/);
  assert.match(markup, /You haven&#x27;t referred any friends yet!/);
  assert.match(markup, /Refresh referral history/);
  assert.match(markup, /TOP 3/);
  assert.doesNotMatch(markup, /Gmail|daily cap|IP address/);
});

test('invite social hover and keyboard focus share the same scoped, reduced-motion-aware treatment', () => {
  const markup = render('invite');
  for (const name of site.account.shareNetworks) assert.match(markup, new RegExp(`aria-label="${name}"`));
  const css = readFileSync('src/components/blocks/account-popovers.css', 'utf8');
  assert.match(css, /\.account-invite-social \.account-sharelinks a:is\(:hover,:focus-visible\)\{background:/);
  assert.match(css, /\.account-invite-social \.account-sharelinks a\{[^}]*transition:background-color \.15s/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{[^}]*\}[^}]*\.account-invite-social \.account-sharelinks a\{transition:none\}/);
});

test('share card uses the configured site URL, honest localized recommendation and disabled empty submission', () => {
  assert.match(copy.shareRecommendation, /MiniMax H3 video and AI image requests/);
  assert.equal(shareRecommendationText(site.url, site.account.checkIn.enabled, copy), `${copy.shareRecommendation}\n${site.url}`);
  assert.equal(shareRecommendationText('https://other.example', false, copy), `${copy.shareRecommendationNoDaily}\nhttps://other.example`);
  const markup = render('share');
  assert.match(markup, /Quick copy/);
  assert.match(markup, /Where can I share\?/);
  assert.match(markup, /We value genuine shares/);
  assert.match(markup, /href="https:\/\/www.reddit.com\/"/);
  assert.match(markup, /type="submit" disabled=""/);
  assert.match(markup, /https:\/\/reddit.com\/r\/\.\.\./);
});
