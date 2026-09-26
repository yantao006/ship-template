'use client';

import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth-client';
import { routePath } from '@/lib/route-paths';

export function VerifyEmail({ locale, email: initialEmail, enabled, copy }: {
  locale: string;
  email: string;
  enabled: boolean;
  copy: { verifyTitle: string; verifyHint: string; resendVerification: string; resendFailed: string; verificationSent: string; emailLabel: string; wait: string; signIn: string; verifyContinue: string; emailNotVerified: string };
}) {
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || pending) return;
    setPending(true);
    setError('');
    try {
      const result = await authClient.sendVerificationEmail({ email: email.trim(), callbackURL: routePath(locale, 'home') });
      if (result.error) setError(copy.resendFailed);
      else setNotice(copy.verificationSent);
    } catch { setError(copy.resendFailed); }
    finally { setPending(false); }
  }
  async function continueToSite() {
    const result = await authClient.getSession();
    if (result.data?.user) window.location.assign(routePath(locale, 'home'));
    else setError(copy.emailNotVerified);
  }
  return <main className="verify-page"><section className="auth-panel">
    <h1>{copy.verifyTitle}</h1>
    <p>{copy.verifyHint}</p>
    {enabled && <form onSubmit={resend}>
      <label>{copy.emailLabel}<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
      <button className="auth-button" type="submit" disabled={pending}>{pending ? copy.wait : copy.resendVerification}</button>
    </form>}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="auth-switch" type="button" onClick={continueToSite}>{copy.verifyContinue}</button>
    <a className="auth-switch" href={routePath(locale, 'home')}>{copy.signIn}</a>
  </section></main>;
}
