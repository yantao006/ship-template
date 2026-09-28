import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthControl } from '@/components/auth/auth-control';
import { DesktopHandoff } from '@/components/auth/desktop-handoff';
import { readSession } from '@/lib/request-context';
import { allowedDesktopTarget } from '@/lib/desktop-auth';
import { auth, messages, site, localeFor } from '@/lib/config';
import { browserNavCopy } from '@/lib/browser-nav-copy';
import { workerEnv } from '@/lib/env';

export default async function AuthCallback({ searchParams }: { searchParams: Promise<{ redirect?: string; locale?: string }> }) {
  const params = await searchParams;
  const target = allowedDesktopTarget(params.redirect ?? null);
  if (!target) redirect('/');
  const locale = localeFor(params.locale ?? '');
  const requestHeaders = await headers();
  const session = await readSession(workerEnv(), requestHeaders);
  const returnURL = `/auth-callback?redirect=${encodeURIComponent(target)}&locale=${locale}`;
  return <main className="grid min-h-dvh content-center justify-items-center gap-[22px] bg-[var(--bg)] p-5 text-center [&_.auth-actions]:flex-wrap [&_.auth-actions]:justify-center">
    <h1 className="m-0 text-[clamp(28px,5vw,44px)]">{session ? messages[locale].handoff.desktopWaiting : messages[locale].handoff.desktopSignIn}</h1>
    {session ? <DesktopHandoff target={target} copy={browserNavCopy(messages[locale])} /> : <AuthControl copy={browserNavCopy(messages[locale])} standaloneCard={{ brand: site.brand, logo: site.logo, authMarketingImage: site.authMarketingImage, supportEmail: site.account.contactEmail, card: messages[locale].signIn.card, signupCredits: site.signupCredits }} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} callbackURL={returnURL} inviteRequired={auth.invite.required} />}
  </main>;
}
