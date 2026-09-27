import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { safeReturnPath } from '../src/components/auth-dialog';
import { Auth4 } from '../src/components/blocks/auth-4';
import { browserNavCopy } from '../src/lib/browser-nav-copy';
import { messages } from '../src/lib/config';
import auth from '../site/auth.config';

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('OAuth return paths cannot leave the site and keep locale, query and hash', () => {
  const origin = 'https://awesomejev.link';
  assert.equal(safeReturnPath('/zh/pricing?billing=year#plans', origin), '/zh/pricing?billing=year#plans');
  for (const path of ['https://evil.example/', '//evil.example/', '/\\evil.example', '\n/other']) {
    assert.equal(safeReturnPath(path, origin), '/');
  }
});

test('Auth-4 renders only configured providers with real site copy', () => {
  // The Node tsx test runner uses classic JSX; Next builds this component with
  // the automatic runtime. Supply React for this server-rendered markup check.
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
  const markup = renderToStaticMarkup(React.createElement(Auth4, {
    copy: browserNavCopy(messages.en), brand: 'AwesomeJev',
    supportEmail: 'support@example.com', methods: { email: auth.email, google: auth.google, github: auth.github },
    inviteRequired: false, locale: 'en', callbackURL: '/', onAuthenticated: async () => {},
  }));
  assert.match(markup, /Continue with Google/);
  assert.match(markup, /AwesomeJev/);
  assert.match(markup, /Sign in to access your workspace and credits/);
  assert.doesNotMatch(markup, /Preview the request/);
  assert.match(markup, /type="email"/);
  assert.doesNotMatch(markup, /Continue with GitHub|Northstar|placeholder\.svg|SSO enforced/);
});

test('Auth-4 loads Tailwind theme tokens without resetting the existing site', () => {
  const css = source('src/app/globals.css');
  assert.match(css, /@import "tailwindcss\/theme" layer\(theme\);[\s\S]*@import "tailwindcss\/utilities"/);
  assert.doesNotMatch(css, /@import "tailwindcss";|@import "tailwindcss\/preflight"/);
});

test('one shared Auth-4 dialog uses server session confirmation and does not replay checkout', () => {
  const shell = source('src/components/site-shell.tsx');
  const provider = source('src/components/auth-dialog.tsx');
  const auth4 = source('src/components/blocks/auth-4.tsx');
  const pricing = source('src/components/pricing-checkout.tsx');
  assert.match(shell, /<AuthDialogProvider/);
  assert.match(provider, /createPortal\(/);
  assert.match(provider, /\/api\/auth\/get-session/);
  assert.match(provider, /if \(!\(await serverHasSession\(\)\)\)/);
  assert.match(auth4, /authClient\.signIn\.email/);
  assert.match(auth4, /authClient\.signIn\.social/);
  assert.doesNotMatch(auth4, /console\.log|placeholder\.svg|SSO enforced/);
  assert.match(pricing, /result\.status === 401[\s\S]*openAuth/);
  assert.doesNotMatch(provider, /requestJson\('\/api\/checkout'/);
  const tool = source('src/components/video-tool/use-video-tool-state.ts');
  assert.match(provider, /site-auth-oauth-start/);
  assert.match(tool, /sessionStorage\.setItem\(authDraftKey/);
  assert.match(tool, /sessionStorage\.removeItem\(authDraftKey/);
  assert.match(tool, /\/api\/auth\/get-session/);
  assert.doesNotMatch(tool, /sessionStorage\.setItem\(authDraftKey, JSON\.stringify\(buildCreatePayload/);
});
