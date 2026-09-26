import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccountPopoverCard, AccountPopoverRow, type PopoverRow } from '../src/components/blocks/account-popover-card';
import { ProfileHeader, AvatarTrigger } from '../src/components/blocks/account-profile';
import { inviteGateRows } from '../src/components/blocks/account-gate-rows';

const row = (overrides: Partial<PopoverRow> = {}): PopoverRow => ({ id: 'example', icon: createElement('svg', { 'aria-label': 'icon' }), label: 'Example', ...overrides });
const renderRow = (overrides: Partial<PopoverRow> = {}) => renderToStaticMarkup(createElement(AccountPopoverRow, { row: row(overrides) }));

test('row badge is absent unless supplied and an unboxed badge receives its row tone', () => {
  assert.doesNotMatch(renderRow(), /account-row-badge/);
  const markup = renderRow({ tone: 'info', badge: { label: '+10', boxed: false } });
  assert.match(markup, /class="tone-tag tone-info account-row-badge"/);
  assert.match(markup, /--row-tone:var\(--account-tone-info\)/);
  assert.match(markup, /\+10/);
  assert.doesNotMatch(markup, /account-row-badge boxed/);
});

test('row divider is controlled solely by the row input', () => {
  assert.doesNotMatch(renderRow(), /account-row-divider/);
  assert.match(renderRow({ dividerBelow: true }), /class="account-row account-row-divider"/);
});

test('boxed badge uses one named row tone; a row without a badge tones its label', () => {
  const markup = renderRow({ tone: 'account', badge: { label: 'Free', boxed: true } });
  assert.match(markup, /class="tone-tag tone-account account-row-badge boxed"/);
  assert.match(markup, /--row-tone:var\(--account-tone-account\)/);
  assert.doesNotMatch(markup, /tone-label/);
  assert.match(renderRow({ tone: 'danger' }), /class="account-row tone-label"/);
  assert.doesNotMatch(renderRow({ tone: 'danger' }), /account-row-badge/);
});

test('card renders exactly its ordered row list with the supplied header and menu semantics', () => {
  const markup = renderToStaticMarkup(createElement(AccountPopoverCard, {
    header: createElement('strong', null, 'Profile'), label: 'Account', role: 'menu', className: 'account-menu',
    rows: [row({ id: 'first', label: 'First', dividerBelow: true }), row({ id: 'second', label: 'Second', href: '/credits' })],
  }));
  assert.match(markup, /role="menu"/);
  assert.match(markup, /Profile/);
  assert.equal((markup.match(/role="menuitem"/g) ?? []).length, 2);
  assert.ok(markup.indexOf('First') < markup.indexOf('Second'));
  assert.equal((markup.match(/account-row-divider/g) ?? []).length, 1);
  assert.match(markup, /href="\/credits"/);
});

test('invite-gated account uses the same profile card, row semantics and unchanged route targets', () => {
  const links = {
    workspace: { href: '/zh/dashboard', label: 'Dashboard' },
    credits: { href: '/zh/credits', label: 'Credits' },
    pricing: { href: '/zh/pricing', label: 'Pricing' },
  };
  const rows = inviteGateRows(links, 'Sign out', () => {}, false);
  assert.deepEqual(rows.map(item => item.id), ['workspace', 'credits', 'pricing', 'signout']);
  assert.match(renderToStaticMarkup(createElement('span', null, rows[2].icon)), /lucide-tags/);
  const markup = renderToStaticMarkup(createElement(AccountPopoverCard, {
    header: createElement(ProfileHeader, { name: 'Test User', email: 'test@example.com' }),
    label: 'Account', role: 'menu', className: 'account-menu', rows,
  }));
  assert.match(markup, /class="account-profile"/);
  assert.match(markup, /class="replica-avatar replica-avatar-large"/);
  assert.equal((markup.match(/role="menuitem"/g) ?? []).length, 4);
  for (const { href } of Object.values(links)) assert.match(markup, new RegExp(`href="${href}"`));
  assert.ok(markup.indexOf('Dashboard') < markup.indexOf('Credits'));
  assert.ok(markup.indexOf('Credits') < markup.indexOf('Pricing'));
  assert.match(renderToStaticMarkup(createElement(AvatarTrigger, { name: 'Test User', label: 'Account', open: false, onClick: () => {} })), /aria-haspopup="menu"/);
  assert.equal(inviteGateRows(undefined, 'Sign out', () => {}, true).length, 1);
  assert.equal(inviteGateRows(undefined, 'Sign out', () => {}, true)[0].disabled, true);
});
