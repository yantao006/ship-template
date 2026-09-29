import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import site from '../site/site.config';
import en from '../site/messages/en';
import zh from '../site/messages/zh';
import fixtureEn from '../fixtures/second-site/site/messages/en';
import fixtureZh from '../fixtures/second-site/site/messages/zh';
import { WhereItShines } from '../src/components/home/sections/WhereItShines';

const sectionNames = [
  ['VideoHero', 'video-hero'],
  ['VideoToolSection', 'video-tool-section'],
  ['VideoShowcase', 'video-showcase'],
  ['VideoFeatures', 'video-features'],
  ['VideoPricing', 'video-pricing'],
  ['VideoFAQ', 'video-faq'],
] as const;

const section = (name: string) => readFileSync(new URL(`../src/components/${name === 'Header' ? 'shell' : 'home/sections'}/${name}.tsx`, import.meta.url), 'utf8');

test('unfinished sections remain empty; the features slot renders the shine cards', () => {
  for (const [name, id] of sectionNames.filter(([name]) => !['VideoToolSection', 'VideoFeatures'].includes(name))) {
    assert.match(section(name), new RegExp(`return <section id="${id}" \\/>`));
    assert.deepEqual([...section(name).matchAll(/export function (\w+)/g)].map(match => match[1]), [name]);
  }
  const features = section('VideoFeatures');
  assert.match(features, /export function VideoFeatures/);
  assert.match(features, /<section id="video-features"><WhereItShines locale=\{locale\} \/><\/section>/);
  assert.match(section('HomePage'), /<VideoFeatures locale=\{locale\} \/>/);
  const shines = section('WhereItShines');
  assert.match(shines, /Gamepad2, Palette, ShoppingBag, Clapperboard/);
  assert.match(shines, /messages\[locale\]\.shines/);
  assert.match(shines, /site\.brand/);
  assert.doesNotMatch(shines, /MiniMax|minimaxh3\.ai|\bH3\b/);
});

test('shine cards render four localized use cases with the site brand and matching tag categories', () => {
  for (const [locale, copy] of [['en', en], ['zh', zh]] as const) {
    const html = renderToStaticMarkup(createElement(WhereItShines, { locale }));
    assert.match(html, new RegExp(site.brand));
    assert.equal((html.match(/class="video-shines__card"/g) ?? []).length, 4);
    assert.equal((html.match(/class="video-shines__tags"/g) ?? []).length, 4);
    assert.equal(copy.shines.items.length, 4);
    assert.deepEqual(copy.shines.items.map(item => item.tags.length), [3, 3, 3, 3]);
    for (const item of copy.shines.items) {
      assert.ok(html.includes(item.title));
      for (const tag of item.tags) assert.ok(html.includes(tag));
    }
    assert.doesNotMatch(JSON.stringify(copy.shines), /MiniMax|minimaxh3\.ai|\bH3\b/i);
  }
  for (const copy of [fixtureEn, fixtureZh]) {
    assert.equal(copy.shines.items.length, 4);
    assert.match(copy.shines.title, /\{brand\}/);
    assert.doesNotMatch(JSON.stringify(copy.shines), /MiniMax|minimaxh3\.ai|\bH3\b/i);
  }
});

test('shared navigation renders the site logo asset instead of a hard-coded mark', () => {
  assert.ok(site.logo.src.startsWith('/'));
  assert.ok(site.logo.alt);
  assert.match(readFileSync(new URL(`../public${site.logo.src}`, import.meta.url), 'utf8'), /<svg/);
  assert.match(section('Header'), /logo=\{site\.logo\}/);
  const navigation = readFileSync(new URL('../src/components/shell/replica-navigation.tsx', import.meta.url), 'utf8');
  assert.match(navigation, /src=\{logo\.src\}/);
  assert.match(navigation, /alt=\{logo\.alt\}/);
  assert.doesNotMatch(navigation, /brand-mark/);
  assert.doesNotMatch(readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8'), /brand-mark/);
});

test('homepage content composes six sections in order, with navigation and footer in the persistent shell', () => {
  const home = section('HomePage');
  const names = sectionNames.map(([name]) => name);
  assert.deepEqual([...home.matchAll(/<([A-Z]\w+)(?: [^>]+)? \/>/g)].map(match => match[1]), names);
  assert.match(section('VideoToolSection'), /import \{ VideoToolSection as ExistingVideoToolSection \} from '@\/components\/video-tool\/video-tool-section'/);
  assert.match(section('VideoToolSection'), /<ExistingVideoToolSection copy=\{copy\} config=\{config\} assets=\{assets\} \/>/);
  const entry = readFileSync(new URL('../src/components/home/home-content.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(entry, /MarketingNav/);
  assert.match(entry, /<HomePage locale=\{locale\} \/>/);
  assert.match(entry, /const \{ session \} = await accountSnapshot\(env, requestHeaders\)/);
  assert.match(readFileSync(new URL('../src/lib/request-context.ts', import.meta.url), 'utf8'), /await ensureSignupCredits\(env, session\.user\.id\)/);
  assert.doesNotMatch(home, /<Header|<Footer/);
  const shell = readFileSync(new URL('../src/components/shell/site-shell.tsx', import.meta.url), 'utf8');
  assert.match(shell, /<Header locale=\{locale\} userName=\{displayName\} userEmail=\{session\?\.user\.email\} userImage=\{session\?\.user\.image\} credits=\{credits\} \/>/);
  assert.match(shell, /<main className="site-main">\{children\}<\/main>\s*<Footer locale=\{locale\} \/>/);
  const header = section('Header');
  assert.match(header, /<section id="header">/);
  assert.match(header, /import \{ ReplicaNavigation \} from '\.\/replica-navigation'/);
  assert.match(header, /<HeaderAccountControl/);
  const accountControl = readFileSync(new URL('../src/components/account/header-account-control.tsx', import.meta.url), 'utf8');
  for (const field of ['language', 'navigation', 'lightMode', 'darkMode']) {
    assert.match(header, new RegExp(`copy\\.nav\\.${field}`));
  }
  assert.match(accountControl, /copy\.nav\.availableCredits/);
  assert.match(header, /logo=\{site\.logo\}/);
  assert.match(header, /brand=\{site\.brand\}/);
  assert.match(header, /navigationLinks\(locale\)/);
  assert.match(accountControl, /<AuthControl variant="avatar"/);
  assert.match(accountControl, /<AccountPopovers user=/);
  const block = readFileSync(new URL('../src/components/shell/replica-navigation.tsx', import.meta.url), 'utf8');
  assert.match(block, /export function ReplicaNavigation/);
  assert.match(block, /href=\{link\.href\}/);
  assert.match(accountControl, /credits !== undefined/);
  assert.match(block, /pathForLocale\(pathname, item\.code, locales\.map\(language => language\.code\)\)/);
  assert.doesNotMatch(block, /pricingHref|replica-credits-menu|creditsArea/);
  assert.match(block, /aria-current=\{activeHref === link\.href \? 'page' : undefined\}/);
  assert.match(block, /useDismissableLayer\(\{ active: !!open/);
  assert.doesNotMatch(block, /MiniMax|Awesomejev|AI Video|Explore|href="#"/);
});
