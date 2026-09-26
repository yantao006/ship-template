'use client';

import { usePathname } from 'next/navigation';

export function pathForLocale(pathname: string, locale: string, locales: readonly string[]) {
  const parts = pathname.split('/');
  if (locales.includes(parts[1])) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join('/') || '/';
}

export function LanguageControl({ locale, locales, label }: { locale: string; locales: readonly string[]; label: string }) {
  const pathname = usePathname();
  return <label className="locale-control">
    <span className="sr-only">{label}</span>
    <select aria-label={label} value={locale} onChange={event => {
      window.location.assign(pathForLocale(pathname, event.target.value, locales));
    }}>
      {locales.map(code => <option key={code} value={code}>{code === 'zh' ? '中文' : code === 'en' ? 'English' : code.toUpperCase()}</option>)}
    </select>
  </label>;
}
