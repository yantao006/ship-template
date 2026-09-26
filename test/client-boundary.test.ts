import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import messages from '../site/messages';
import { browserNavCopy } from '../src/lib/browser-nav-copy';
import { requestJson } from '../src/lib/json-request';

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

const sources = sourceFiles('src');
const clients = sources.filter(path => readFileSync(path, 'utf8').startsWith("'use client';"));

test('client entries do not value-import site configuration or server route copy', () => {
  for (const path of clients) {
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(source, /import\s+(?!type\b)[^;]+from\s+['"]@\/lib\/config['"]/, path);
    assert.doesNotMatch(source, /from\s+['"]@\/lib\/(routes|plan-copy)['"]/, path);
  }
});

test('one browser auth client and one referral owner', () => {
  const creators = sources.filter(path => /\bcreateAuthClient\s*\(/.test(readFileSync(path, 'utf8')));
  assert.deepEqual(creators, ['src/lib/auth-client.ts']);
  const owners = sources.filter(path => /sessionStorage\.setItem\(pendingKey,/.test(readFileSync(path, 'utf8')));
  assert.deepEqual(owners, ['src/lib/use-referral-claim.ts']);
});

test('JSON writes preserve status handling and exact payload', async () => {
  const original = globalThis.fetch;
  const seen: { url: string; init: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => { seen.push({ url: String(url), init: init! }); return new Response(null, { status: 409 }); };
  try {
    const response = await requestJson('/api/invites', { code: 'abc' }, 'DELETE');
    assert.equal(response.status, 409);
    assert.equal(seen[0].url, '/api/invites');
    assert.equal(seen[0].init.method, 'DELETE');
    assert.deepEqual(seen[0].init.headers, { 'Content-Type': 'application/json' });
    assert.equal(seen[0].init.body, '{"code":"abc"}');
  } finally { globalThis.fetch = original; }
});

test('browser nav copy excludes mail-only text in either language', () => {
  for (const locale of ['en', 'zh'] as const) {
    const copy = browserNavCopy(messages[locale].nav);
    assert.equal(copy.login, messages[locale].nav.login);
    assert.equal(Object.keys(copy).some(key => key.startsWith('resetMail')), false);
  }
});

test('video tool binding and browser-only nav copy happen before client props', () => {
  const section = readFileSync('src/components/sections/VideoToolSection.tsx', 'utf8');
  assert.match(section, /bindToolSite\(videoTool, copy, locale\)/);
  assert.doesNotMatch(readFileSync('src/components/video-tool/video-tool-section.tsx', 'utf8'), /@\/lib\/config/);
  const copy = readFileSync('src/lib/browser-nav-copy.ts', 'utf8');
  for (const key of ['resetMailSubject', 'resetMailLead', 'resetMailAction', 'resetMailExpiry']) assert.match(copy, new RegExp(key));
});
