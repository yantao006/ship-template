import { Coins, Home, LayoutDashboard, Tags } from 'lucide-react';
import { site, auth, messages, theme } from '@/lib/config';
import { ReplicaNavigation } from '@/components/blocks/replica-navigation';
import { AuthControl } from '@/components/auth-control';
import { AccountPopovers } from '@/components/blocks/account-popovers';

export function Header({ locale, userName, userEmail, userImage, credits }: { locale: keyof typeof messages; userName?: string; userEmail?: string; userImage?: string | null; credits?: number }) {
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
      defaultMode={theme.defaultMode.home}
      links={[
        { label: copy.nav.home, href: `/${locale}`, icon: <Home aria-hidden="true" /> },
        { label: copy.nav.pricing, href: `/${locale}/pricing`, icon: <Tags aria-hidden="true" /> },
        { label: copy.nav.workspace, href: `/${locale}/dashboard`, icon: <LayoutDashboard aria-hidden="true" /> },
        { label: copy.nav.credits, href: `/${locale}/credits`, icon: <Coins aria-hidden="true" /> },
      ]}
      accountControl={userName && userEmail && credits !== undefined ? <AccountPopovers user={{ name: userName, email: userEmail, image: userImage }} balance={credits} locale={locale} copy={copy.account} labels={{ credits: copy.nav.availableCredits, logout: copy.nav.logout, signOutFailed: copy.nav.signOutFailed }} settings={site.account} palette={theme.account} plans={site.plans} siteUrl={site.url} brand={site.brand} /> : <AuthControl variant="avatar" copy={copy.nav} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} userEmail={userEmail} callbackURL={`/${locale}`} inviteRequired={auth.invite.required} accountLinks={{ workspace: { label: copy.nav.workspace, href: `/${locale}/dashboard` }, credits: { label: copy.nav.credits, href: `/${locale}/credits` }, pricing: { label: copy.nav.pricing, href: `/${locale}/pricing` } }} />}
    />
  </section>;
}
