import { Coins, Home, LayoutDashboard, Tags } from 'lucide-react';
import { site, auth, messages, theme } from '@/lib/config';
import { navigationLinks, routePath } from '@/lib/routes';
import { ReplicaNavigation } from '@/components/blocks/replica-navigation';
import { AuthControl } from '@/components/auth-control';
import { AccountPopovers } from '@/components/blocks/account-popovers';

export function Header({ locale, userName, userEmail, userImage, credits }: { locale: keyof typeof messages; userName?: string; userEmail?: string; userImage?: string | null; credits?: number }) {
  const copy = messages[locale];
  return <section id="header">
    <ReplicaNavigation
      brand={copy.nav.brand}
      logo={site.logo}
      brandHref={routePath(locale, 'home')}
      navigationLabel={copy.nav.navigation}
      locale={locale}
      locales={site.locales}
      languageLabel={copy.nav.language}
      creditsLabel={copy.nav.availableCredits}
      pricingLabel={copy.nav.pricing}
      pricingHref={routePath(locale, 'pricing')}
      lightLabel={copy.nav.lightMode}
      darkLabel={copy.nav.darkMode}
      defaultMode={theme.defaultMode.home}
      links={navigationLinks(locale).map(link => {
        const Icon = { home: Home, pricing: Tags, dashboard: LayoutDashboard, credits: Coins }[link.icon];
        return { label: link.label, href: link.href, icon: <Icon aria-hidden="true" /> };
      })}
      accountControl={userName && userEmail && credits !== undefined ? <AccountPopovers user={{ name: userName, email: userEmail, image: userImage }} balance={credits} locale={locale} copy={copy.account} labels={{ credits: copy.nav.availableCredits, logout: copy.nav.logout, signOutFailed: copy.nav.signOutFailed }} settings={site.account} palette={theme.account} plans={site.plans} siteUrl={site.url} brand={site.brand} /> : <AuthControl variant="avatar" copy={copy.nav} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} userEmail={userEmail} callbackURL={routePath(locale, 'home')} inviteRequired={auth.invite.required} accountLinks={Object.fromEntries(navigationLinks(locale).filter(link => link.id !== 'home').map(link => [link.id === 'dashboard' ? 'workspace' : link.id, { label: link.label, href: link.href }])) as { workspace: { label: string; href: string }; credits: { label: string; href: string }; pricing: { label: string; href: string } }} />}
    />
  </section>;
}
