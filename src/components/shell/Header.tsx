import { Coins, Home, LayoutDashboard, Tags } from 'lucide-react';
import { site, messages, theme } from '@/lib/config';
import { navigationLinks, routePath } from '@/lib/routes';
import { ReplicaNavigation } from './replica-navigation';
import { HeaderAccountControl } from '@/components/account/header-account-control';

export function Header({ locale, userName, userEmail, userImage, credits }: { locale: keyof typeof messages; userName?: string; userEmail?: string; userImage?: string | null; credits?: number }) {
  const copy = messages[locale];
  return <section id="header">
    <ReplicaNavigation
      brand={site.brand}
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
        return { label: link.label, href: link.href, icon: <Icon aria-hidden="true" />, requiresAuth: link.id === 'dashboard' || link.id === 'credits' };
      })}
      signedIn={!!userName && !!userEmail}
      accountControl={<HeaderAccountControl locale={locale} userName={userName} userEmail={userEmail} userImage={userImage} credits={credits} />}
    />
  </section>;
}
