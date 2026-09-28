'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { pathForLocale } from '@/components/shell/language-control';

export function FooterLanguages({ locale, languages, label }: { locale: string; languages: readonly { code: string; name: string; flag: string }[]; label: string }) {
  const pathname = usePathname();
  const codes = languages.map(language => language.code);
  return <nav className="site-footer-languages" aria-label={label}>
    {languages.map(language => <Link key={language.code} href={pathForLocale(pathname, language.code, codes)} lang={language.code} aria-current={language.code === locale ? 'page' : undefined} className={language.code === locale ? 'current' : undefined}><span aria-hidden="true">{language.flag}</span> {language.name}</Link>)}
  </nav>;
}
