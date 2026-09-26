import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Miniflare } from 'miniflare';
import { createAuth, type AuthSettings } from '../src/lib/auth';
import { FakeEmail } from '../src/lib/email';
import { site, messages } from '../src/lib/config';
import { ResetPassword } from '../src/components/reset-password';
import type { Env } from '../src/lib/env';

const secret = 'this-is-only-a-local-test-secret-long-enough';
const base: AuthSettings = { email: { enabled: true, requireVerification: false, passwordReset: false }, google: { enabled: false }, github: { enabled: false } };

async function database(name: string) {
  const mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: name } });
  const db = await mf.getD1Database('DB') as unknown as Env['DB'];
  for (const sql of readFileSync('migrations/0001_initial.sql', 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
  return { mf, db };
}

test('password reset switch off hides the send path', async () => {
  const { mf, db } = await database('reset-off');
  try {
    const env: Env = { DB: db, SITE_URL: 'http://localhost:3000', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: secret };
    const mail = new FakeEmail();
    const auth = createAuth(env, 'localhost', base, mail);
    assert.equal(auth.options.emailAndPassword?.sendResetPassword, undefined);
    const signed = await auth.api.signUpEmail({ body: { name: 'Reset Off', email: 'off@example.com', password: 'long-password' } });
    assert.ok(signed.user.id);
    const response = await auth.handler(new Request('http://localhost:3000/api/auth/request-password-reset', {
      method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'off@example.com', redirectTo: '/en/reset-password' }),
    }));
    assert.equal(response.status, 400);
    assert.equal((await response.json() as { code: string }).code, 'RESET_PASSWORD_DISABLED');
    assert.equal(mail.sent.length, 0);
  } finally { await mf.dispose(); }
});

test('password reset switch on sends one link and the reset page token sets a new password', async () => {
  const { mf, db } = await database('reset-on');
  try {
    const env: Env = { DB: db, SITE_URL: 'http://localhost:3000', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: secret };
    const mail = new FakeEmail();
    const auth = createAuth(env, 'localhost', { ...base, email: { ...base.email, passwordReset: true } }, mail);
    assert.equal(typeof auth.options.emailAndPassword?.sendResetPassword, 'function');
    const post = (path: string, body: object) => auth.handler(new Request(`http://localhost:3000/api/auth/${path}`, {
      method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' }, body: JSON.stringify(body),
    }));
    const signed = await post('sign-up/email', { name: 'Reset On', email: 'on@example.com', password: 'long-password' });
    assert.equal(signed.status, 200);
    const requested = await post('request-password-reset', { email: 'on@example.com', redirectTo: '/zh/reset-password' });
    assert.equal(requested.status, 200);
    assert.equal(mail.sent.length, 1);
    assert.equal(mail.sent[0].from, site.email.from);
    assert.equal(mail.sent[0].to, 'on@example.com');
    assert.equal(mail.sent[0].subject, messages.zh.nav.resetMailSubject);
    assert.match(mail.sent[0].text, /\/api\/auth\/reset-password\//);
    const link = mail.sent[0].text.match(/https?:\/\/\S+/)?.[0];
    assert.ok(link);
    const callback = await auth.handler(new Request(link));
    assert.equal(callback.status, 302);
    const location = callback.headers.get('location') ?? '';
    const token = new URL(location, 'http://localhost:3000').searchParams.get('token');
    assert.equal(new URL(location).pathname, '/zh/reset-password');
    assert.ok(token);
    const page = renderToStaticMarkup(createElement(ResetPassword, { locale: 'zh', token, enabled: true, copy: messages.zh.nav }));
    assert.match(page, /type="password"/);
    assert.match(page, new RegExp(messages.zh.nav.updatePassword));
    const hidden = renderToStaticMarkup(createElement(ResetPassword, { locale: 'zh', token: '', enabled: false, copy: messages.zh.nav }));
    assert.doesNotMatch(hidden, /type="password"/);
    assert.match(hidden, new RegExp(messages.zh.nav.resetInvalid));
    const reset = await post('reset-password', { newPassword: 'newer-password', token });
    assert.equal(reset.status, 200);
    const oldLogin = await post('sign-in/email', { email: 'on@example.com', password: 'long-password' });
    assert.notEqual(oldLogin.status, 200);
    const newLogin = await post('sign-in/email', { email: 'on@example.com', password: 'newer-password' });
    assert.equal(newLogin.status, 200);
    const reused = await post('reset-password', { newPassword: 'another-password', token });
    assert.equal(reused.status, 400);
  } finally { await mf.dispose(); }
});
