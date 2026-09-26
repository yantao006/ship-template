import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

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

test('homepage composes eight sections in order, using the configured navigation and existing video tool', () => {
  const home = section('HomePage');
  const names = sectionNames.map(([name]) => name);
  assert.deepEqual([...home.matchAll(/<([A-Z]\w+)(?: locale=\{locale\}(?: userName=\{userName\})?)? \/>/g)].map(match => match[1]), names);
  assert.match(section('VideoToolSection'), /import \{ VideoToolSection as ExistingVideoToolSection \} from '@\/components\/video-tool\/video-tool-section'/);
  assert.match(section('VideoToolSection'), /<ExistingVideoToolSection locale=\{locale\} \/>/);
  const entry = readFileSync(new URL('../src/components/home-content.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(entry, /MarketingNav/);
  assert.match(entry, /<HomePage locale=\{locale\} userName=\{session\?\.user\.name\} \/>/);
  assert.match(home, /<Header locale=\{locale\} userName=\{userName\} \/>/);
  const header = section('Header');
  assert.match(header, /<section id="header">/);
  assert.match(header, /import Navigation12 from '@\/components\/blocks\/navigation-12'/);
  for (const field of ['brand', 'home', 'pricing', 'workspace', 'credits', 'language', 'navigation']) {
    assert.match(header, new RegExp(`copy\\.nav\\.${field}`));
  }
  assert.match(header, /<AuthControl/);
  assert.match(header, /<LanguageControl/);
  const block = readFileSync(new URL('../src/components/blocks/navigation-12.tsx', import.meta.url), 'utf8');
  assert.match(block, /export default function Navigation12/);
  assert.match(block, /href=\{link\.href\}/);
  assert.doesNotMatch(block, /Overview|Customers|Start free|href="#"/);
});
