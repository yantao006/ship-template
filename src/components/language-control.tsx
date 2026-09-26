'use client';

import { usePathname } from 'next/navigation';


export function pathForLocale(pathname: string, locale: string, locales: readonly string[]) {
  const parts = pathname.split('/');
  if (locales.includes(parts[1])) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join('/') || '/';
}

export function LanguageControl({ locale, locales, label }: { locale: string; locales: readonly { code: string; name: string }[]; label: string }) {
  const pathname = usePathname();
  return <label className="locale-control">
    <span className="sr-only">{label}</span>
    <select aria-label={label} value={locale} onChange={event => {
      window.location.assign(pathForLocale(pathname, event.target.value, locales.map(item => item.code)));
    }}>
      {locales.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
    </select>
  </label>;
}
