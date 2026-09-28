'use client';

import { useEffect, useId, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { OutlineButton, SolidButton } from '@/components/ui/controls';
import { pathForLocale } from './language-control';
import { suggestedLanguage, suggestionCopy, suggestionDecisionKey, suggestionLanguageName, type SuggestionLanguage } from '@/lib/language-suggestion';

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

  return <section className="language-suggestion fixed top-[68px] right-4 z-[99] max-h-[calc(100dvh-84px)] w-[min(360px,calc(100vw-32px))] overflow-y-auto border border-[var(--suggestion-border)] bg-[var(--suggestion-bg)] p-[22px] text-[var(--suggestion-text)] shadow-[0_16px_42px_color-mix(in_srgb,var(--suggestion-bg)_45%,transparent)] [border-radius:var(--radius-card-xl)] max-[400px]:right-2 max-[400px]:w-[calc(100vw-16px)] max-[400px]:p-[18px]" aria-labelledby={titleId} data-testid="language-suggestion" lang={language.code}>
    <button className="absolute top-[13px] right-[13px] grid h-8 w-8 cursor-pointer place-items-center rounded-[var(--radius-control-md)] border-0 bg-transparent p-0 text-[var(--suggestion-muted)] hover:bg-[color-mix(in_srgb,var(--suggestion-text)_12%,transparent)] hover:text-[var(--suggestion-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--suggestion-text)]" type="button" aria-label={text.close} onClick={remember}><X size={18} aria-hidden="true" /></button>
    <h2 className="mt-0 mr-7 mb-2 text-[length:var(--text-17)] leading-[1.4] font-[var(--weight-bold)] tracking-[-.02em]" id={titleId}>{suggestionCopy(text.title, suggestedName)}</h2>
    <p className="m-0 text-[length:var(--text-13)] leading-[1.5] text-[var(--suggestion-muted)]">{text.description}</p>
    <div className="mt-[22px] flex items-center justify-between gap-[10px] max-[400px]:flex-wrap">
      <OutlineButton type="button" className="min-h-[38px] px-[10px] py-2 text-left text-[length:var(--text-13)] [--control-border-width:0px] [--control-bg:transparent] [--control-text:var(--suggestion-muted)] [--control-hover-bg:color-mix(in_srgb,var(--suggestion-text)_12%,transparent)] [--control-hover-opacity:1] [--control-focus:var(--suggestion-text)]" onClick={remember}>{suggestionCopy(text.keep, currentName)}</OutlineButton>
      <SolidButton type="button" className="min-h-[38px] whitespace-nowrap px-[14px] py-2 text-[length:var(--text-13)] [--control-border:var(--suggestion-button-bg)] [--control-bg:var(--suggestion-button-bg)] [--control-text:var(--suggestion-button-text)] [--control-focus:var(--suggestion-text)]" onClick={switchLanguage}>{suggestionCopy(text.switch, suggestedName)}</SolidButton>
    </div>
  </section>;
}
