import { Coins, Home, LayoutDashboard, Tags } from 'lucide-react';
import { site, auth, messages } from '@/lib/config';
import { ReplicaNavigation } from '@/components/blocks/replica-navigation';
import { AuthControl } from '@/components/auth-control';

export function Header({ locale, userName, userEmail, credits }: { locale: keyof typeof messages; userName?: string; userEmail?: string; credits?: number }) {
  const copy = messages[locale];
  return <section id="header">
    <ReplicaNavigation
      brand={copy.nav.brand}
      logo={site.logo}
      brandHref={`/${locale}`}
      navigationLabel={copy.nav.navigation}
      locale={locale}
      locales={site.locales}
      languageLabel={copy.nav.language}
      creditsLabel={copy.nav.availableCredits}
      pricingLabel={copy.nav.pricing}
      pricingHref={`/${locale}/pricing`}
      lightLabel={copy.nav.lightMode}
      darkLabel={copy.nav.darkMode}
      balance={credits}
      links={[
        { label: copy.nav.home, href: `/${locale}`, icon: <Home aria-hidden="true" /> },
        { label: copy.nav.pricing, href: `/${locale}/pricing`, icon: <Tags aria-hidden="true" /> },
        { label: copy.nav.workspace, href: `/${locale}/dashboard`, icon: <LayoutDashboard aria-hidden="true" /> },
        { label: copy.nav.credits, href: `/${locale}/credits`, icon: <Coins aria-hidden="true" /> },
      ]}
      accountControl={<AuthControl variant="avatar" copy={copy.nav} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} userEmail={userEmail} callbackURL={`/${locale}`} inviteRequired={auth.invite.required} accountLinks={{ workspace: { label: copy.nav.workspace, href: `/${locale}/dashboard` }, credits: { label: copy.nav.credits, href: `/${locale}/credits` }, pricing: { label: copy.nav.pricing, href: `/${locale}/pricing` } }} />}
    />
  </section>;
}
