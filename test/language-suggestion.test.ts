import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import site from '../site/site.config';
import messages from '../site/messages';
import { routePath } from '../src/lib/route-paths';
import { suggestedLanguage, suggestionCopy, suggestionDecisionKey, suggestionLanguageName } from '../src/lib/language-suggestion';

const languages = site.languages;

test('preferred browser language suggests a supported, different primary locale', () => {
  assert.equal(suggestedLanguage('en', 'zh-CN', languages)?.code, 'zh');
  assert.equal(suggestedLanguage('zh', 'en-US', languages)?.code, 'en');
  assert.equal(suggestedLanguage('en', 'en-US', languages), undefined);
  assert.equal(suggestedLanguage('en', 'ja-JP', languages), undefined);
  assert.equal(suggestedLanguage('en', undefined, languages), undefined);
  // Never skip the preferred unsupported language to choose a later fallback.
  assert.equal(suggestedLanguage('en', 'fr-FR', languages), undefined);
});

test('the offered locale owns the copy and configured names, including localized current name', () => {
  const copy = messages.zh.nav.languageSuggestion;
  assert.equal(suggestionCopy(copy.title, suggestionLanguageName(languages[1], 'zh')), '要用中文浏览此网站吗？');
  assert.equal(copy.description, '此网站支持你的浏览器语言。');
  assert.equal(suggestionCopy(copy.keep, suggestionLanguageName(languages[0], 'zh')), '继续使用英语');
  assert.equal(suggestionCopy(copy.switch, suggestionLanguageName(languages[1], 'zh')), '切换到中文');
  assert.equal(suggestionCopy(messages.en.nav.languageSuggestion.switch, suggestionLanguageName(languages[0], 'en')), 'Switch to English');
});

test('dismissal and acceptance persist for the page/suggested language pair; switch uses the existing path helper', () => {
  const key = suggestionDecisionKey('en', 'zh');
  const stored = new Map<string, string>();
  assert.equal(stored.get(key), undefined);
  stored.set(key, '1'); // Both close/continue and switch record the same decision.
  assert.equal(stored.get(suggestionDecisionKey('en', 'zh')), '1');
  assert.notEqual(suggestionDecisionKey('zh', 'en'), key);
  assert.equal(routePath('zh', 'pricing'), '/zh/pricing');
  const component = readFileSync('src/components/shell/language-suggestion.tsx', 'utf8');
  assert.match(component, /localStorage\.getItem\(suggestionDecisionKey\(locale, language\.code\)\)/);
  assert.match(component, /localStorage\.setItem\(suggestionDecisionKey\(locale, language\.code\), '1'\)/);
  assert.match(component, /onClick=\{remember\}/);
  assert.match(component, /router\.push\(pathForLocale\(pathname, language\.code, languages\.map\(item => item\.code\)\)\)/);
  assert.match(readFileSync('src/components/shell/site-shell.tsx', 'utf8'), /<LanguageSuggestion locale=\{locale\}/);
});
