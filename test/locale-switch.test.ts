import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { pathForLocale } from '../src/components/language-control';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('language switch keeps the page and locale in the URL', () => {
  const locales = ['en', 'zh'];
  for (const [before, after] of [
    ['/en', '/zh'], ['/en/pricing', '/zh/pricing'],
    ['/zh', '/en'], ['/zh/pricing', '/en/pricing'],
  ]) {
    assert.equal(pathForLocale(before, after.split('/')[1], locales), after);
  }
});

test('both language controls navigate within the existing document', () => {
  for (const source of [read('../src/components/blocks/replica-navigation.tsx'), read('../src/components/language-control.tsx')]) {
    assert.match(source, /useRouter\(\)/);
    assert.match(source, /router\.push\(pathForLocale\(/);
    assert.doesNotMatch(source, /window\.location\.(?:assign|replace)|location\.href\s*=/);
  }
  assert.match(read('../src/components/blocks/replica-navigation.tsx'), /document\.documentElement\.lang = locale/);
});
