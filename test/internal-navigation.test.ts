import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const source = (path: string) => readFileSync(`src/components/${path}.tsx`, 'utf8');

test('dashboard and credits share a persistent layout with pathname-aware client links', () => {
  const root = 'src/app/[locale]/(site)/(workspace)';
  assert.ok(existsSync(`${root}/layout.tsx`));
  assert.ok(existsSync(`${root}/dashboard/page.tsx`));
  assert.ok(existsSync(`${root}/credits/page.tsx`));
  const layout = readFileSync(`${root}/layout.tsx`, 'utf8');
  assert.match(layout, /<WorkspaceShell[^>]+>\{children\}<\/WorkspaceShell>/);
  const sidebar = source('workspace/workspace-section-nav');
  assert.match(sidebar, /usePathname\(\)/);
  assert.match(sidebar, /from 'next\/link'/);
  assert.match(sidebar, /<Link key=\{link.id\}/);
  assert.doesNotMatch(sidebar, /<a\b/);
  assert.match(source('workspace/workspace-shell'), /<WorkspaceSectionNav/);
  const content = source('workspace/workspace-content');
  for (const destination of ['home', 'credits', 'pricing']) assert.match(content, new RegExp(`<Link href=\\{routePath\\(locale, '${destination}'\\)\\}`));
  assert.doesNotMatch(content, /<a\b/);
});

test('account, video tool and auth internal entries navigate with Link while external mail remains an anchor', () => {
  assert.match(source('account/account-pages-content'), /<Link className="ui-button-solid" href=\{routePath\(locale, 'pricing'\)\}/);
  assert.match(source('account/account-pages-content'), /<a[^>]+mailto:/);
  for (const file of ['video-tool/composer', 'video-tool/stage']) {
    const content = source(file);
    assert.match(content, /from 'next\/link'/);
    assert.match(content, /<Link (?:key=\{link.id\} )?href=\{(?:promo|link)\.href\}/);
    assert.match(content, /!\w+\.href\.includes\('\{locale\}'\)/);
  }
  const card = source('auth/minimax-auth-card');
  for (const id of ['terms', 'privacy', 'verifyEmail']) assert.match(card, new RegExp(`<Link href=\\{[^>]*routePath\\(locale, '${id}'\\)`));
  assert.match(source('auth/sign-in-card'), /<Link className="auth-switch" href=\{`\$\{verifyPath\}/);
  for (const file of ['verify-email', 'reset-password']) {
    assert.match(source(`auth/${file}`), /<Link className="auth-switch" href=\{routePath\(locale, 'home'\)\}/);
  }
});
