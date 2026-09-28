export type SuggestionLanguage = { code: string; name: string; names?: Readonly<Record<string, string>> };

/** Only the browser's preferred language is considered, never a lower-priority fallback. */
export function suggestedLanguage(
  locale: string,
  browserLanguage: string | undefined,
  languages: readonly SuggestionLanguage[],
): SuggestionLanguage | undefined {
  const primary = browserLanguage?.trim().split(/[-_]/)[0]?.toLowerCase();
  return languages.find(language => language.code.toLowerCase() === primary && language.code !== locale);
}

export function suggestionDecisionKey(locale: string, suggested: string) {
  return `site-language-suggestion:v1:${locale}:${suggested}`;
}

export function suggestionLanguageName(language: SuggestionLanguage, inLocale: string) {
  return language.names?.[inLocale] ?? language.name;
}

export function suggestionCopy(template: string, languageName: string) {
  return template.replace('{language}', languageName);
}
