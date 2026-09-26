import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccountPopoverCard, AccountPopoverRow, type PopoverRow } from '../src/components/blocks/account-popover-card';

const row = (overrides: Partial<PopoverRow> = {}): PopoverRow => ({ id: 'example', icon: createElement('svg', { 'aria-label': 'icon' }), label: 'Example', ...overrides });
const renderRow = (overrides: Partial<PopoverRow> = {}) => renderToStaticMarkup(createElement(AccountPopoverRow, { row: row(overrides) }));

test('row badge is absent unless supplied and an unboxed badge receives its row tone', () => {
  assert.doesNotMatch(renderRow(), /account-row-badge/);
  const markup = renderRow({ tone: 'info', badge: { label: '+10', boxed: false } });
  assert.match(markup, /class="account-row-badge"/);
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
  assert.match(markup, /class="account-row-badge boxed"/);
  assert.match(markup, /--row-tone:var\(--account-tone-account\)/);
  assert.match(markup, /--row-box-tone:var\(--account-tone-account-box\)/);
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
