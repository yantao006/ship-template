'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, Globe2, Moon, Sun } from 'lucide-react';
import { pathForLocale } from '@/components/language-control';
import './replica-navigation.css';

type NavLink = { label: string; href: string; icon: ReactNode };
type Menu = 'language' | 'credits' | null;

export type ReplicaNavigationProps = {
  brand: string;
  logo?: { src: string; alt: string };
  brandHref: string;
  navigationLabel: string;
  links: readonly NavLink[];
  locale: string;
  locales: readonly string[];
  languageLabel: string;
  creditsLabel: string;
  pricingLabel: string;
  pricingHref: string;
  lightLabel: string;
  darkLabel: string;
  balance?: number;
  accountControl: ReactNode;
};

export function ReplicaNavigation({ brand, logo, brandHref, navigationLabel, links, locale, locales, languageLabel, creditsLabel, pricingLabel, pricingHref, lightLabel, darkLabel, balance, accountControl }: ReplicaNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Menu>(null);
  const [light, setLight] = useState(false);
  const languageArea = useRef<HTMLDivElement>(null);
  const creditsArea = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLButtonElement>(null);
  const creditsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(null); }, [pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle('replica-light', light);
    return () => document.documentElement.classList.remove('replica-light');
  }, [light]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      const menuArea = open === 'language' ? languageArea : creditsArea;
      if (!menuArea.current?.contains(event.target as Node)) setOpen(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        (open === 'language' ? languageRef : creditsRef).current?.focus();
        setOpen(null);
      }
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);

  const currentPath = pathname === '/' ? brandHref : pathname;
  const activeHref = [...links].sort((a, b) => b.href.length - a.href.length).find(link => currentPath === link.href || (link.href !== brandHref && currentPath.startsWith(`${link.href}/`)))?.href;
  const toggle = (menu: Menu) => setOpen(value => value === menu ? null : menu);

  return <>
    <header className="replica-topbar">
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
            {locales.map(code => <button key={code} type="button" role="menuitemradio" aria-checked={locale === code} className={locale === code ? 'current' : ''} onClick={() => { setOpen(null); window.location.assign(pathForLocale(pathname, code, locales)); }}><span className="replica-language-dot" />{code === 'zh' ? '中文' : code === 'en' ? 'English' : code.toUpperCase()}</button>)}
          </div>}
        </div>
        {balance !== undefined && <div className="replica-action-wrap" ref={creditsArea}>
          <button ref={creditsRef} className="replica-credits-pill" type="button" aria-label={`${balance} ${creditsLabel}`} aria-expanded={open === 'credits'} aria-haspopup="dialog" onClick={() => toggle('credits')}><Coins size={17} />{balance}</button>
          {open === 'credits' && <div className="replica-popover replica-credits-menu" role="dialog" aria-label={creditsLabel}>
            <div className="replica-balance"><strong><Coins size={21} />{balance}</strong><span>{creditsLabel}</span></div>
            <div className="replica-credits-actions"><Link href={pricingHref} onClick={() => setOpen(null)}>{pricingLabel}</Link></div>
          </div>}
        </div>}
        {accountControl}
      </div>
    </header>
    <nav className="replica-mobile-bottom" aria-label={navigationLabel}>
      {links.map(link => <Link key={link.href} href={link.href} className={activeHref === link.href ? 'active' : undefined} aria-current={activeHref === link.href ? 'page' : undefined}>{link.icon}{link.label}</Link>)}
    </nav>
  </>;
}
