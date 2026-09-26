import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { grant, reserve } from '../src/lib/ledger';
import { workspaceData, pageNumber } from '../src/lib/workspace';

let mf: Miniflare, db: D1Database;
before(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'test-workspace' } });
  db = await mf.getD1Database('DB') as unknown as D1Database;
  for (const file of ['migrations/0001_initial.sql', 'migrations/0003_workspace.sql'])
    for (const sql of readFileSync(file,'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
  for (const user of ['alice','bob']) await db.prepare('INSERT INTO user (id,name,email,created_at,updated_at) VALUES (?,?,?,?,?)').bind(user,user,`${user}@example.com`,1,1).run();
});
after(async () => mf?.dispose());

test('workspace reads only the signed-in user across all sections', async () => {
  for (const user of ['alice','bob']) {
    await grant(db,{userId:user,source:'signup',sourceId:user,credits:20});
    await reserve(db,{userId:user,taskId:`task-${user}`,cost:3});
    await db.prepare("INSERT INTO user_api_key VALUES (?,?,?,?,?,?)").bind(`key-${user}`,user,`Name ${user}`,'ajev_abc',`hash-${user}`,1).run();
    await db.prepare('INSERT INTO user_notification VALUES (?,?,?,?,?,?)').bind(`note-${user}`,user,'Hello',user,null,1).run();
    await db.prepare("INSERT INTO support_ticket VALUES (?,?,?,'open',?,?)").bind(`ticket-${user}`,user,user,1,1).run();
    await db.prepare('INSERT INTO ticket_message VALUES (?,?,?,?,?,?)').bind(`msg-${user}`,`ticket-${user}`,user,user,null,1).run();
    await db.prepare("INSERT INTO payment_record (id,user_id,plan_id,billing,amount,currency,status,created_at) VALUES (?,?,?,'once','9.90','USD','paid',1)").bind(`pay-${user}`,user,'pack').run();
    await db.prepare("INSERT INTO user_subscription (id,user_id,plan_id,status,updated_at) VALUES (?,?,?,'active',1)").bind(`sub-${user}`,user,'annual').run();
  }
  for (const section of ['create','subscription','payments','credits','keys','notifications','tickets'] as const) {
    const result = await workspaceData(db,'alice',section);
    assert.ok(result.rows.every(row => !JSON.stringify(row).includes('bob')), section);
    assert.ok(result.rows.length > 0,section);
  }
  const credits = await workspaceData(db,'alice','credits','consume',1);
  assert.equal(credits.rows.length,1);
  assert.equal(credits.rows[0].amount,-3);
  assert.equal((await workspaceData(db,'alice','dashboard')).keys,1);
  assert.equal((await workspaceData(db,'alice','profile')).user?.email,'alice@example.com');
  assert.equal(pageNumber('-1'),1);
  assert.equal(pageNumber('999999'),10000);
});

test('credit ledger pagination is bounded and user-scoped', async () => {
  for (let i=0;i<25;i++) await db.prepare("INSERT INTO credit_entry (id,user_id,kind,amount,idem_key,created_at) VALUES (?,?,'adjust',1,?,?)").bind(`extra-${i}`,'alice',`extra-${i}`,i+100).run();
  assert.equal((await workspaceData(db,'alice','credits','',1)).rows.length,21);
  assert.equal((await workspaceData(db,'alice','credits','',2)).rows.length,7);
  assert.equal((await workspaceData(db,'bob','credits','',2)).rows.length,0);
});
