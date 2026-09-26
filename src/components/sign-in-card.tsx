'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UserRound } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { requestJson } from '@/lib/json-request';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import type { AuthSettings } from '@/lib/auth';
import { routePath } from '@/lib/route-paths';

export type Copy = { verifyTitle: string; verifyHint: string; verificationSent: string; resendVerification: string; resendFailed: string; verifyLink: string; emailNotVerified: string; login: string; google: string; github: string; email: string; orEmail: string; logout: string; signIn: string; signUp: string; name: string; password: string; noMethods: string; invite: string; wait: string; close: string; emailLabel: string; authFailed: string; socialFailed: string; signOutFailed: string; inviteInvalid: string; createdButInviteFailed: string; forgotPassword: string; forgotTitle: string; forgotHint: string; resetSent: string; resetSendFailed: string };

export function SignInCard({ copy, methods, callbackURL, locale, inviteRequired = false, variant = 'default' }: { copy: Copy; methods: Pick<AuthSettings, 'email' | 'google' | 'github'>; callbackURL: string; locale: string; inviteRequired?: boolean; variant?: 'default' | 'avatar' }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [register, setRegister] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationNotice, setVerificationNotice] = useState('');
  const [forgot, setForgot] = useState(false);
  const [resetNotice, setResetNotice] = useState('');
  const needsVerification = !!methods.email.requireVerification;
  const canReset = !!methods.email.passwordReset;
  const verifyPath = routePath(locale, 'verifyEmail');
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement>(null);
  useDismissableLayer({ active: open, area: dialogRef, trigger: triggerRef, backdrop: overlayRef, onClose: () => setOpen(false), trapFocus: true });

  useEffect(() => { if (open && methods.email.enabled) dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(); }, [register, open, methods.email.enabled]);

  async function social(provider: 'google' | 'github') {
    if (!methods[provider].enabled || pending) return;
    setPending(true);
    setError('');
    try {
      const result = await authClient.signIn.social({ provider, callbackURL });
      if (result.error) setError(copy.socialFailed);
    } catch { setError(copy.socialFailed); }
    finally { setPending(false); }
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!methods.email.enabled || pending) return;
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    try {
      const code = String(form.get('inviteCode') ?? '').trim().toUpperCase();
      if (register && inviteRequired) {
        const validation = await requestJson('/api/invites/validate', { code });
        if (!validation.ok || !(await validation.json() as { valid: boolean }).valid) { setError(copy.inviteInvalid); return; }
      }
      const result = register
        ? await authClient.signUp.email({ email, password, name: String(form.get('name') ?? '').trim(), ...(needsVerification ? { callbackURL: callbackURL.startsWith('/') && !callbackURL.startsWith('//') ? callbackURL : '/' } : {}), ...(inviteRequired ? { inviteCode: code } : {}) } as Parameters<typeof authClient.signUp.email>[0])
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        if (needsVerification && !register && (result.error.code === 'EMAIL_NOT_VERIFIED' || (result.error.status === 403 && /not verified/i.test(result.error.message ?? '')))) {
          setVerificationEmail(email);
          setVerificationNotice(copy.emailNotVerified);
        } else setError(result.error.message ?? copy.authFailed);
      } else {
        if (register && needsVerification) {
          setVerificationEmail(email);
          setVerificationNotice(copy.verificationSent);
          return;
        }
        if (register && inviteRequired) {
          const redeemed = await requestJson('/api/invites/redeem', { code });
          if (!redeemed.ok) { setError(copy.createdButInviteFailed); return; }
        }
        setOpen(false);
        if (callbackURL.startsWith('/auth-callback?')) window.location.assign(callbackURL); else router.refresh();
      }
    } catch { setError(copy.authFailed); }
    finally { setPending(false); }
  }

  async function submitForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!methods.email.enabled || !canReset || pending) return;
    setPending(true);
    setError('');
    setResetNotice('');
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    try {
      const result = await authClient.requestPasswordReset({ email, redirectTo: routePath(locale, 'resetPassword') });
      if (result.error) setError(copy.resetSendFailed);
      else setResetNotice(copy.resetSent);
    } catch { setError(copy.resetSendFailed); }
    finally { setPending(false); }
  }

  async function resendVerification() {
    if (!verificationEmail || pending) return;
    setPending(true);
    setError('');
    try {
      const result = await authClient.sendVerificationEmail({ email: verificationEmail, callbackURL: callbackURL.startsWith('/') && !callbackURL.startsWith('//') ? callbackURL : '/' });
      if (result.error) setError(copy.resendFailed);
      else setVerificationNotice(copy.verificationSent);
    } catch { setError(copy.resendFailed); }
    finally { setPending(false); }
  }

  const begin = () => { setError(''); setVerificationEmail(''); setRegister(false); setForgot(false); setResetNotice(''); setOpen(true); };
  return <div className={variant === 'avatar' ? 'auth-actions replica-auth' : 'auth-actions'}>
    {variant === 'avatar' ? <button ref={triggerRef} className="replica-avatar" type="button" aria-label={copy.login} aria-haspopup="dialog" onClick={begin}><UserRound size={19} aria-hidden="true" /></button> : (methods.google.enabled || methods.github.enabled || methods.email.enabled) ? <button ref={triggerRef} className="auth-button" type="button" disabled={pending} onClick={begin}>{copy.login}</button> : <span className="account-name">{copy.noMethods}</span>}
    {error && !open && <p className="auth-error" role="alert">{error}</p>}
    {open && <div ref={overlayRef} className="auth-overlay">
      <section ref={dialogRef} className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" aria-label={copy.close} onClick={() => setOpen(false)}>×</button>
        <h2 id="auth-title">{verificationEmail ? copy.verifyTitle : forgot ? copy.forgotTitle : register ? copy.signUp : copy.signIn}</h2>
        {verificationEmail ? <div className="verification-actions">
          <p role="status">{verificationNotice} {verificationEmail}</p>
          <p>{copy.verifyHint}</p>
          <button className="auth-button" type="button" disabled={pending} onClick={resendVerification}>{pending ? copy.wait : copy.resendVerification}</button>
          <a className="auth-switch" href={`${verifyPath}?email=${encodeURIComponent(verificationEmail)}`}>{copy.verifyLink}</a>
          <button className="auth-switch" type="button" onClick={() => { setVerificationEmail(''); setRegister(false); setError(''); }}>{copy.signIn}</button>
        </div> : forgot ? <div className="verification-actions">
          <p>{copy.forgotHint}</p>
          {resetNotice ? <p role="status">{resetNotice}</p> : <form onSubmit={submitForgot}>
            <label>{copy.emailLabel}<input name="email" type="email" autoComplete="email" required /></label>
            <button className="auth-button" type="submit" disabled={pending}>{pending ? copy.wait : copy.forgotPassword}</button>
          </form>}
          <button className="auth-switch" type="button" onClick={() => { setForgot(false); setResetNotice(''); setError(''); }}>{copy.signIn}</button>
        </div> : <>
        {(methods.google.enabled || methods.github.enabled) && <div className="social-methods">
          {methods.google.enabled && <button className="social-button" type="button" disabled={pending} onClick={() => social('google')}>{copy.google}</button>}
          {methods.github.enabled && <button className="social-button" type="button" disabled={pending} onClick={() => social('github')}>{copy.github}</button>}
        </div>}
        {methods.email.enabled && <>
          {(methods.google.enabled || methods.github.enabled) && <p className="method-divider"><span>{copy.orEmail}</span></p>}
          <form onSubmit={submitEmail}>
            {register && <label>{copy.name}<input name="name" autoComplete="name" required minLength={1} /></label>}
            <label>{copy.emailLabel}<input name="email" type="email" autoComplete="email" required /></label>
            {register && needsVerification && <p className="verification-hint">{copy.verifyHint}</p>}
            <label>{copy.password}<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} /></label>
            {register && inviteRequired && <label>{copy.invite}<input name="inviteCode" autoComplete="off" required maxLength={32} /></label>}
            <button className="auth-button" type="submit" disabled={pending}>{pending ? copy.wait : register ? copy.signUp : copy.signIn}</button>
          </form>
          {!register && canReset && <button className="auth-switch" type="button" onClick={() => { setForgot(true); setError(''); }}>{copy.forgotPassword}</button>}
          <button className="auth-switch" type="button" onClick={() => { setRegister(!register); setForgot(false); setError(''); }}>{register ? copy.signIn : copy.signUp}</button>
        </>}
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </div>}
  </div>;
}
