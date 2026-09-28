'use client';

import { useEffect, useId, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { pathForLocale } from './language-control';
import { suggestedLanguage, suggestionCopy, suggestionDecisionKey, suggestionLanguageName, type SuggestionLanguage } from '@/lib/language-suggestion';
import './language-suggestion.css';

type Copy = { title: string; description: string; keep: string; switch: string; close: string };
type Props = {
  locale: string;
  languages: readonly SuggestionLanguage[];
  copy: Readonly<Record<string, Copy>>;
};

export function LanguageSuggestion({ locale, languages, copy }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const titleId = useId();
  const [offer, setOffer] = useState<{ locale: string; language: SuggestionLanguage } | null>(null);

  useEffect(() => {
    const browserLanguage = navigator.languages?.[0] || navigator.language;
    const language = suggestedLanguage(locale, browserLanguage, languages);
    if (!language) { setOffer(null); return; }
    try {
      if (localStorage.getItem(suggestionDecisionKey(locale, language.code))) { setOffer(null); return; }
    } catch {
      // A blocked storage API must not prevent the suggestion from rendering.
    }
    setOffer({ locale, language });
  }, [locale, languages]);

  if (!offer || offer.locale !== locale) return null;
  const { language } = offer;
  const text = copy[language.code];
  if (!text) return null;
  const suggestedName = suggestionLanguageName(language, language.code);
  const current = languages.find(item => item.code === locale);
  const currentName = current ? suggestionLanguageName(current, language.code) : locale;
  const remember = () => {
    try { localStorage.setItem(suggestionDecisionKey(locale, language.code), '1'); }
    catch { /* Storage can be disabled; still dismiss this instance. */ }
    setOffer(null);
  };
  const switchLanguage = () => {
    remember();
    router.push(pathForLocale(pathname, language.code, languages.map(item => item.code)));
  };

  return <section className="language-suggestion" aria-labelledby={titleId} data-testid="language-suggestion" lang={language.code}>
    <button className="language-suggestion-close" type="button" aria-label={text.close} onClick={remember}><X size={18} aria-hidden="true" /></button>
    <h2 id={titleId}>{suggestionCopy(text.title, suggestedName)}</h2>
    <p>{text.description}</p>
    <div className="language-suggestion-actions">
      <button type="button" className="language-suggestion-keep" onClick={remember}>{suggestionCopy(text.keep, currentName)}</button>
      <button type="button" className="language-suggestion-switch" onClick={switchLanguage}>{suggestionCopy(text.switch, suggestedName)}</button>
    </div>
  </section>;
}
