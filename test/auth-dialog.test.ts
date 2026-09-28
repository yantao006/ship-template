import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { safeReturnPath } from '../src/components/auth-dialog';
import { Auth4 } from '../src/components/blocks/auth-4';
import { MinimaxAuthCard } from '../src/components/blocks/minimax-auth-card';
import { browserNavCopy } from '../src/lib/browser-nav-copy';
import { messages, site, theme } from '../src/lib/config';
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
  assert.match(markup, /Send sign-in code/);
  assert.doesNotMatch(markup, /name="password"|type="password"/);
  assert.doesNotMatch(markup, /Continue with GitHub|Northstar|placeholder\.svg|SSO enforced/);
});

test('source-inspired card uses site identity, localized benefits and configured credits without changing Auth-4', () => {
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
  const original = source('src/components/blocks/auth-4.tsx');
  assert.match(original, /export function Auth4/);
  assert.doesNotMatch(original, /MinimaxAuthCard|auth-card-canvas/);
  for (const locale of ['en', 'zh'] as const) {
    const markup = renderToStaticMarkup(React.createElement(MinimaxAuthCard, {
      copy: browserNavCopy(messages[locale]), card: messages[locale].signIn.card,
      brand: site.brand, logo: site.logo, signupCredits: site.signupCredits,
      supportEmail: site.account.contactEmail,
      methods: { email: auth.email, google: auth.google, github: auth.github },
      inviteRequired: auth.invite.required, locale, callbackURL: '/', onAuthenticated: async () => {},
    }));
    assert.match(markup, new RegExp(site.brand));
    assert.match(markup, new RegExp(`${site.signupCredits} credits|${site.signupCredits} 积分`));
    assert.match(markup, new RegExp(`/${locale}/terms`));
    assert.match(markup, new RegExp(`/${locale}/privacy`));
    assert.match(markup, /professional-headshot.webp/);
    assert.doesNotMatch(markup, /MiniMax H3 video generation|Sign-up with Google|Continue with GitHub|type="password"/);
  }
  const variant = source('src/components/blocks/minimax-auth-card.tsx');
  assert.match(variant, /minimax-auth-email-group[\s\S]*minimax-auth-divider[\s\S]*minimax-auth-inline-form/);
  const variantCss = source('src/components/blocks/minimax-auth-card.css');
  assert.match(variantCss, /\.minimax-auth-email-group \{ display: flex; flex-direction: column/);
  assert.match(variantCss, /\.minimax-auth-email-group\.is-expanded \{ gap: 12px/);
  assert.doesNotMatch(variantCss, /\.minimax-auth-inline-form \{[^}]*margin-top:/);
  const codeDialog = source('src/components/blocks/auth-6.tsx');
  assert.match(variant, /authClient\.emailOtp\.sendVerificationOtp/);
  assert.match(variant, /if \(sent\.error\) setError\(copy\.codeSendFailed\);\s*else openCode\(\)/);
  assert.match(variant, /<Auth6 email=\{sentEmail\}/);
  assert.doesNotMatch(variant, /name="otp"|emailStep/);
  assert.match(codeDialog, /authClient\.signIn\.emailOtp/);
  assert.match(codeDialog, /authClient\.emailOtp\.sendVerificationOtp/);
  assert.match(codeDialog, /onAuthenticated\(\)/);
  assert.match(codeDialog, /\[0, 1, 2\]\.map\(renderInput\)[\s\S]*auth6-separator[\s\S]*\[3, 4, 5\]\.map\(renderInput\)/);
  assert.match(codeDialog, /onKeyDown=\{event => handleKeyDown[\s\S]*onPaste=\{handlePaste\}/);
  assert.doesNotMatch(codeDialog, /console\.log|min-h-screen|amara@lumen\.co/);
  assert.equal(messages.en.signIn.codeTitle, 'Enter Verification Code');
  assert.equal(messages.en.signIn.codeExpiry, 'Code expires in 15 minutes');
  assert.equal(messages.en.signIn.verifyCode, 'Verify & Sign In');
  assert.equal(messages.en.signIn.differentEmail, 'Use a different email');
  assert.match(variant, /onAuthenticated\('email-code'\)/);
  assert.match(variant, /onAuthenticated\('sign-up'\)/);
  assert.doesNotMatch(variant, /authClient\.signIn\.email\(/);
  assert.equal(theme.authCard.light.button, '#0a0a0a');
  assert.equal(theme.authCard.dark.button, '#7a5bff');
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
  assert.match(provider, /active: open && !codeOpen/);
  assert.match(provider, /hidden=\{codeOpen\} inert=\{codeOpen\}/);
  assert.match(provider, /onCloseAuth=\{closeAuth\}/);
  assert.match(source('src/components/blocks/minimax-auth-card.tsx'), /onClose=\{onCloseAuth \?\? closeCode\}/);
  assert.match(provider, /\/api\/auth\/get-session/);
  assert.match(provider, /if \(!\(await serverHasSession\(\)\)\)/);
  // The guest avatar renders the dialog before the session request can stall it.
  assert.match(source('src/components/auth-control.tsx'), /className="replica-avatar"[\s\S]*?showImmediately: true/);
  assert.match(provider, /const immediateAttempt = options\.showImmediately \? showDialog\(\) : null;[\s\S]*await serverHasSession\(\)/);
  assert.match(provider, /attempt\.current !== immediateAttempt\) return false/);
  assert.match(auth4, /authClient\.emailOtp\.sendVerificationOtp/);
  assert.match(auth4, /authClient\.signIn\.emailOtp/);
  assert.match(source('src/app/api/auth/[...all]/route.ts'), /parsed\.body\.type !== 'sign-in'/);
  assert.doesNotMatch(auth4, /authClient\.signIn\.email\(/);
  assert.match(auth4, /authClient\.signIn\.social/);
  assert.doesNotMatch(auth4, /console\.log|placeholder\.svg|SSO enforced/);
  assert.match(pricing, /result\.status === 401[\s\S]*openAuth/);
  assert.doesNotMatch(provider, /requestJson\('\/api\/checkout'/);
  const tool = source('src/components/video-tool/use-video-tool-state.ts');
  assert.match(provider, /site-auth-oauth-start/);
  assert.match(provider, /method === 'sign-up'[\s\S]*closeAuth\(\)[\s\S]*router\.refresh\(\)/);
  assert.match(provider, /site-auth-reload-start[\s\S]*setOpen\(false\)[\s\S]*window\.location\.reload\(\)/);
  assert.match(auth4, /onAuthenticated\('email-code'\)/);
  assert.match(source('src/app/globals.css'), /@media \(max-width: 767px\)[\s\S]*auth4-overlay \{ display: flex; align-items: flex-end/);
  assert.match(tool, /site-auth-reload-start/);
  assert.match(tool, /sessionStorage\.setItem\(authDraftKey/);
  assert.match(tool, /sessionStorage\.removeItem\(authDraftKey/);
  assert.match(tool, /\/api\/auth\/get-session/);
  assert.doesNotMatch(tool, /sessionStorage\.setItem\(authDraftKey, JSON\.stringify\(buildCreatePayload/);
});
