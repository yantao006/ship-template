import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import site from '../site/site.config';
import messages from '../site/messages';
import { pathForLocale } from '../src/components/shell/language-control';
import { informationIds, routePath } from '../src/lib/route-paths';
import { Footer } from '../src/components/shell/Footer';
import { InformationPage } from '../src/components/information/information-page';

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('footer copy, brand and contact are site-owned and localized', () => {
  const footer = source('src/components/shell/Footer.tsx');
  const page = source('src/components/information/information-page.tsx');
  assert.match(footer, /site\.brand/);
  assert.match(footer, /site\.logo\.src/);
  assert.match(footer, /site\.account\.contactEmail/);
  assert.match(footer, /messages\[locale\]\.footer/);
  assert.match(page, /messages\[locale\]\.footer/);
  assert.match(page, /site\.account\.contactEmail/);
  assert.doesNotMatch(footer + page, /MiniMax|minimaxh3\.ai|href=["']#["']|href=["']["']/);
  const keys = Object.keys(messages[site.defaultLocale as keyof typeof messages].footer).sort();
  for (const language of site.languages) {
    const copy = messages[language.code as keyof typeof messages].footer;
    assert.deepEqual(Object.keys(copy).sort(), keys);
    assert.ok(copy.description && copy.rights && copy.language);
    assert.deepEqual(Object.keys(copy.pages).sort(), [...informationIds].sort());
    for (const id of informationIds) {
      assert.ok(copy.pages[id].title && copy.pages[id].paragraphs.every(Boolean));
      assert.equal(routePath(language.code, id), `/${language.code}/${id}`);
      assert.match(source(`src/app/[locale]/(site)/${id}/page.tsx`), new RegExp(`id="${id}"`));
    }
  }
});

test('footer language row is driven by configured languages and preserves the route', () => {
  const footer = source('src/components/shell/Footer.tsx');
  const row = source('src/components/shell/FooterLanguages.tsx');
  assert.match(footer, /languages=\{site\.languages\}/);
  assert.match(row, /languages\.map\(language => <Link/);
  assert.match(row, /language\.flag/);
  assert.match(row, /pathForLocale\(pathname, language\.code, codes\)/);
  assert.match(row, /aria-current=\{language\.code === locale \? 'page' : undefined\}/);
  const codes = site.languages.map(language => language.code);
  for (const language of site.languages) {
    assert.ok(language.flag, `${language.code} needs a flag`);
    assert.equal(pathForLocale('/en/pricing', language.code, codes), routePath(language.code, 'pricing'));
    assert.equal(pathForLocale('/zh/privacy', language.code, codes), routePath(language.code, 'privacy'));
  }
  assert.equal(pathForLocale('/', 'zh', codes), '/zh/');
});

test('rendered footer and informational pages have real per-locale destinations', () => {
  for (const locale of ['en', 'zh'] as const) {
    const html = renderToStaticMarkup(createElement(PathnameContext.Provider, { value: routePath(locale, 'privacy') }, createElement(Footer, { locale })));
    const other = locale === 'en' ? 'zh' : 'en';
    assert.match(html, new RegExp(`href="${routePath(locale, 'about')}"`));
    assert.match(html, new RegExp(`href="${routePath(locale, 'terms')}"`));
    assert.match(html, new RegExp(`href="${routePath(other, 'privacy')}"`));
    assert.match(html, new RegExp(`href="mailto:${site.account.contactEmail}"`));
    assert.match(html, new RegExp(`lang="${locale}" aria-current="page" class="current"`));
    for (const language of site.languages) {
      assert.ok(html.includes(`<span aria-hidden="true">${language.flag}</span> ${language.name}`));
    }
    assert.ok(html.includes(site.brand));
    assert.ok(html.includes(messages[locale].footer.description));
    for (const id of informationIds) {
      const page = renderToStaticMarkup(createElement(InformationPage, { locale, id }));
      assert.ok(page.includes(messages[locale].footer.pages[id].title));
      assert.ok(page.includes(site.account.contactEmail));
    }
  }
});

test('footer links resolve to real content in the persistent shell only', () => {
  const footer = source('src/components/shell/Footer.tsx');
  assert.match(footer, /routePath\(locale, 'home'\).*#video-tool-section/);
  assert.match(source('src/components/home/sections/VideoToolSection.tsx'), /id="video-tool-section"/);
  for (const id of ['pricing', ...informationIds] as const) assert.match(footer, new RegExp(`routePath\\(locale, '${id}'\\)`));
  const shell = source('src/components/shell/site-shell.tsx');
  assert.match(shell, /<Footer locale=\{locale\} \/>/);
  for (const id of ['verify-email', 'reset-password']) {
    assert.doesNotMatch(source(`src/app/[locale]/${id}/page.tsx`), /SiteShell|Footer/);
  }
  assert.doesNotMatch(source('src/app/auth-callback/page.tsx'), /SiteShell|Footer/);
});
