import { headers } from 'next/headers';
import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { balance } from '@/lib/ledger';
import { workerEnv } from '@/lib/env';
import { site, auth, messages } from '@/lib/config';
import { GoogleOneTap } from './google-one-tap';
import { InviteGate } from './invite-gate';
import { hasInvite } from '@/lib/invites';
import { MarketingNav } from './marketing-nav';

export async function HomeContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const env = workerEnv();
  const requestHeaders = await headers();
  const session = await createAuth(env, requestHeaders.get('host')?.split(':')[0]).api.getSession({ headers: requestHeaders });
  const copy = messages[locale];
  let credits: number | undefined;
  const invited = session ? await hasInvite(env, session.user.id) : false;
  if (session && invited) {
    await ensureSignupCredits(env, session.user.id);
    credits = await balance(env.DB, session.user.id);
  }

  return <div className="site-shell">
    {!session && auth.google.enabled && auth.google.oneTapEnabled && env.GOOGLE_CLIENT_ID && <GoogleOneTap clientId={env.GOOGLE_CLIENT_ID} callbackURL={`/${locale}`} />}
    <MarketingNav locale={locale} userName={session?.user.name} />
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">{copy.hero.title}</h1>
        <p className="hero-description">{copy.hero.description}</p>
        {session ? invited ? <div className="hero-actions"><a className="hero-cta" href={`/${locale}/dashboard`}>{copy.hero.openWorkspace}</a><span className="hero-credits">{copy.hero.credits}: {credits}</span></div> : <InviteGate copy={copy.nav} /> : <a className="hero-cta" href={`/${locale}/dashboard`}>{copy.hero.explore}</a>}
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="frame frame-one"><span>IDEA</span><b>01</b></div>
        <div className="frame frame-two"><span>NEXT</span><b>02</b></div>
        <div className="frame frame-three"><span>FRAME</span><b>03</b></div>
        <div className="art-caption">{copy.hero.detail}</div>
      </div>
    </section>
  </div>;
}
