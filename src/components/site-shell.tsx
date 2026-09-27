import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { messages, site, auth } from '@/lib/config';
import { browserNavCopy } from '@/lib/browser-nav-copy';
import { routePath } from '@/lib/route-paths';
import { AuthDialogProvider } from './auth-dialog';
import { workerEnv } from '@/lib/env';
import { accountSnapshot } from '@/lib/request-context';
import { Header } from './sections/Header';
import { Footer } from './sections/Footer';

/** Persistent chrome for marketing and workspace routes in the same locale. */
export async function SiteShell({ locale, children }: { locale: keyof typeof messages; children: ReactNode }) {
  const { session, credits } = await accountSnapshot(workerEnv(), await headers());
  return <AuthDialogProvider copy={browserNavCopy(messages[locale])} card={messages[locale].signIn.card} signupCredits={site.signupCredits} brand={site.brand} logo={site.logo} supportEmail={site.account.contactEmail} methods={{ email: auth.email, google: auth.google, github: auth.github }} inviteRequired={auth.invite.required} locale={locale} callbackURL={routePath(locale, 'home')}>
    <Header locale={locale} userName={session?.user.name} userEmail={session?.user.email} userImage={session?.user.image} credits={credits} />
    {children}
    <Footer locale={locale} />
  </AuthDialogProvider>;
}
