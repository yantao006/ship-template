import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare } from 'miniflare';
import { creditHistory } from '../src/lib/credit-history';

test('credit table reads only the signed-in user and caps results', async () => {
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'credit-history-test' } });
  try {
    const db = await mf.getD1Database('DB');
    await db.prepare('CREATE TABLE credit_lot (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, source TEXT NOT NULL, granted INTEGER NOT NULL, remaining INTEGER NOT NULL, expires_at INTEGER, created_at INTEGER NOT NULL)').run();
    await db.prepare('INSERT INTO credit_lot VALUES (?, ?, ?, ?, ?, ?, ?)').bind('other', 'user-b', 'signup', 99, 99, null, 200).run();
    for (let n = 0; n < 102; n++) await db.prepare('INSERT INTO credit_lot VALUES (?, ?, ?, ?, ?, ?, ?)').bind(`own-${n}`, 'user-a', 'signup', 30, 30, null, n).run();
    const rows = await creditHistory(db, 'user-a');
    assert.equal(rows.length, 100);
    assert.equal(rows[0].id, 'own-101');
    assert.equal(rows.at(-1)?.id, 'own-2');
    assert.ok(rows.every(row => row.granted === 30));
    assert.deepEqual(await creditHistory(db, 'user-b'), [{ id: 'other', source: 'signup', granted: 99, remaining: 99, created_at: 200, expires_at: null }]);
  } finally { await mf.dispose(); }
});
