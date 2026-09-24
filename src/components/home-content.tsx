import { headers } from 'next/headers';
import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { balance } from '@/lib/ledger';
import { workerEnv } from '@/lib/env';
import { site, messages } from '@/lib/config';
import { AuthControl } from './auth-control';

export async function HomeContent({ locale = site.defaultLocale as keyof typeof messages }: { locale?: keyof typeof messages }) {
  const env = workerEnv();
  const session = await createAuth(env, new URL(site.url).hostname).api.getSession({ headers: await headers() });
  const copy = messages[locale];
  let credits: number | undefined;
  if (session) {
    await ensureSignupCredits(env, session.user.id);
    credits = await balance(env.DB, session.user.id);
  }

  return <div className="site-shell">
    <header className="site-nav">
      <a className="brand" href="/" aria-label={`${copy.nav.brand} home`}><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span><span>{copy.nav.brand}</span></a>
      <AuthControl login={copy.nav.login} logout={copy.nav.logout} userName={session?.user.name} />
    </header>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="preview-note"><span className="preview-dot"/>{copy.hero.preview}</p>
        <h1 id="hero-title">{copy.hero.title}</h1>
        <p className="hero-description">{copy.hero.description}</p>
        {session ? <div className="signed-in"><span>{copy.hero.signedIn}</span><strong>{copy.hero.credits}: {credits}</strong></div> : <p className="hero-instruction">{copy.nav.login} <span aria-hidden="true">↗</span></p>}
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
