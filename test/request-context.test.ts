import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { browserWriteAllowed, readJson } from '../src/lib/request-context';
import { site } from '../src/lib/config';
import type { Env } from '../src/lib/env';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item =>
    item.isDirectory() ? sourceFiles(join(directory, item.name)) : item.name.endsWith('.ts') || item.name.endsWith('.tsx') ? [join(directory, item.name)] : []);
}

test('session lookups have one owner in request-context', () => {
  const callers = sourceFiles('src').filter(file => /\.api\.getSession\s*\(/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(callers, ['src/lib/request-context.ts']);
});

test('every write route calls the shared browser write guard', () => {
  const routes = [
    'auth/[...all]', 'auth/desktop-handoff', 'checkout', 'account/activity',
    'webhooks/payment', 'invites/validate', 'invites/redeem', 'invites',
  ];
  for (const route of routes) {
    const content = readFileSync(`src/app/api/${route}/route.ts`, 'utf8');
    assert.match(content, /browserWriteAllowed\(request, env/, route);
  }
});

test('browser writes preserve origin policy and refuse an explicit cross-site mark', () => {
  const env = { SITE_URL: 'http://localhost:8817', LOCAL_AUTH_TEST: '1' } as Env;
  const request = (origin?: string, fetchSite?: string) => new Request(`${site.url}/api/checkout`, {
    method: 'POST', headers: { ...(origin ? { origin } : {}), ...(fetchSite ? { 'sec-fetch-site': fetchSite } : {}) },
  });
  const configured = [site.url, `https://www.${site.apex}`, site.previewOrigin];
  for (const origin of configured) {
    assert.equal(browserWriteAllowed(request(origin), env), true, origin);
    assert.equal(browserWriteAllowed(request(origin, 'same-origin'), env), true, origin);
    assert.equal(browserWriteAllowed(request(origin, 'cross-site'), env), false, origin);
  }
  for (const origin of [undefined, 'https://outside.example', 'null', env.SITE_URL]) {
    assert.equal(browserWriteAllowed(request(origin), env), false, String(origin));
    assert.equal(browserWriteAllowed(request(origin, 'cross-site'), env), false, String(origin));
  }
  assert.equal(browserWriteAllowed(request(env.SITE_URL), env, { allowLocalTest: true }), true);
  assert.equal(browserWriteAllowed(request(env.SITE_URL, 'cross-site'), env, { allowLocalTest: true }), false);
  assert.equal(browserWriteAllowed(request(env.SITE_URL), { ...env, LOCAL_AUTH_TEST: undefined }, { allowLocalTest: true }), false);
  assert.equal(browserWriteAllowed(request('http://127.0.0.1:8817'), { ...env, SITE_URL: 'http://127.0.0.1:8817' }, { allowLocalTest: true }), true);
  assert.equal(browserWriteAllowed(request('http://localhost:8817'), { ...env, SITE_URL: 'https://localhost:8817' }, { allowLocalTest: true }), false);
  // Public invite validation and signed payment callbacks accepted originless and foreign-origin callers.
  for (const origin of [undefined, 'https://outside.example']) {
    assert.equal(browserWriteAllowed(request(origin), env, { originRequired: false, allowAnyOrigin: true }), true);
    assert.equal(browserWriteAllowed(request(origin, 'cross-site'), env, { originRequired: false, allowAnyOrigin: true }), false);
  }
  // Better Auth already handles its own originless callers.
  assert.equal(browserWriteAllowed(request(), env, { originRequired: false, allowLocalTest: true }), true);
});

test('JSON reader reports malformed request without changing response policy', async () => {
  const good = await readJson<{ action: string }>(new Request(site.url, { method: 'POST', body: '{"action":"checkin"}' }));
  assert.deepEqual(good, { ok: true, body: { action: 'checkin' } });
  assert.deepEqual(await readJson(new Request(site.url, { method: 'POST', body: '{' })), { ok: false });
});
