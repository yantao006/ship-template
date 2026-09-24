import { headers } from 'next/headers';
import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { balance } from '@/lib/ledger';
import { workerEnv } from '@/lib/env';
import { site, auth, messages } from '@/lib/config';
import { AuthControl } from './auth-control';
import { GoogleOneTap } from './google-one-tap';
import { InviteGate } from './invite-gate';
import { hasInvite } from '@/lib/invites';

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
    <header className="site-nav">
      <a className="brand" href={`/${locale}`} aria-label={`${copy.nav.brand} home`}><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span><span>{copy.nav.brand}</span></a>
      <div className="nav-right">
        <nav className="language-switch" aria-label="Language">{site.locales.map(code => <a key={code} href={`/${code}`} lang={code} hrefLang={code} aria-current={code === locale ? 'page' : undefined}>{code.toUpperCase()}</a>)}</nav>
        <AuthControl copy={copy.nav} methods={{ email: auth.email, google: auth.google, github: auth.github }} userName={session?.user.name} callbackURL={`/${locale}`} inviteRequired={auth.invite.required} />
      </div>
    </header>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="preview-note"><span className="preview-dot"/>{copy.hero.preview}</p>
        <h1 id="hero-title">{copy.hero.title}</h1>
        <p className="hero-description">{copy.hero.description}</p>
        {session ? invited ? <div className="signed-in"><span>{copy.hero.signedIn}</span><strong>{copy.hero.credits}: {credits}</strong></div> : <InviteGate copy={copy.nav} /> : (auth.email.enabled || auth.google.enabled || auth.github.enabled) && <p className="hero-instruction">{copy.nav.login} <span aria-hidden="true">↗</span></p>}
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
