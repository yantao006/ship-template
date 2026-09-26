import { site, auth, messages } from '@/lib/config';
import Navigation12 from '@/components/blocks/navigation-12';
import { AuthControl } from '@/components/auth-control';
import { LanguageControl } from '@/components/language-control';

export function Header({ locale, userName }: { locale: keyof typeof messages; userName?: string }) {
  const copy = messages[locale];
  const actions = () => <>
    <LanguageControl locale={locale} locales={site.locales} label={copy.nav.language} />
    <AuthControl copy={copy.nav} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} callbackURL={`/${locale}`} inviteRequired={auth.invite.required} />
  </>;

  return <section id="header">
    <Navigation12
      brand={copy.nav.brand}
      brandHref={`/${locale}`}
      navigationLabel={copy.nav.navigation}
      closeLabel={copy.nav.close}
      links={[
        { label: copy.nav.home, href: `/${locale}` },
        { label: copy.nav.pricing, href: `/${locale}/pricing` },
        { label: copy.nav.workspace, href: `/${locale}/dashboard` },
        { label: copy.nav.credits, href: `/${locale}/credits` },
      ]}
      desktopActions={actions()}
      mobileActions={actions()}
    />
  </section>;
}
