import { headers } from 'next/headers';
import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { workerEnv } from '@/lib/env';
import { site, auth, messages } from '@/lib/config';
import { GoogleOneTap } from './google-one-tap';
import { hasInvite } from '@/lib/invites';
import { balance } from '@/lib/ledger';
import { HomePage } from './sections/HomePage';

export async function HomeContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const env = workerEnv();
  const requestHeaders = await headers();
  const session = await createAuth(env, requestHeaders.get('host')?.split(':')[0]).api.getSession({ headers: requestHeaders });
  let credits: number | undefined;
  if (session && await hasInvite(env, session.user.id)) {
    await ensureSignupCredits(env, session.user.id);
    credits = await balance(env.DB, session.user.id);
  }

  return <div className="site-shell">
    {!session && auth.google.enabled && auth.google.oneTapEnabled && env.GOOGLE_CLIENT_ID && <GoogleOneTap clientId={env.GOOGLE_CLIENT_ID} callbackURL={`/${locale}`} />}
    <HomePage locale={locale} userName={session?.user.name} userEmail={session?.user.email} userImage={session?.user.image} credits={credits} />
  </div>;
}
