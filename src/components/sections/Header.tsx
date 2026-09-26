import { Coins, Home, LayoutDashboard, Tags } from 'lucide-react';
import { site, auth, messages, theme } from '@/lib/config';
import { navigationLinks, routePath } from '@/lib/routes';
import { planCopy } from '@/lib/plan-copy';
import { browserNavCopy } from '@/lib/browser-nav-copy';
import { ReplicaNavigation } from '@/components/blocks/replica-navigation';
import { AuthControl } from '@/components/auth-control';
import { AccountPopovers } from '@/components/blocks/account-popovers';
import type { AccountLinks } from '@/components/blocks/account-gate-rows';

export function Header({ locale, userName, userEmail, userImage, credits }: { locale: keyof typeof messages; userName?: string; userEmail?: string; userImage?: string | null; credits?: number }) {
  const copy = messages[locale];
  return <section id="header">
    <ReplicaNavigation
      brand={copy.nav.brand}
      logo={site.logo}
      brandHref={routePath(locale, 'home')}
      navigationLabel={copy.nav.navigation}
      locale={locale}
      locales={site.languages}
      languageLabel={copy.nav.language}
      lightLabel={copy.nav.lightMode}
      darkLabel={copy.nav.darkMode}
      defaultMode={theme.defaultMode.home}
      links={navigationLinks(locale).map(link => {
        const Icon = { home: Home, pricing: Tags, dashboard: LayoutDashboard, credits: Coins }[link.icon];
        return { label: link.label, href: link.href, icon: <Icon aria-hidden="true" /> };
      })}
      accountControl={userName && userEmail && credits !== undefined ? <AccountPopovers user={{ name: userName, email: userEmail, image: userImage }} balance={credits} locale={locale} dateLocale={site.languages.find(language => language.code === locale)?.dateLocale ?? site.languages[0].dateLocale} copy={copy.account} labels={{ credits: copy.nav.availableCredits, logout: copy.nav.logout, signOutFailed: copy.nav.signOutFailed }} settings={site.account} palette={theme.account} plans={site.plans.map(plan => ({ ...plan, name: planCopy(locale, plan.id).name }))} siteUrl={site.url} brand={site.brand} /> : <AuthControl variant="avatar" copy={browserNavCopy(copy)} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} userEmail={userEmail} callbackURL={routePath(locale, 'home')} inviteRequired={auth.invite.required} accountLinks={Object.fromEntries(navigationLinks(locale).filter(link => link.id !== 'home').map(link => [link.id === 'dashboard' ? 'workspace' : link.id, { label: link.label, href: link.href }])) as AccountLinks} />}
    />
  </section>;
}
