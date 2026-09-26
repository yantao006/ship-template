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
  for (const [name, id] of sectionNames.filter(([name]) => name !== 'VideoToolSection')) {
    assert.match(section(name), new RegExp(`return <section id="${id}" \\/>`));
    assert.deepEqual([...section(name).matchAll(/export function (\w+)/g)].map(match => match[1]), [name]);
  }
});

test('homepage composes eight sections in order, preserving the existing video tool and navigation', () => {
  const home = section('HomePage');
  const names = sectionNames.map(([name]) => name);
  assert.deepEqual([...home.matchAll(/<([A-Z]\w+)(?: locale=\{locale\})? \/>/g)].map(match => match[1]), names);
  assert.match(section('VideoToolSection'), /import \{ VideoToolSection as ExistingVideoToolSection \} from '@\/components\/video-tool\/video-tool-section'/);
  assert.match(section('VideoToolSection'), /<ExistingVideoToolSection locale=\{locale\} \/>/);
  const entry = readFileSync(new URL('../src/components/home-content.tsx', import.meta.url), 'utf8');
  assert.match(entry, /<MarketingNav[^>]+\/>\s*<HomePage locale=\{locale\} \/>/);
});
