import { headers } from 'next/headers';
import { accountSnapshot } from '@/lib/request-context';
import { workerEnv } from '@/lib/env';
import { site, auth, messages } from '@/lib/config';
import { routePath } from '@/lib/routes';
import { GoogleOneTap } from './google-one-tap';
import { HomePage } from './sections/HomePage';

export async function HomeContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const env = workerEnv();
  const requestHeaders = await headers();
  const { session, credits } = await accountSnapshot(env, requestHeaders);

  return <div className="site-shell">
    {!session && auth.google.enabled && auth.google.oneTapEnabled && env.GOOGLE_CLIENT_ID && <GoogleOneTap clientId={env.GOOGLE_CLIENT_ID} callbackURL={routePath(locale, 'home')} />}
    <HomePage locale={locale} userName={session?.user.name} userEmail={session?.user.email} userImage={session?.user.image} credits={credits} />
  </div>;
}
