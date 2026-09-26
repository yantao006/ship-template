import { site, auth, messages } from '@/lib/config';
import { AuthControl } from './auth-control';
import { LanguageControl } from './language-control';

export function MarketingNav({ locale, userName, callbackURL, hideLanguage = false }: { locale: keyof typeof messages; userName?: string; callbackURL?: string; hideLanguage?: boolean }) {
  const copy = messages[locale];
  return <header className="site-nav">
    <div className="nav-inner">
      <a className="brand" href={`/${locale}`} aria-label={`${copy.nav.brand} home`}>{site.logo && <img className="brand-logo" src={site.logo.src} alt={site.logo.alt} width={28} height={28} />}<span>{copy.nav.brand}</span></a>
      <nav className="marketing-links" aria-label={copy.nav.navigation}>
        <a href={`/${locale}`}>{copy.nav.home}</a>
        <a href={`/${locale}/pricing`}>{copy.nav.pricing}</a>
        <a href={`/${locale}/dashboard`}>{copy.nav.workspace}</a>
        <a href={`/${locale}/credits`}>{copy.nav.credits}</a>
      </nav>
      <div className="nav-right">
        {!hideLanguage && <LanguageControl locale={locale} locales={site.locales} label={copy.nav.language} />}
        <AuthControl copy={copy.nav} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} callbackURL={callbackURL ?? `/${locale}`} inviteRequired={auth.invite.required} />
      </div>
    </div>
  </header>;
}
