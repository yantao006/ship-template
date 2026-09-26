import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccountPopoverCard, AccountPopoverRow, type PopoverRow } from '../src/components/blocks/account-popover-card';

const row = (overrides: Partial<PopoverRow> = {}): PopoverRow => ({ id: 'example', icon: createElement('svg', { 'aria-label': 'icon' }), label: 'Example', ...overrides });
const renderRow = (overrides: Partial<PopoverRow> = {}) => renderToStaticMarkup(createElement(AccountPopoverRow, { row: row(overrides) }));

test('row badge is absent unless supplied and supports an unboxed small label', () => {
  assert.doesNotMatch(renderRow(), /account-row-badge/);
  const markup = renderRow({ badge: { label: '+10', boxed: false, textColor: '#123456' } });
  assert.match(markup, /class="account-row-badge"/);
  assert.match(markup, /color:#123456/);
  assert.match(markup, /\+10/);
  assert.doesNotMatch(markup, /account-row-badge boxed/);
});

test('row divider is controlled solely by the row input', () => {
  assert.doesNotMatch(renderRow(), /account-row-divider/);
  assert.match(renderRow({ dividerBelow: true }), /class="account-row account-row-divider"/);
});

test('boxed badge uses the supplied box and text colors', () => {
  const markup = renderRow({ badge: { label: 'Free', boxed: true, boxColor: '#abcdef', textColor: '#123456' } });
  assert.match(markup, /class="account-row-badge boxed"/);
  assert.match(markup, /--badge-box-color:#abcdef/);
  assert.match(markup, /color:#123456/);
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
