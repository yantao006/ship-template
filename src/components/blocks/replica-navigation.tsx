'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe2, Moon, Sun } from 'lucide-react';
import { pathForLocale } from '@/components/language-control';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import './replica-navigation.css';

type NavLink = { label: string; href: string; icon: ReactNode };
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
};

export function ReplicaNavigation({ brand, logo, brandHref, navigationLabel, links, locale, locales, languageLabel, lightLabel, darkLabel, defaultMode, accountControl }: ReplicaNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Menu>(null);
  const [light, setLight] = useState(defaultMode === 'light');
  const languageArea = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(null); }, [pathname]);
  useEffect(() => {
    document.documentElement.dataset.mode = light ? 'light' : 'dark';
    document.documentElement.classList.toggle('replica-light', light);
    return () => {
      document.documentElement.dataset.mode = 'auto';
      document.documentElement.classList.remove('replica-light');
    };
  }, [light]);
  useDismissableLayer({ active: !!open, area: languageArea, trigger: languageRef, onClose: () => setOpen(null) });

  const currentPath = pathname === '/' ? brandHref : pathname;
  const activeHref = [...links].sort((a, b) => b.href.length - a.href.length).find(link => currentPath === link.href || (link.href !== brandHref && currentPath.startsWith(`${link.href}/`)))?.href;
  const toggle = (menu: Menu) => setOpen(value => value === menu ? null : menu);

  return <>
    <header className="replica-topbar" data-default-mode={defaultMode}>
      <Link href={brandHref} className="replica-brand" aria-label={brand}>
        {logo && <img src={logo.src} alt={logo.alt} width={28} height={28} />}
        <span>{brand}</span>
      </Link>
      <nav className="replica-desktop-nav" aria-label={navigationLabel}>
        {links.map(link => <Link key={link.href} href={link.href} className={activeHref === link.href ? 'active' : undefined} aria-current={activeHref === link.href ? 'page' : undefined}>{link.label}</Link>)}
      </nav>
      <div className="replica-actions">
        <button className="replica-icon" type="button" aria-label={light ? darkLabel : lightLabel} onClick={() => setLight(value => !value)}>{light ? <Moon size={19} /> : <Sun size={19} />}</button>
        <div className="replica-action-wrap" ref={languageArea}>
          <button ref={languageRef} className={`replica-icon ${open === 'language' ? 'selected' : ''}`} type="button" aria-label={languageLabel} aria-expanded={open === 'language'} aria-haspopup="menu" onClick={() => toggle('language')}><Globe2 size={19} /></button>
          {open === 'language' && <div className="replica-popover replica-language-menu" role="menu" aria-label={languageLabel}>
            {locales.map(item => <button key={item.code} type="button" role="menuitemradio" aria-checked={locale === item.code} className={locale === item.code ? 'current' : ''} onClick={() => { setOpen(null); window.location.assign(pathForLocale(pathname, item.code, locales.map(language => language.code))); }}><span className="replica-language-dot" />{item.name}</button>)}
          </div>}
        </div>
        {accountControl}
      </div>
    </header>
    <nav className="replica-mobile-bottom" aria-label={navigationLabel}>
      {links.map(link => <Link key={link.href} href={link.href} className={activeHref === link.href ? 'active' : undefined} aria-current={activeHref === link.href ? 'page' : undefined}>{link.icon}{link.label}</Link>)}
    </nav>
  </>;
}
