import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('one site main owns fixed-header clearance and footer placement', () => {
  const shell = read('src/components/site-shell.tsx');
  const globals = read('src/app/globals.css');
  const nav = read('src/components/blocks/replica-navigation.css');
  assert.match(shell, /<Header[^>]+\/>\s*<main className="site-main">\{children\}<\/main>\s*<Footer/);
  assert.match(globals, /\.public-shell \{[^}]*min-height: 100dvh/);
  assert.match(globals, /\.site-main \{[^}]*flex: 1;[^}]*padding-top: 56px/);
  assert.match(globals, /\.site-main > :is\(\.site-shell, \.workspace-page\) \{ flex: 1; \}/);
  assert.match(globals, /\.public-shell \{ padding-bottom: max\(75px, calc\(61px \+ env\(safe-area-inset-bottom\)\)\)/);
  assert.doesNotMatch(nav, /body:has\(\.replica-topbar\).*main \{ padding-(?:top|bottom)/);
});

test('site content does not add another viewport or landmark inside the shell', () => {
  for (const path of [
    'src/components/sections/HomePage.tsx',
    'src/components/pricing-checkout.tsx',
    'src/components/information-page.tsx',
    'src/components/commercial-license.tsx',
    'src/components/workspace-shell.tsx',
    'src/app/[locale]/(site)/account/layout.tsx',
  ]) assert.doesNotMatch(read(path), /<main\b/, path);
  for (const path of [
    'src/app/globals.css',
    'src/components/account-pages.css',
    'src/components/commercial-license.css',
    'src/components/pricing.css',
  ]) {
    const css = read(path);
    for (const selector of ['.site-shell', '.information-page', '.workspace-page', '.workspace-layout', '.account-pages', '.commercial-license-page', '.pricing-experience']) {
      const rule = css.match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`));
      if (rule) assert.doesNotMatch(rule[1], /min-height:\s*(?:100dvh|60dvh|450px|790px|630px)/, `${path}: ${selector}`);
    }
  }
  const globals = read('src/app/globals.css');
  assert.match(globals, /\.workspace-layout \{[^}]*flex: 1;/);
  assert.match(globals, /\.sidebar-footnote \{[^}]*margin: auto 12px 0/);
});
