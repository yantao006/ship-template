import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthControl } from '@/components/auth-control';
import { DesktopHandoff } from '@/components/desktop-handoff';
import { readSession } from '@/lib/request-context';
import { allowedDesktopTarget } from '@/lib/desktop-auth';
import { auth, messages, localeFor } from '@/lib/config';
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
  return <main className="handoff-page">
    <h1>{session ? messages[locale].nav.desktopWaiting : messages[locale].nav.desktopSignIn}</h1>
    {session ? <DesktopHandoff target={target} copy={browserNavCopy(messages[locale].nav)} /> : <AuthControl copy={browserNavCopy(messages[locale].nav)} locale={locale} methods={{ email: auth.email, google: auth.google, github: auth.github }} callbackURL={returnURL} inviteRequired={auth.invite.required} />}
  </main>;
}
