'use client';

import { usePathname, useRouter } from 'next/navigation';


export function pathForLocale(pathname: string, locale: string, locales: readonly string[]) {
  const parts = pathname.split('/');
  if (locales.includes(parts[1])) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join('/') || '/';
}

export function LanguageControl({ locale, locales, label }: { locale: string; locales: readonly { code: string; name: string }[]; label: string }) {
  const pathname = usePathname();
  const router = useRouter();
  return <label className="relative inline-flex items-center">
    <span className="sr-only">{label}</span>
    <select className="min-h-[38px] max-w-[118px] cursor-pointer rounded-[7px] border border-transparent bg-transparent py-[6px] pr-[22px] pl-[9px] text-[length:var(--text-13)] text-[var(--text)] hover:border-[var(--line)] max-[640px]:max-w-[92px] max-[640px]:px-1 max-[640px]:text-[length:var(--text-12)]" aria-label={label} value={locale} onChange={event => {
      if (event.target.value !== locale) router.push(pathForLocale(pathname, event.target.value, locales.map(item => item.code)));
    }}>
      {locales.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
    </select>
  </label>;
}
