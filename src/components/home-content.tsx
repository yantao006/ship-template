import { headers } from 'next/headers';
import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { workerEnv } from '@/lib/env';
import { site, auth, messages } from '@/lib/config';
import { GoogleOneTap } from './google-one-tap';
import { hasInvite } from '@/lib/invites';
import { MarketingNav } from './marketing-nav';
import { HomePage } from './sections/HomePage';

export async function HomeContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const env = workerEnv();
  const requestHeaders = await headers();
  const session = await createAuth(env, requestHeaders.get('host')?.split(':')[0]).api.getSession({ headers: requestHeaders });
  if (session && await hasInvite(env, session.user.id)) {
    await ensureSignupCredits(env, session.user.id);
  }

  return <div className="site-shell">
    {!session && auth.google.enabled && auth.google.oneTapEnabled && env.GOOGLE_CLIENT_ID && <GoogleOneTap clientId={env.GOOGLE_CLIENT_ID} callbackURL={`/${locale}`} />}
    <MarketingNav locale={locale} userName={session?.user.name} />
    <HomePage locale={locale} />
  </div>;
}
