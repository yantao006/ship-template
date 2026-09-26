import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import site from '../site/site.config';

const sectionNames = [
  ['Header', 'header'],
  ['VideoHero', 'video-hero'],
  ['VideoToolSection', 'video-tool-section'],
  ['VideoShowcase', 'video-showcase'],
  ['VideoFeatures', 'video-features'],
  ['VideoPricing', 'video-pricing'],
  ['VideoFAQ', 'video-faq'],
  ['Footer', 'footer'],
] as const;

const section = (name: string) => readFileSync(new URL(`../src/components/sections/${name}.tsx`, import.meta.url), 'utf8');

test('unfinished sections are empty with stable ids', () => {
  for (const [name, id] of sectionNames.filter(([name]) => name !== 'VideoToolSection' && name !== 'Header')) {
    assert.match(section(name), new RegExp(`return <section id="${id}" \\/>`));
    assert.deepEqual([...section(name).matchAll(/export function (\w+)/g)].map(match => match[1]), [name]);
  }
});

test('both navigation variants render the site logo asset instead of a hard-coded mark', () => {
  assert.ok(site.logo.src.startsWith('/'));
  assert.ok(site.logo.alt);
  assert.match(readFileSync(new URL(`../public${site.logo.src}`, import.meta.url), 'utf8'), /<svg/);
  const marketing = readFileSync(new URL('../src/components/marketing-nav.tsx', import.meta.url), 'utf8');
  assert.match(marketing, /site\.logo\.src/);
  assert.match(marketing, /site\.logo\.alt/);
  assert.doesNotMatch(marketing, /brand-mark/);
  assert.doesNotMatch(readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8'), /brand-mark/);
});

test('homepage composes eight sections in order, using the configured navigation and existing video tool', () => {
  const home = section('HomePage');
  const names = sectionNames.map(([name]) => name);
  assert.deepEqual([...home.matchAll(/<([A-Z]\w+)(?: [^>]+)? \/>/g)].map(match => match[1]), names);
  assert.match(section('VideoToolSection'), /import \{ VideoToolSection as ExistingVideoToolSection \} from '@\/components\/video-tool\/video-tool-section'/);
  assert.match(section('VideoToolSection'), /<ExistingVideoToolSection copy=\{copy\} config=\{config\} assets=\{assets\} \/>/);
  const entry = readFileSync(new URL('../src/components/home-content.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(entry, /MarketingNav/);
  assert.match(entry, /<HomePage locale=\{locale\} userName=\{session\?\.user\.name\} userEmail=\{session\?\.user\.email\} userImage=\{session\?\.user\.image\} credits=\{credits\} \/>/);
  assert.match(entry, /const \{ session, credits \} = await accountSnapshot\(env, requestHeaders\)/);
  assert.match(readFileSync(new URL('../src/lib/request-context.ts', import.meta.url), 'utf8'), /await ensureSignupCredits\(env, session\.user\.id\)/);
  assert.match(home, /<Header locale=\{locale\} userName=\{userName\} userEmail=\{userEmail\} userImage=\{userImage\} credits=\{credits\} \/>/);
  const header = section('Header');
  assert.match(header, /<section id="header">/);
  assert.match(header, /import \{ ReplicaNavigation \} from '@\/components\/blocks\/replica-navigation'/);
  for (const field of ['brand', 'pricing', 'language', 'navigation', 'lightMode', 'darkMode', 'availableCredits']) {
    assert.match(header, new RegExp(`copy\\.nav\\.${field}`));
  }
  assert.match(header, /logo=\{site\.logo\}/);
  assert.match(header, /navigationLinks\(locale\)/);
  assert.match(header, /<AuthControl variant="avatar"/);
  assert.match(header, /<AccountPopovers user=/);
  const block = readFileSync(new URL('../src/components/blocks/replica-navigation.tsx', import.meta.url), 'utf8');
  assert.match(block, /export function ReplicaNavigation/);
  assert.match(block, /href=\{link\.href\}/);
  assert.match(header, /credits !== undefined/);
  assert.match(block, /pathForLocale\(pathname, item\.code, locales\.map\(language => language\.code\)\)/);
  assert.match(block, /href=\{pricingHref\}/);
  assert.match(block, /aria-current=\{activeHref === link\.href \? 'page' : undefined\}/);
  assert.match(block, /useDismissableLayer\(\{ active: !!open/);
  assert.doesNotMatch(block, /MiniMax|Awesomejev|AI Video|Explore|href="#"/);
});
