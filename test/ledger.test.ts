import { test, before, after } from 'node:test';
import type { D1Database } from '@cloudflare/workers-types';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import { grant, grantSubscriptionMonth, reserve, refundFailure, balance, finish, cancelSubmitted } from '../src/lib/ledger';

let mf: Miniflare, db: D1Database;
before(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'test-ledger' } });
  db = await mf.getD1Database('DB') as unknown as D1Database;
  for (const sql of readFileSync('migrations/0001_initial.sql', 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
});
after(async () => mf?.dispose());

test('naive read-then-write overspends in concurrent requests (regression demonstration)', async () => {
  await db.prepare('INSERT INTO credit_lot (id,user_id,source,source_id,granted,remaining,created_at) VALUES (?,?,?,?,?,?,?)').bind('naive','naive','adjust','naive',100,100,0).run();
  const ready = await Promise.all(Array.from({length:20}, async () => {
    const row = await db.prepare('SELECT remaining FROM credit_lot WHERE id=?').bind('naive').first<{remaining: number}>();
    return row!.remaining;
  }));
  const accepted = await Promise.all(ready.map(async n => {
    if (n < 10) return false;
    await db.prepare('UPDATE credit_lot SET remaining=? WHERE id=?').bind(n-10,'naive').run();
    return true;
  }));
  assert.equal(accepted.filter(Boolean).length,20);
  assert.equal((await db.prepare('SELECT remaining FROM credit_lot WHERE id=?').bind('naive').first<{remaining:number}>())!.remaining,90);
});

test('native batch spends only available unexpired lots under 20 parallel reservations', async () => {
  await grant(db, { userId:'alice',source:'adjust',sourceId:'a',credits:60,expiresAt:2000,now:0 });
  await grant(db, { userId:'alice',source:'adjust',sourceId:'b',credits:50,expiresAt:3000,now:0 });
  await grant(db, { userId:'alice',source:'adjust',sourceId:'expired',credits:999,expiresAt:900,now:0 });
  const result = await Promise.allSettled(Array.from({length:20}, (_,i) => reserve(db,{ taskId:`task-${i}`,userId:'alice',cost:10,now:1000 })));
  assert.equal(result.filter(r => r.status === 'fulfilled').length,11);
  assert.equal(await balance(db,'alice',1000),0);
  assert.equal((await db.prepare("SELECT remaining FROM credit_lot WHERE source_id='expired'").first<{remaining:number}>())!.remaining,999);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM video_task').first<{n:number}>())!.n,11);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM credit_alloc a LEFT JOIN credit_entry e ON a.entry_id=e.id WHERE e.id IS NULL').first<{n:number}>())!.n,0);
});

test('spend earliest expiry first and refund concurrent failure exactly once', async () => {
  await grant(db,{userId:'bob',source:'adjust',sourceId:'c',credits:10,expiresAt:2000,now:0});
  await grant(db,{userId:'bob',source:'adjust',sourceId:'d',credits:50,now:0});
  await reserve(db,{taskId:'bob-task',userId:'bob',cost:15,now:1000});
  const spent = await db.prepare("SELECT l.source_id,a.amount FROM credit_alloc a JOIN credit_lot l ON l.id=a.lot_id JOIN video_task t ON t.consume_entry_id=a.entry_id WHERE t.id='bob-task' ORDER BY l.source_id").all<{source_id:string;amount:number}>();
  assert.deepEqual(spent.results.map(({source_id,amount}) => [source_id,amount]),[['c',10],['d',5]]);
  const refunded = await Promise.all(Array.from({length:5},() => refundFailure(db,'bob-task')));
  assert.equal(refunded.filter(Boolean).length,1);
  assert.equal(await balance(db,'bob',1000),60);
  await reserve(db,{taskId:'success',userId:'bob',cost:20,now:1000});
  await finish(db,'success');
  assert.equal(await refundFailure(db,'success'),false);
  assert.equal(await balance(db,'bob',1000),40);
  await reserve(db,{taskId:'submitted',userId:'bob',cost:10,now:1000});
  await db.prepare("UPDATE video_task SET status='submitted' WHERE id='submitted'").run();
  assert.equal(await cancelSubmitted(db,'submitted'),true);
  assert.equal(await refundFailure(db,'submitted'),false);
  assert.equal(await balance(db,'bob',1000),30);
});

test('yearly subscription issues one expiring month at a time, repeat is idempotent', async () => {
  const yearStart = Date.UTC(2026, 0, 1);
  const options = {userId:'annual',subscriptionId:'sub-1',yearStart,credits:50};
  assert.equal(await grantSubscriptionMonth(db,{...options,monthIndex:0}),true);
  assert.equal(await grantSubscriptionMonth(db,{...options,monthIndex:0}),false);
  assert.equal(await balance(db,'annual',Date.UTC(2026,0,15)),50);
  assert.equal(await balance(db,'annual',Date.UTC(2026,1,1)),0);
  assert.equal(await grantSubscriptionMonth(db,{...options,monthIndex:1}),true);
  assert.equal(await balance(db,'annual',Date.UTC(2026,1,15)),50);
});

test('signup grant is idempotent and conflicting duplicate is not swallowed', async () => {
  const input = {userId:'new-user',source:'signup',sourceId:'new-user',credits:30};
  const result = await Promise.all(Array.from({length:8},()=>grant(db,input)));
  assert.equal(result.filter(Boolean).length,1);
  assert.equal(await balance(db,'new-user'),30);
  await assert.rejects(grant(db,{...input,credits:31}));
});
