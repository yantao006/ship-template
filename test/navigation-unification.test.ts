import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const sessionProps = /userName=\{session\?\.user\.name\} userEmail=\{session\?\.user\.email\} userImage=\{session\?\.user\.image\} credits=\{(?:credits|accountCredits)\}/;

test('pricing and workspace render the same account-aware header as home', () => {
  const home = read('src/components/sections/HomePage.tsx');
  const pricing = read('src/components/pricing-content.tsx');
  const workspace = read('src/components/workspace-content.tsx');
  const shell = read('src/components/workspace-shell.tsx');

  assert.match(home, /<Header locale=\{locale\}/);
  assert.match(pricing, /accountSnapshot\(env, requestHeaders\)/);
  assert.match(pricing, new RegExp(`<Header locale=\\{locale\\} ${sessionProps.source}`));
  assert.match(workspace, /accountSnapshot\(env, requestHeaders\)/);
  assert.match(workspace, sessionProps);
  assert.match(shell, /<Header locale=\{locale\} userName=\{userName\} userEmail=\{userEmail\} userImage=\{userImage\} credits=\{credits\} \/>/);
  assert.ok(!existsSync(new URL('../src/components/marketing-nav.tsx', import.meta.url)));
  assert.doesNotMatch(shell, /LanguageControl/);
  const pricingCss = read('src/components/pricing.css');
  assert.doesNotMatch(pricingCss, /\.site-nav|\.replica-topbar/);
  assert.match(pricingCss, /\.pricing-experience \{[^}]*padding-top: 56px/);
  const globals = read('src/app/globals.css');
  assert.doesNotMatch(globals, /\.site-nav|\.nav-inner|\.marketing-links/);
  assert.match(globals, /\.workspace-layout \{[^}]*padding-top: 56px/);
});
