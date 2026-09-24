'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthClient } from 'better-auth/react';
import type { AuthSettings } from '@/lib/auth';

const authClient = createAuthClient({ basePath: '/api/auth' });
type Copy = { login: string; google: string; github: string; email: string; logout: string; signIn: string; signUp: string; name: string; password: string; noMethods: string; invite: string; wait: string; close: string; emailLabel: string; authFailed: string; socialFailed: string; signOutFailed: string; inviteInvalid: string; createdButInviteFailed: string };

export function AuthControl({ copy, methods, userName, callbackURL, inviteRequired = false }: { copy: Copy; methods: Pick<AuthSettings, 'email' | 'google' | 'github'>; userName?: string; callbackURL: string; inviteRequired?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [register, setRegister] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!emailOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { setEmailOpen(false); return; }
      if (event.key !== 'Tab') return;
      const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)') ?? [])];
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); (triggerRef.current ?? previous)?.focus(); };
  }, [emailOpen]);

  useEffect(() => { if (emailOpen) dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(); }, [register, emailOpen]);

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
        ? await authClient.signUp.email({ email, password, name: String(form.get('name') ?? '').trim(), ...(inviteRequired ? { inviteCode: code } : {}) } as Parameters<typeof authClient.signUp.email>[0])
        : await authClient.signIn.email({ email, password });
      if (result.error) setError(result.error.message ?? copy.authFailed);
      else {
        if (register && inviteRequired) {
          const redeemed = await fetch('/api/invites/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
          if (!redeemed.ok) { setError(copy.createdButInviteFailed); return; }
        }
        setEmailOpen(false);
        if (callbackURL.startsWith('/auth-callback?')) window.location.assign(callbackURL); else router.refresh();
      }
    } catch { setError(copy.authFailed); }
    finally { setPending(false); }
  }

  async function signOut() {
    setPending(true);
    setError('');
    try { const result = await authClient.signOut(); if (result.error) setError(copy.signOutFailed); else router.refresh(); }
    catch { setError(copy.signOutFailed); }
    finally { setPending(false); }
  }

  return <div className="auth-actions">
    {userName ? <>
      <span className="account-name" title={userName}>{userName}</span>
      <button className="auth-button" type="button" disabled={pending} onClick={signOut}>{copy.logout}</button>
    </> : <>
      {methods.google.enabled && <button className="auth-button" type="button" disabled={pending} onClick={() => social('google')}>{copy.google}</button>}
      {methods.github.enabled && <button className="auth-button" type="button" disabled={pending} onClick={() => social('github')}>{copy.github}</button>}
      {methods.email.enabled && <button ref={triggerRef} className="auth-button auth-button-secondary" type="button" disabled={pending} onClick={() => { setError(''); setRegister(false); setEmailOpen(true); }}>{copy.email}</button>}
      {!methods.google.enabled && !methods.github.enabled && !methods.email.enabled && <span className="account-name">{copy.noMethods}</span>}
    </>}
    {error && !emailOpen && <p className="auth-error" role="alert">{error}</p>}
    {emailOpen && methods.email.enabled && <div className="auth-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setEmailOpen(false); }}>
      <section ref={dialogRef} className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" aria-label={copy.close} onClick={() => setEmailOpen(false)}>×</button>
        <h2 id="auth-title">{register ? copy.signUp : copy.signIn}</h2>
        <form onSubmit={submitEmail}>
          {register && <label>{copy.name}<input name="name" autoComplete="name" required minLength={1} /></label>}
          <label>{copy.emailLabel}<input name="email" type="email" autoComplete="email" required /></label>
          <label>{copy.password}<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} /></label>
          {register && inviteRequired && <label>{copy.invite}<input name="inviteCode" autoComplete="off" required maxLength={32} /></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="auth-button" type="submit" disabled={pending}>{pending ? copy.wait : register ? copy.signUp : copy.signIn}</button>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setRegister(!register); setError(''); }}>{register ? copy.signIn : copy.signUp}</button>
      </section>
    </div>}
  </div>;
}
