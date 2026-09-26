import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import { createAuth, ensureSignupCredits, type AuthSettings } from '../src/lib/auth';
import { FakeEmail } from '../src/lib/email';
import { site, messages } from '../src/lib/config';
import { balance } from '../src/lib/ledger';
import type { Env } from '../src/lib/env';

const emailSettings: AuthSettings = { email: { enabled: true, requireVerification: false }, google: { enabled: false }, github: { enabled: false } };

test('verification disabled: email sign-up immediately creates a session and grants credits once', async () => {
  const mf = new Miniflare({ modules:true, script:'export default { fetch() { return new Response("ok") } }', d1Databases:{DB:'auth-test'} });
  try {
    const db = await mf.getD1Database('DB') as unknown as Env['DB'];
    for (const sql of readFileSync('migrations/0001_initial.sql','utf8').split(';').map(s=>s.trim()).filter(Boolean)) await db.prepare(sql).run();
    const env: Env = { DB: db, SITE_URL:'http://localhost:3000', LOCAL_AUTH_TEST:'1', BETTER_AUTH_SECRET:'this-is-only-a-local-test-secret-long-enough', GOOGLE_CLIENT_ID:'test-id', GOOGLE_CLIENT_SECRET:'test-secret' };
    const auth = createAuth(env, 'localhost', emailSettings);
    assert.equal(auth.options.baseURL,'http://localhost:3000');
    assert.equal(createAuth({...env,SITE_URL:'http://localhost:8787'}, 'localhost', emailSettings).options.baseURL,'http://localhost:8787');
    assert.throws(() => createAuth({...env,LOCAL_AUTH_TEST:undefined,SITE_URL:'https://another.example',GOOGLE_CLIENT_ID:'test-id',GOOGLE_CLIENT_SECRET:'test-secret'}),/SITE_URL must match/);
    const preview = createAuth({...env,LOCAL_AUTH_TEST:undefined,SITE_URL:site.url}, new URL(site.previewOrigin).hostname, {...emailSettings, google:{enabled:true}});
    assert.equal(preview.options.baseURL, site.previewOrigin);
    assert.ok(preview.options.trustedOrigins?.includes(site.previewOrigin));
    const result = await auth.api.signUpEmail({body:{ name:'Test User',email:'test@example.com',password:'a-long-local-test-password' }});
    assert.ok(result.user.id);
    assert.equal(await balance(db,result.user.id),30);
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM session').first<{n:number}>())?.n, 1);
    assert.equal(await ensureSignupCredits(env,result.user.id, false),false);
    assert.equal(await balance(db,result.user.id),30);
    const users = await db.prepare('SELECT COUNT(*) AS n FROM user').first<{n:number}>();
    assert.equal(users?.n,1);
  } finally { await mf.dispose(); }
});

test('Google sign-in starts with the configured local callback origin', async () => {
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'social-preview-test' } });
  try {
    const db = await mf.getD1Database('DB') as unknown as Env['DB'];
    for (const sql of readFileSync('migrations/0001_initial.sql', 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
    const env: Env = { DB: db, SITE_URL: 'http://localhost:8806', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: 'this-is-only-a-local-test-secret-long-enough', GOOGLE_CLIENT_ID: 'local-test-client', GOOGLE_CLIENT_SECRET: 'local-test-secret' };
    const settings = { ...emailSettings, google: { enabled: true } };
    const request = (origin: string) => new Request('http://localhost:8806/api/auth/sign-in/social', {
      method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ provider: 'google', callbackURL: '/en' }),
    });
    const auth = createAuth(env, 'localhost', settings);
    const started = await auth.handler(request('http://localhost:8806'));
    assert.equal(started.status, 200);
    const body = await started.json() as { url: string };
    const target = new URL(body.url);
    assert.equal(target.hostname, 'accounts.google.com');
    assert.equal(target.searchParams.get('redirect_uri'), 'http://localhost:8806/api/auth/callback/google');
  } finally { await mf.dispose(); }
});

test('verification required: signup and login are gated until emailed link is visited, then session and credits are issued once', async () => {
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'verify-test' } });
  try {
    const db = await mf.getD1Database('DB') as unknown as Env['DB'];
    for (const sql of readFileSync('migrations/0001_initial.sql', 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
    const env: Env = { DB: db, SITE_URL: 'http://localhost:3000', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: 'this-is-only-a-local-test-secret-long-enough' };
    const mail = new FakeEmail();
    const auth = createAuth(env, 'localhost', { ...emailSettings, email: { enabled: true, requireVerification: true } }, mail);
    const post = (path: string, body: object) => auth.handler(new Request(`http://localhost:3000/api/auth/${path}`, {
      method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' }, body: JSON.stringify(body),
    }));
    const signed = await post('sign-up/email', { name: 'Verify User', email: 'verify@example.com', password: 'long-password', callbackURL: '/en' });
    assert.equal(signed.status, 200);
    assert.equal(signed.headers.get('set-cookie'), null);
    const user = await db.prepare('SELECT id,email_verified FROM user WHERE email = ?').bind('verify@example.com').first<{id:string;email_verified:number}>();
    assert.ok(user?.id);
    assert.equal(user.email_verified, 0);
    assert.equal(await balance(db, user.id), 0);
    assert.equal(await ensureSignupCredits(env, user.id), false);
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM session').first<{n:number}>())?.n, 0);
    assert.equal(mail.sent.length, 1);
    assert.equal(mail.sent[0].from, site.email.from);
    assert.equal(mail.sent[0].to, 'verify@example.com');
    assert.equal(mail.sent[0].subject, `Verify your email for ${site.brand}`);
    assert.match(mail.sent[0].text, /verify-email\?token=/);
    const login = await post('sign-in/email', { email: 'verify@example.com', password: 'long-password' });
    assert.equal(login.status, 403);
    assert.equal((await login.json() as { code: string }).code, 'EMAIL_NOT_VERIFIED');
    assert.equal(mail.sent.length, 1);
    const resent = await post('send-verification-email', { email: 'verify@example.com', callbackURL: '/zh/dashboard?from=email&tab=credits' });
    assert.equal(resent.status, 200);
    assert.equal(mail.sent.length, 2);
    assert.equal(mail.sent[1].subject, '验证 Awesomejev Test Video 邮箱');
    assert.match(mail.sent[1].text, new RegExp(messages.zh.mail.verifyLead));
    const link = mail.sent[1].text.match(/https?:\/\/[^\s]+/)?.[0];
    assert.ok(link);
    const verified = await auth.handler(new Request(link));
    assert.equal(verified.status, 302);
    assert.equal(verified.headers.get('location'), '/zh/dashboard?from=email&tab=credits');
    assert.match(verified.headers.get('set-cookie') ?? '', /better-auth\.session_token/);
    assert.equal((await db.prepare('SELECT email_verified FROM user WHERE id = ?').bind(user.id).first<{email_verified:number}>())?.email_verified, 1);
    assert.equal(await balance(db, user.id), site.signupCredits);
    assert.equal(await ensureSignupCredits(env, user.id), false);
    await auth.handler(new Request(link));
    assert.equal(await balance(db, user.id), site.signupCredits);
  } finally { await mf.dispose(); }
});
