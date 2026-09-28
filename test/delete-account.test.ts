import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import { createAuth, type AuthSettings } from '../src/lib/auth';
import { deleteOwnAccount } from '../src/lib/delete-account-request';
import { grant, reserve } from '../src/lib/ledger';
import type { Env } from '../src/lib/env';

const settings: AuthSettings = { email: { enabled: true, requireVerification: false }, google: { enabled: false }, github: { enabled: false } };

async function fixture() {
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'delete-account-test' } });
  const DB = await mf.getD1Database('DB') as unknown as Env['DB'];
  for (const file of ['0001_initial.sql', '0002_invite_codes.sql', '0003_account_rewards.sql', '0004_referral_alias.sql', '0005_account_history_indexes.sql']) {
    for (const sql of readFileSync(`migrations/${file}`, 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await DB.prepare(sql).run();
  }
  const env: Env = { DB, SITE_URL: 'http://localhost:3000', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: 'a-local-test-secret-that-is-long-enough-for-auth', GOOGLE_CLIENT_ID: 'local-id', GOOGLE_CLIENT_SECRET: 'local-secret' };
  return { mf, DB, env, auth: createAuth(env, 'localhost', settings) };
}

const email = 'disposable-delete@example.com';
const password = 'disposable-password-only-for-this-test';
const post = (path: string, cookie: string, body: object, origin = 'http://localhost:3000') => new Request(`http://localhost:3000${path}`, { method: 'POST', headers: { origin, cookie, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(body) });

test('confirmed self-deletion invalidates the old login and atomically removes associated records, not another user', async () => {
  const { mf, DB, env, auth } = await fixture();
  try {
    const signup = await auth.handler(post('/api/auth/sign-up/email', '', { name: 'Disposable', email, password }));
    assert.equal(signup.status, 200);
    const cookie = signup.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie);
    const user = await DB.prepare('SELECT id FROM user WHERE email=?').bind(email).first<{ id: string }>();
    assert.ok(user?.id);
    const other = await auth.api.signUpEmail({ body: { name: 'Other', email: 'other-delete-test@example.com', password } });
    await grant(DB, { userId: user.id, source: 'payment', sourceId: 'disposable-payment', credits: 30 });
    await reserve(DB, { userId: user.id, taskId: 'disposable-task', cost: 10 });
    await DB.prepare('INSERT INTO invite_code(code,max_uses,used_count,created_at) VALUES (?,?,?,?)').bind('TESTDELETE', 10, 1, 1).run();
    await DB.prepare('INSERT INTO invite_redemption(user_id,code,created_at) VALUES (?,?,?)').bind(user.id, 'TESTDELETE', 1).run();
    await DB.prepare('INSERT INTO account_checkin(user_id,day,created_at) VALUES (?,?,?)').bind(user.id, '2026-09-28', 1).run();
    await DB.prepare('INSERT INTO account_share(id,user_id,url,created_at) VALUES (?,?,?,?)').bind('share-delete', user.id, 'https://example.com/post', 1).run();
    await DB.prepare('INSERT INTO account_referral_code(user_id,code) VALUES (?,?)').bind(user.id, 'deltest1').run();
    await DB.prepare('INSERT INTO account_referral_alias(code,user_id) VALUES (?,?)').bind('old-delete-code', user.id).run();
    await DB.prepare('INSERT INTO verification(id,identifier,value,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind('verify-delete', `sign-in-otp:${email}`, 'stale', Date.now() + 1000, 1, 1).run();

    const crossSite = await deleteOwnAccount(post('/api/account/delete', cookie, { confirm: email }, 'https://elsewhere.example'), env);
    assert.equal(crossSite.status, 403);
    const unconfirmed = await deleteOwnAccount(post('/api/account/delete', cookie, { confirm: 'wrong@example.com' }), env);
    assert.equal(unconfirmed.status, 400);
    assert.ok(await DB.prepare('SELECT id FROM user WHERE id=?').bind(user.id).first());
    assert.ok(await auth.api.getSession({ headers: new Headers({ cookie }) }));

    const deleted = await deleteOwnAccount(post('/api/account/delete', cookie, { confirm: email }), env);
    assert.equal(deleted.status, 200);
    assert.equal((await deleted.json() as { deleted: boolean }).deleted, true);
    for (const [table, where] of [
      ['user', 'id'], ['session', 'user_id'], ['account', 'user_id'], ['credit_lot', 'user_id'], ['credit_entry', 'user_id'], ['video_task', 'user_id'],
      ['invite_redemption', 'user_id'], ['account_checkin', 'user_id'], ['account_share', 'user_id'], ['account_referral_code', 'user_id'], ['account_referral_alias', 'user_id'],
    ]) assert.equal((await DB.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${where}=?`).bind(user.id).first<{ count: number }>())?.count, 0, table);
    assert.equal((await DB.prepare('SELECT COUNT(*) AS count FROM credit_alloc').first<{ count: number }>())?.count, 0);
    assert.equal((await DB.prepare('SELECT COUNT(*) AS count FROM verification WHERE id=?').bind('verify-delete').first<{ count: number }>())?.count, 0);
    assert.ok(await DB.prepare('SELECT id FROM user WHERE id=?').bind(other.user.id).first());
    assert.equal(await auth.api.getSession({ headers: new Headers({ cookie }) }), null);
    const login = await auth.handler(post('/api/auth/sign-in/email', '', { email, password }));
    assert.equal(login.ok, false);
    assert.equal((await deleteOwnAccount(post('/api/account/delete', cookie, { confirm: email }), env)).status, 401);
  } finally { await mf.dispose(); }
});
