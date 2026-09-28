import { auth, messages, site, theme } from '@/lib/config';
import { navigationLinks, routePath } from '@/lib/routes';
import { planCopy } from '@/lib/plan-copy';
import { productForPlan } from '@/lib/waffo-products';
import { workerEnv } from '@/lib/env';
import { browserNavCopy } from '@/lib/browser-nav-copy';
import { AuthControl } from '@/components/auth/auth-control';
import { AccountPopovers } from './account-popovers';
import type { AccountLinks } from './account-gate-rows';

export function HeaderAccountControl({ locale, userName, userEmail, userImage, credits }: { locale: keyof typeof messages; userName?: string; userEmail?: string; userImage?: string | null; credits?: number }) {
  const copy = messages[locale];
  return userName && userEmail && credits !== undefined
    ? <AccountPopovers user={{ name: userName, email: userEmail, image: userImage }} balance={credits} locale={locale} dateLocale={site.languages.find(language => language.code === locale)?.dateLocale ?? site.languages[0].dateLocale} copy={copy.account} labels={{ credits: copy.nav.availableCredits, logout: copy.nav.logout, signOutFailed: copy.nav.signOutFailed }} settings={site.account} palette={theme.account} plans={site.plans.map(plan => ({ ...plan, name: planCopy(locale, plan.id).name, checkoutEnabled: !!productForPlan(workerEnv(), plan) }))} pricing={copy.pricing} siteUrl={site.url} brand={site.brand} />
    : <AuthControl variant="avatar" copy={browserNavCopy(copy)} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={userName} userEmail={userEmail} callbackURL={routePath(locale, 'home')} inviteRequired={auth.invite.required} accountLinks={Object.fromEntries(navigationLinks(locale).filter(link => link.id !== 'home').map(link => [link.id === 'dashboard' ? 'workspace' : link.id, { label: link.label, href: link.href }])) as AccountLinks} />;
}
