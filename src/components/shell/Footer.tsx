import * as React from 'react';
import Link from 'next/link';
import { messages, site } from '@/lib/config';
import { routePath } from '@/lib/route-paths';
import { FooterLanguages } from './FooterLanguages';

export function Footer({ locale }: { locale: keyof typeof messages }) {
  const copy = messages[locale].footer;
  return <footer id="footer" className="site-footer">
    <div className="site-footer-inner">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link href={routePath(locale, 'home')} className="site-footer-identity">
            {site.logo && <img src={site.logo.src} alt={site.logo.alt} width={36} height={36} />}
            <span>{site.brand}</span>
          </Link>
          <p>{copy.description}</p>
          <small>© {new Date().getUTCFullYear()} {site.brand}. {copy.rights}</small>
        </div>
        <div className="site-footer-links">
          <nav aria-label={copy.features}>
            <h2>{copy.features}</h2>
            <Link href={`${routePath(locale, 'home')}#video-tool-section`}>{copy.tool}</Link>
            <Link href={routePath(locale, 'pricing')}>{copy.pricing}</Link>
          </nav>
          <nav aria-label={copy.aboutHeading}>
            <h2>{copy.aboutHeading}</h2>
            <Link href={routePath(locale, 'about')}>{copy.about}</Link>
            <a href={`mailto:${site.account.contactEmail}`}>{copy.contact}</a>
            <Link href={routePath(locale, 'privacy')}>{copy.privacy}</Link>
            <Link href={routePath(locale, 'terms')}>{copy.terms}</Link>
          </nav>
        </div>
      </div>
      <FooterLanguages locale={locale} languages={site.languages} label={copy.language} />
    </div>
  </footer>;
}
