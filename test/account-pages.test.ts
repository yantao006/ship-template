import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { creditMovements } from '../src/lib/account-page-history';
import { grant, reserve, refundFailure } from '../src/lib/ledger';
import { isSiteShellPath } from '../src/lib/routes';
import { routePath } from '../src/lib/route-paths';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import messages from '../site/messages/en';
import { CreditRecords } from '../src/components/account-pages-controls';

test('account page routes retain the public shell for both locales', () => {
  for (const locale of ['en', 'zh']) for (const section of ['account', 'subscription', 'invoices', 'creditCenter'] as const) {
    assert.equal(isSiteShellPath(routePath(locale, section)), true);
  }
});

test('account credit records include real grants, spends and refunds, scoped to the signed-in user', async () => {
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'account-pages-test' } });
  try {
    const db = await mf.getD1Database('DB') as unknown as D1Database;
    for (const sql of readFileSync('migrations/0001_initial.sql', 'utf8').split(';').map(value => value.trim()).filter(Boolean)) await db.prepare(sql).run();
    await grant(db, { userId: 'a', source: 'signup', sourceId: 'a', credits: 30, now: 1000 });
    await grant(db, { userId: 'a', source: 'payment', sourceId: 'payment-a', credits: 100, now: 1100 });
    await grant(db, { userId: 'b', source: 'payment', sourceId: 'payment-b', credits: 200, now: 1200 });
    await reserve(db, { userId: 'a', taskId: 'task-a', cost: 10, now: 1300 });
    await refundFailure(db, 'task-a', 1400);
    const rows = await creditMovements(db, 'a');
    assert.deepEqual(rows.map(row => row.amount), [10, -10, 100, 30]);
    assert.equal(rows[2].source, 'payment');
    assert.equal(rows[2].source_id, 'payment-a');
    assert.equal(rows[1].source, null);
    assert.ok(rows.every(row => row.source_id !== 'payment-b'));
    const copy = messages.accountPages;
    const markup = renderToStaticMarkup(createElement(CreditRecords, { entries: rows, labels: copy, locale: 'en-US', sourceLabels: { signup: 'Welcome credits', payment: 'Paid credits' } }));
    assert.match(markup, /Welcome credits/);
    assert.match(markup, /No expiration/);
  } finally { await mf.dispose(); }
});
