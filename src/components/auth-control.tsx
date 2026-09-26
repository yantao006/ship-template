'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, UserRound, Wallet, LayoutDashboard } from 'lucide-react';
import { createAuthClient } from 'better-auth/react';
import type { AuthSettings } from '@/lib/auth';

const authClient = createAuthClient({ basePath: '/api/auth' });
type Copy = { verifyTitle: string; verifyHint: string; verificationSent: string; resendVerification: string; resendFailed: string; verifyLink: string; emailNotVerified: string; login: string; google: string; github: string; email: string; orEmail: string; logout: string; signIn: string; signUp: string; name: string; password: string; noMethods: string; invite: string; wait: string; close: string; emailLabel: string; authFailed: string; socialFailed: string; signOutFailed: string; inviteInvalid: string; createdButInviteFailed: string; forgotPassword: string; forgotTitle: string; forgotHint: string; resetSent: string; resetSendFailed: string };

export function AuthControl({ copy, methods, userName, userEmail, callbackURL, locale, inviteRequired = false, variant = 'default', accountLinks }: { copy: Copy; methods: Pick<AuthSettings, 'email' | 'google' | 'github'>; userName?: string; userEmail?: string; callbackURL: string; locale: string; inviteRequired?: boolean; variant?: 'default' | 'avatar'; accountLinks?: { workspace: { label: string; href: string }; credits: { label: string; href: string }; pricing: { label: string; href: string } } }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [register, setRegister] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationNotice, setVerificationNotice] = useState('');
  const [forgot, setForgot] = useState(false);
  const [resetNotice, setResetNotice] = useState('');
  const needsVerification = !!methods.email.requireVerification;
  const canReset = !!methods.email.passwordReset;
  const verifyPath = `/${locale}/verify-email`;
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => { setAccountOpen(false); }, [pathname]);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('ref');
    if (code && /^[a-f0-9]{32}$/.test(code)) sessionStorage.setItem('account-referral-code', code);
  }, []);
  useEffect(() => {
    if (!accountOpen) return;
    const outside = (event: MouseEvent) => { if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setAccountOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [accountOpen]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); return; }
      if (event.key !== 'Tab') return;
      const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]') ?? [])];
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); (triggerRef.current ?? previous)?.focus(); };
  }, [open]);

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
        const validation = await fetch('/api/invites/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
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
          const redeemed = await fetch('/api/invites/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
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
      const result = await authClient.requestPasswordReset({ email, redirectTo: `/${locale}/reset-password` });
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

  async function signOut() {
    setPending(true);
    setError('');
    try { const result = await authClient.signOut(); if (result.error) setError(copy.signOutFailed); else { setAccountOpen(false); router.refresh(); } }
    catch { setError(copy.signOutFailed); }
    finally { setPending(false); }
  }

  return <div className={variant === 'avatar' ? 'auth-actions replica-auth' : 'auth-actions'} ref={accountRef}>
    {variant === 'avatar' ? <>
      <button ref={triggerRef} className="replica-avatar" type="button" aria-label={userName ? copy.name : copy.login} aria-expanded={userName ? accountOpen : undefined} aria-haspopup={userName ? 'menu' : 'dialog'} onClick={() => {
        if (userName) setAccountOpen(value => !value);
        else { setError(''); setVerificationEmail(''); setRegister(false); setForgot(false); setResetNotice(''); setOpen(true); }
      }}>{userName ? userName.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase() : <UserRound size={19} aria-hidden="true" />}</button>
      {userName && accountOpen && <div className="replica-popover replica-account-menu" role="menu" aria-label={copy.name}>
        <div className="replica-profile"><span className="replica-avatar replica-avatar-large" aria-hidden="true">{userName.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{userName}</strong>{userEmail && <small>{userEmail}</small>}</div></div>
        {accountLinks && <div className="replica-account-list">
          <a role="menuitem" href={accountLinks.workspace.href}><LayoutDashboard size={18} />{accountLinks.workspace.label}</a>
          <a role="menuitem" href={accountLinks.credits.href}><Wallet size={18} />{accountLinks.credits.label}</a>
          <a role="menuitem" href={accountLinks.pricing.href}>{accountLinks.pricing.label}</a>
        </div>}
        <div className="replica-account-list"><button role="menuitem" type="button" className="replica-sign-out" disabled={pending} onClick={signOut}><LogOut size={18} />{copy.logout}</button></div>
      </div>}
    </> : userName ? <>
      <span className="account-name" title={userName}>{userName}</span>
      <button className="auth-button" type="button" disabled={pending} onClick={signOut}>{copy.logout}</button>
    </> : <>
      {(methods.google.enabled || methods.github.enabled || methods.email.enabled) ? <button ref={triggerRef} className="auth-button" type="button" disabled={pending} onClick={() => { setError(''); setVerificationEmail(''); setRegister(false); setForgot(false); setResetNotice(''); setOpen(true); }}>{copy.login}</button> : <span className="account-name">{copy.noMethods}</span>}
    </>}
    {error && !open && <p className="auth-error" role="alert">{error}</p>}
    {open && <div className="auth-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
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
