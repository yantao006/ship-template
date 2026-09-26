import { site, auth, messages } from '@/lib/config';
import { navigationLinks, routePath } from '@/lib/routes';
import { browserNavCopy } from '@/lib/browser-nav-copy';
import { AuthControl } from './auth-control';
import { LanguageControl } from './language-control';

export function MarketingNav({ locale, userName, callbackURL, hideLanguage = false }: { locale: keyof typeof messages; userName?: string; callbackURL?: string; hideLanguage?: boolean }) {
  const copy = messages[locale];
  return <header className="site-nav">
    <div className="nav-inner">
      <a className="brand" href={routePath(locale, 'home')} aria-label={`${copy.nav.brand} home`}>{site.logo && <img className="brand-logo" src={site.logo.src} alt={site.logo.alt} width={28} height={28} />}<span>{copy.nav.brand}</span></a>
      <nav className="marketing-links" aria-label={copy.nav.navigation}>
        {navigationLinks(locale).map(link => <a key={link.id} href={link.href}>{link.label}</a>)}
      </nav>
      <div className="nav-right">
        {!hideLanguage && <LanguageControl locale={locale} locales={site.languages} label={copy.nav.language} />}
        <AuthControl copy={browserNavCopy(copy.nav)} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} callbackURL={callbackURL ?? routePath(locale, 'home')} inviteRequired={auth.invite.required} />
      </div>
    </div>
  </header>;
}
