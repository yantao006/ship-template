import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import ts from 'typescript';
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

test('modules do not import app routes or UI components', () => {
  const forbidden = (path: string, specifier: string) => {
    const target = specifier.startsWith('@/')
      ? join('src', specifier.slice(2))
      : specifier.startsWith('.') ? resolve(dirname(path), specifier) : null;
    return target !== null && /^(?:app|components)(?:\/|$)/.test(relative('src', target));
  };
  assert.equal(forbidden('src/modules/invites/service.ts', '@/components/example'), true);
  assert.equal(forbidden('src/modules/invites/service.ts', '../../app/example'), true);
  assert.equal(forbidden('src/modules/invites/service.ts', '../../lib/config'), false);

  for (const path of sources.filter(path => path.startsWith('src/modules/'))) {
    const file = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node) => {
      let specifier: string | undefined;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifier = node.moduleSpecifier.text;
      } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) {
        specifier = node.arguments[0].text;
      }
      if (specifier) assert.equal(forbidden(path, specifier), false, `${path} imports ${specifier}`);
      ts.forEachChild(node, visit);
    };
    visit(file);
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
    const copy = browserNavCopy(messages[locale]);
    assert.equal(copy.login, messages[locale].nav.login);
    assert.equal(Object.keys(copy).some(key => key.startsWith('resetMail')), false);
  }
});

test('video tool binding and browser-only nav copy happen before client props', () => {
  const section = readFileSync('src/components/home/sections/VideoToolSection.tsx', 'utf8');
  assert.match(section, /bindToolSite\(videoTool, copy, locale\)/);
  assert.doesNotMatch(readFileSync('src/components/video-tool/video-tool-section.tsx', 'utf8'), /@\/lib\/config/);
  const nav = readFileSync('site/messages/en/navigation.ts', 'utf8');
  const signIn = readFileSync('site/messages/en/sign-in.ts', 'utf8');
  for (const key of ['resetMailSubject', 'resetMailLead', 'resetMailAction', 'resetMailExpiry']) {
    assert.doesNotMatch(nav, new RegExp(key));
    assert.doesNotMatch(signIn, new RegExp(key));
    assert.match(readFileSync('site/messages/en/mail.ts', 'utf8'), new RegExp(key));
  }
});
