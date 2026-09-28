import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import en from '../site/messages/en';
import zh from '../site/messages/zh';
import site from '../site/site.config';
import { AccountDialogs } from '../src/components/blocks/account-dialogs';
import { checkinInviteShare } from '../src/lib/checkin-invite';
import { isSiteShellPath } from '../src/lib/routes';
import { referralCodeFromUrl } from '../src/lib/use-referral-claim';

const code = '0123456789abcdef0123456789abcdef';
const activity = { balance: 10, referralCode: code, checkInDays: [], submissions: [], referralCount: 0, purchases: [], leaderboard: [], referralHistory: [] };

test('check-in invite uses this site origin and the current user code in both languages', () => {
  for (const [locale, copy] of [['en', en.account], ['zh', zh.account]] as const) {
    const { link, text, targets } = checkinInviteShare('https://example.org/other-path', code, copy.checkinInviteMessage);
    assert.equal(link, `https://example.org/invitation-landing?invite_code=${code}`);
    assert.equal(text, `${copy.checkinInviteMessage}\n${link}`);
    if (locale === 'en') assert.equal(copy.checkinInviteMessage, 'I found a site with free creation rewards for checking in. Give it a try:');
    else assert.match(copy.checkinInviteMessage, /签到.*免费创作奖励/);
    for (const network of ['Facebook', 'X', 'WhatsApp', 'LinkedIn', 'Telegram'] as const) {
      const target = new URL(targets[network]);
      const passedLink = target.searchParams.get('u') ?? target.searchParams.get('url');
      const passedMessage = target.searchParams.get('text') ?? target.searchParams.get('quote') ?? target.searchParams.get('summary');
      assert.equal(passedLink ?? (passedMessage?.includes(link) ? link : null), link, network);
      assert.ok(passedMessage?.includes(copy.checkinInviteMessage), network);
      if (network === 'X' || network === 'WhatsApp') assert.equal(passedMessage, text);
    }
  }
});

test('landing and legacy links retain only valid referral codes through the same claim flow', () => {
  assert.equal(referralCodeFromUrl(new URL(`https://example.org/invitation-landing?invite_code=${code}`)), code);
  assert.equal(referralCodeFromUrl(new URL('https://example.org/invitation-landing?invite_code=0af4xvq7')), '0af4xvq7');
  assert.equal(referralCodeFromUrl(new URL(`https://example.org/en?ref=${code}`)), code);
  assert.equal(referralCodeFromUrl(new URL('https://example.org/en?ref=0af4xvq7')), '0af4xvq7');
  assert.equal(referralCodeFromUrl(new URL(`https://example.org/invitation-landing?invite_code=invalid&ref=${code}`)), code);
  assert.equal(referralCodeFromUrl(new URL('https://example.org/invitation-landing?invite_code=invalid')), null);
});

test('check-in and invite render the same official claim destination', () => {
  const render = (dialog: 'checkin' | 'invite') => renderToStaticMarkup(createElement(AccountDialogs, {
    dialog, onClose: () => {}, copy: en.account, labels: { credits: en.nav.availableCredits }, settings: site.account,
    plans: [], pricing: en.pricing, activity, busy: false, error: '', notice: '', locale: 'en', dateLocale: 'en-US',
    siteUrl: site.url, brand: site.brand, viewerEmail: 'other@example.com', icons: { checkin: createElement('svg'), share: createElement('svg'), invite: createElement('svg') },
    onCopyText: () => {}, onAction: async () => true, onRefresh: () => {},
  }));
  const checkin = render('checkin');
  const invite = render('invite');
  const share = checkinInviteShare(site.url, code, en.account.checkinInviteMessage);
  for (const name of site.account.shareNetworks) assert.ok(checkin.includes(share.targets[name].replaceAll('&', '&amp;')), name);
  assert.ok(invite.includes(`/invitation-landing?invite_code=${code}`));
  assert.ok(isSiteShellPath('/invitation-landing'));
});
