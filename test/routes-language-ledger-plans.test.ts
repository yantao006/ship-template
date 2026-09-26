import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import site from '../site/site.config';
import messages from '../site/messages';
import { languageFor, localeFor } from '../src/lib/config';
import { ledgerSourceLabel, ledgerSources, paidLedgerSources } from '../src/lib/ledger';
import { planCopy } from '../src/lib/plan-copy';
import { localeFromPath, navigationLinks, requestLocaleHeader, routePath, routes } from '../src/lib/routes';
import { middleware } from '../src/middleware';

function* sourceFiles(dir: string): Generator<string> {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) yield* sourceFiles(path);
    else if (/\.tsx?$/.test(item.name)) yield path;
  }
}

test('one route table supplies locale paths and ordered navigation, without copied path literals', () => {
  for (const locale of site.locales) {
    assert.deepEqual(navigationLinks(locale).map(link => link.id), ['home', 'pricing', 'dashboard', 'credits']);
    for (const link of navigationLinks(locale)) {
      assert.equal(link.href, routePath(locale, link.id));
      assert.ok(link.label && link.icon);
    }
    for (const id of Object.keys(routes) as (keyof typeof routes)[]) assert.ok(routePath(locale, id).startsWith(`/${locale}`));
  }
  assert.equal(routePath('zh', 'credits'), '/zh/credits');
  for (const file of sourceFiles('src')) {
    if (file.endsWith('/lib/routes.ts')) continue;
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\/\$\{(?:locale|code)\}(?:\/(?:pricing|credits|dashboard|verify-email|reset-password)|\$?\{)/, file);
    assert.doesNotMatch(source, /\/\$\{(?:locale|code)\}`/, file);
  }
});

test('configured language entries drive page locale, native name and date locale', () => {
  assert.deepEqual(site.locales, site.languages.map(language => language.code));
  for (const language of site.languages) {
    assert.equal(localeFromPath(`/${language.code}/credits`), language.code);
    assert.equal(localeFor(language.code), language.code);
    assert.equal(languageFor(language.code).name, language.name);
    assert.ok(language.dateLocale);
    assert.ok(messages[language.code].metadata.description);
  }
  assert.equal(localeFromPath('/'), site.defaultLocale);
  assert.equal(localeFromPath('/not-a-locale'), site.defaultLocale);
  for (const [path, expected] of [['/zh/credits', 'zh'], ['/', site.defaultLocale], ['/en/pricing', 'en']] as const) {
    const response = middleware(new NextRequest(`https://awesomejev.link${path}`));
    assert.equal(response.headers.get(`x-middleware-request-${requestLocaleHeader}`), expected);
  }
  const layout = readFileSync('src/app/layout.tsx', 'utf8');
  assert.match(layout, /<html lang=\{locale\}/);
  assert.match(layout, /description: messages\[locale\]\.metadata\.description/);
  assert.match(readFileSync('src/middleware.ts', 'utf8'), /headers\.set\(requestLocaleHeader, localeFromPath\(request\.nextUrl\.pathname\)\)/);
  assert.match(readFileSync('src/app/page.tsx', 'utf8'), /HomeContent/);
});

test('all ledger sources have translated copy, and the receipt query uses the paid registry', () => {
  assert.deepEqual(paidLedgerSources, ['payment', 'subscription_month']);
  for (const language of site.languages) {
    assert.deepEqual(Object.keys(messages[language.code].credits.sources).sort(), Object.keys(ledgerSources).sort());
    for (const source of Object.keys(ledgerSources)) {
      const label = ledgerSourceLabel(language.code, source);
      assert.ok(label.trim(), `${language.code} ${source}`);
      assert.notEqual(label, source, `${language.code} ${source}`);
    }
  }
  assert.equal(ledgerSourceLabel('zh', 'checkin'), '每日签到');
  assert.equal(ledgerSourceLabel('zh', 'referral_inviter'), '邀请好友奖励');
  assert.equal(ledgerSourceLabel('zh', 'referral_friend'), '好友推荐奖励');
  assert.match(readFileSync('src/lib/account-rewards.ts', 'utf8'), /paidLedgerSources\.map/);
});

test('every configured plan has id-based names and descriptions in every language', () => {
  for (const language of site.languages) {
    assert.deepEqual(Object.keys(messages[language.code].planCopy).sort(), site.plans.map(plan => plan.id).sort());
    for (const plan of site.plans) {
      const copy = planCopy(language.code, plan.id);
      assert.ok(copy.name.trim());
      assert.ok(copy.detail.trim());
    }
  }
  assert.throws(() => planCopy('en', 'unknown'), /Missing plan copy/);
  assert.match(readFileSync('src/components/pricing-content.tsx', 'utf8'), /planCopy\(locale, plan\.id\)/);
  assert.match(readFileSync('src/components/blocks/account-popovers.tsx', 'utf8'), /planCopy\(locale as keyof typeof messages, plan\.id\)/);
});
