import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import site from '../site/site.config';

const sectionNames = [
  ['VideoHero', 'video-hero'],
  ['VideoToolSection', 'video-tool-section'],
  ['VideoShowcase', 'video-showcase'],
  ['VideoFeatures', 'video-features'],
  ['VideoPricing', 'video-pricing'],
  ['VideoFAQ', 'video-faq'],
] as const;

const section = (name: string) => readFileSync(new URL(`../src/components/sections/${name}.tsx`, import.meta.url), 'utf8');

test('unfinished sections are empty with stable ids', () => {
  for (const [name, id] of sectionNames.filter(([name]) => name !== 'VideoToolSection')) {
    assert.match(section(name), new RegExp(`return <section id="${id}" \\/>`));
    assert.deepEqual([...section(name).matchAll(/export function (\w+)/g)].map(match => match[1]), [name]);
  }
});

test('shared navigation renders the site logo asset instead of a hard-coded mark', () => {
  assert.ok(site.logo.src.startsWith('/'));
  assert.ok(site.logo.alt);
  assert.match(readFileSync(new URL(`../public${site.logo.src}`, import.meta.url), 'utf8'), /<svg/);
  assert.match(section('Header'), /logo=\{site\.logo\}/);
  const navigation = readFileSync(new URL('../src/components/blocks/replica-navigation.tsx', import.meta.url), 'utf8');
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
  const entry = readFileSync(new URL('../src/components/home-content.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(entry, /MarketingNav/);
  assert.match(entry, /<HomePage locale=\{locale\} \/>/);
  assert.match(entry, /const \{ session \} = await accountSnapshot\(env, requestHeaders\)/);
  assert.match(readFileSync(new URL('../src/lib/request-context.ts', import.meta.url), 'utf8'), /await ensureSignupCredits\(env, session\.user\.id\)/);
  assert.doesNotMatch(home, /<Header|<Footer/);
  const shell = readFileSync(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
  assert.match(shell, /<Header locale=\{locale\} userName=\{session\?\.user\.name\} userEmail=\{session\?\.user\.email\} userImage=\{session\?\.user\.image\} credits=\{credits\} \/>/);
  assert.match(shell, /\{children\}\s*<Footer locale=\{locale\} \/>/);
  const header = section('Header');
  assert.match(header, /<section id="header">/);
  assert.match(header, /import \{ ReplicaNavigation \} from '@\/components\/blocks\/replica-navigation'/);
  for (const field of ['brand', 'language', 'navigation', 'lightMode', 'darkMode', 'availableCredits']) {
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
  assert.doesNotMatch(block, /pricingHref|replica-credits-menu|creditsArea/);
  assert.match(block, /aria-current=\{activeHref === link\.href \? 'page' : undefined\}/);
  assert.match(block, /useDismissableLayer\(\{ active: !!open/);
  assert.doesNotMatch(block, /MiniMax|Awesomejev|AI Video|Explore|href="#"/);
});
