import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import { createAuth, type AuthSettings } from '../src/lib/auth';
import { allowedDesktopTarget, handoffURL } from '../src/lib/desktop-auth';
import { hasInvite, redeemInvite, validateInvite } from '../src/lib/invites';
import type { Env } from '../src/lib/env';

const secret = 'this-is-only-a-local-test-secret-long-enough';
const settings: AuthSettings = { basePath: '/api/auth', email: { enabled: true }, google: { enabled: false }, github: { enabled: false } };
async function database(name: string) {
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: name } });
  const db = await mf.getD1Database('DB') as unknown as Env['DB'];
  for (const file of ['migrations/0001_initial.sql', 'migrations/0002_invite_codes.sql'])
    for (const sql of readFileSync(file, 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
  return { mf, db };
}

test('provider flags gate both auth endpoints and credentials; email session lives in D1', async () => {
  const { mf, db } = await database('options-test');
  try {
    const env: Env = { DB: db, SITE_URL: 'http://localhost:3000', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: secret };
    const emailAuth = createAuth(env, 'localhost', settings);
    assert.deepEqual(emailAuth.options.socialProviders, {});
    const signed = await emailAuth.api.signUpEmail({ body: { name: 'Email User', email: 'email@example.com', password: 'long-password' } });
    assert.ok(signed.user.id);
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM session').first<{ n: number }>())?.n, 1);
    const disabled = createAuth(env, 'localhost', { ...settings, email: { enabled: false } });
    const response = await disabled.handler(new Request('http://localhost:3000/api/auth/sign-up/email', { method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' }, body: JSON.stringify({ name: 'No', email: 'no@example.com', password: 'long-password' }) }));
    assert.notEqual(response.status, 200);
    const socialResponse = await emailAuth.handler(new Request('http://localhost:3000/api/auth/sign-in/social', { method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' }, body: JSON.stringify({ provider: 'github' }) }));
    assert.notEqual(socialResponse.status, 200);
    assert.throws(() => createAuth(env, 'localhost', { ...settings, github: { enabled: true } }), /GitHub credentials missing/);
    assert.throws(() => createAuth(env, 'localhost', { ...settings, google: { enabled: true } }), /Google credentials missing/);
    const github = createAuth({ ...env, GITHUB_CLIENT_ID: 'fake-id', GITHUB_CLIENT_SECRET: 'fake-secret' }, 'localhost', { ...settings, github: { enabled: true } });
    assert.ok(github.options.socialProviders?.github);
    assert.equal(github.options.socialProviders?.google, undefined);
  } finally { await mf.dispose(); }
});

test('invite redemption is capacity-limited and idempotent on D1', async () => {
  const { mf, db } = await database('invite-test');
  try {
    const code = 'A'.repeat(32);
    const now = Date.now();
    for (const id of ['one', 'two']) await db.prepare('INSERT INTO user(id,name,email,created_at,updated_at) VALUES(?,?,?,?,?)').bind(id,id,`${id}@example.com`,now,now).run();
    await db.prepare('INSERT INTO invite_code(code,max_uses,created_at) VALUES(?,?,?)').bind(code,1,now).run();
    const env = { DB: db } as Env;
    assert.equal(await validateInvite(env, code, true), true);
    assert.equal(await hasInvite(env, 'one', true), false);
    assert.equal(await redeemInvite(env, 'one', code, true), true);
    assert.equal(await redeemInvite(env, 'one', code, true), false);
    assert.equal(await redeemInvite(env, 'two', code, true), false);
    assert.equal(await hasInvite(env, 'one', true), true);
    assert.equal(await hasInvite(env, 'two', true), false);
    assert.equal((await db.prepare('SELECT used_count FROM invite_code').first<{used_count:number}>())?.used_count, 1);
  } finally { await mf.dispose(); }
});

test('desktop handoff rejects unsafe and unconfigured schemes', () => {
  assert.equal(allowedDesktopTarget('myapp://auth/callback', []), null);
  assert.equal(allowedDesktopTarget('javascript://auth/callback', ['javascript']), null);
  assert.equal(allowedDesktopTarget('https://evil.example', ['https']), null);
  assert.equal(allowedDesktopTarget('myapp://auth/callback', ['myapp']), 'myapp://auth/callback');
  assert.equal(handoffURL('myapp://auth/callback?from=web', 'opaque-token'), 'myapp://auth/callback?from=web&token=opaque-token');
});
