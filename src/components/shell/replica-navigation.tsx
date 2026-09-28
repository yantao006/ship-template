'use client';

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe2, Moon, Sun } from 'lucide-react';
import { pathForLocale } from '@/components/shell/language-control';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import { ensureThemeMode, toggleThemeMode } from '@/lib/theme-mode';
import { useOptionalAuthDialog } from '@/components/auth/auth-dialog';
import './replica-navigation.css';

type NavLink = { label: string; href: string; icon: ReactNode; requiresAuth?: boolean };
type Menu = 'language' | null;

export type ReplicaNavigationProps = {
  brand: string;
  logo?: { src: string; alt: string };
  brandHref: string;
  navigationLabel: string;
  links: readonly NavLink[];
  locale: string;
  locales: readonly { code: string; name: string }[];
  languageLabel: string;
  lightLabel: string;
  darkLabel: string;
  defaultMode: 'light' | 'dark';
  accountControl: ReactNode;
  signedIn: boolean;
};

export function ReplicaNavigation({ brand, logo, brandHref, navigationLabel, links, locale, locales, languageLabel, lightLabel, darkLabel, defaultMode, accountControl, signedIn }: ReplicaNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const authDialog = useOptionalAuthDialog();
  const [open, setOpen] = useState<Menu>(null);
  const light = useSyncExternalStore(
    (notify) => { document.documentElement.addEventListener('site-theme-change', notify); return () => document.documentElement.removeEventListener('site-theme-change', notify); },
    () => document.documentElement.dataset.mode === 'light',
    () => defaultMode === 'light',
  );
  const languageArea = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(null); }, [pathname]);
  // The root layout persists across client-side locale navigation.
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useLayoutEffect(() => {
    ensureThemeMode(document.documentElement, defaultMode);
  }, [defaultMode]);
  useDismissableLayer({ active: !!open, area: languageArea, trigger: languageRef, onClose: () => setOpen(null) });

  const currentPath = pathname === '/' ? brandHref : pathname;
  const activeHref = [...links].sort((a, b) => b.href.length - a.href.length).find(link => currentPath === link.href || (link.href !== brandHref && currentPath.startsWith(`${link.href}/`)))?.href;
  const toggle = (menu: Menu) => setOpen(value => value === menu ? null : menu);
  const toggleMode = () => toggleThemeMode(document.documentElement, defaultMode);
  const gatedLink = (event: MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    if (signedIn || !authDialog || !link.requiresAuth || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const { href } = link;
    event.preventDefault();
    void authDialog.openAuth({ source: 'navigation-link', intent: 'open-history', draftId: href, onSuccess: () => router.push(href) });
  };

  return <>
    <header className="replica-topbar">
      <Link href={brandHref} className="replica-brand" aria-label={brand}>
        {logo && <img src={logo.src} alt={logo.alt} width={28} height={28} />}
        <span>{brand}</span>
      </Link>
      <nav className="replica-desktop-nav" aria-label={navigationLabel}>
        {links.map(link => <Link key={link.href} href={link.href} onClick={event => gatedLink(event, link)} className={activeHref === link.href ? 'active' : undefined} aria-current={activeHref === link.href ? 'page' : undefined}>{link.label}</Link>)}
      </nav>
      <div className="replica-actions">
        <button className="replica-icon" type="button" aria-label={light ? darkLabel : lightLabel} onClick={toggleMode}>{light ? <Moon size={19} /> : <Sun size={19} />}</button>
        <div className="replica-action-wrap" ref={languageArea}>
          <button ref={languageRef} className={`replica-icon ${open === 'language' ? 'selected' : ''}`} type="button" aria-label={languageLabel} aria-expanded={open === 'language'} aria-haspopup="menu" onClick={() => toggle('language')}><Globe2 size={19} /></button>
          {open === 'language' && <div className="replica-popover replica-language-menu ui-enter-rise" role="menu" aria-label={languageLabel}>
            {locales.map(item => <button key={item.code} type="button" role="menuitemradio" aria-checked={locale === item.code} className={locale === item.code ? 'current' : ''} onClick={() => { setOpen(null); if (item.code !== locale) router.push(pathForLocale(pathname, item.code, locales.map(language => language.code))); }}><span className="replica-language-dot" />{item.name}</button>)}
          </div>}
        </div>
        {accountControl}
      </div>
    </header>
    <nav className="replica-mobile-bottom" aria-label={navigationLabel}>
      {links.map(link => <Link key={link.href} href={link.href} onClick={event => gatedLink(event, link)} className={activeHref === link.href ? 'active' : undefined} aria-current={activeHref === link.href ? 'page' : undefined}>{link.icon}{link.label}</Link>)}
    </nav>
  </>;
}
