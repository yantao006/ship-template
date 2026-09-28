import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('marketing and workspace routes share persistent chrome while auth panels stay outside it', () => {
  const shell = read('src/components/site-shell.tsx');
  assert.match(shell, /accountSnapshot\(workerEnv\(\), await headers\(\)\)/);
  assert.match(shell, /<Header locale=\{locale\} userName=\{displayName\} userEmail=\{session\?\.user\.email\} userImage=\{session\?\.user\.image\} credits=\{credits\} \/>/);
  assert.match(shell, /<main className="site-main">\{children\}<\/main>\s*<Footer locale=\{locale\} \/>/);
  assert.match(read('src/app/(site)/layout.tsx'), /<SiteShell/);
  assert.match(read('src/app/[locale]/(site)/layout.tsx'), /<SiteShell/);
  for (const route of ['page.tsx', 'pricing/page.tsx', '(workspace)/layout.tsx', '(workspace)/dashboard/page.tsx', '(workspace)/credits/page.tsx']) {
    assert.ok(existsSync(new URL(`../src/app/[locale]/(site)/${route}`, import.meta.url)));
  }
  for (const route of ['verify-email', 'reset-password']) {
    assert.ok(existsSync(new URL(`../src/app/[locale]/${route}/page.tsx`, import.meta.url)));
    assert.ok(!existsSync(new URL(`../src/app/[locale]/(site)/${route}`, import.meta.url)));
  }
  assert.ok(existsSync(new URL('../src/app/auth-callback/page.tsx', import.meta.url)));
  assert.ok(existsSync(new URL('../src/app/admin/invites/page.tsx', import.meta.url)));
  assert.ok(!existsSync(new URL('../src/components/marketing-nav.tsx', import.meta.url)));

  for (const path of ['src/components/sections/HomePage.tsx', 'src/components/pricing-content.tsx', 'src/components/workspace-shell.tsx']) {
    assert.doesNotMatch(read(path), /<Header|<Footer/);
  }
  const workspace = read('src/components/workspace-shell.tsx');
  assert.match(workspace, /link\.id === 'dashboard' \|\| link\.id === 'credits'/);
  assert.match(read('src/components/workspace-section-nav.tsx'), /usePathname/);
  assert.doesNotMatch(workspace, /LanguageControl/);
  const pricingCss = read('src/components/pricing.css');
  assert.doesNotMatch(pricingCss, /\.site-nav|\.replica-topbar/);
  assert.doesNotMatch(pricingCss, /\.pricing-experience \{[^}]*(?:min-height: 100dvh|padding-top: 56px)/);
  const globals = read('src/app/globals.css');
  assert.doesNotMatch(globals, /\.site-nav|\.nav-inner|\.marketing-links/);
  assert.match(globals, /\.site-main \{[^}]*flex: 1;[^}]*padding-top: 56px/);
  assert.doesNotMatch(globals, /\.workspace-layout \{[^}]*100dvh/);
});
