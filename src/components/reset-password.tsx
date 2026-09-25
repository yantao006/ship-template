'use client';

import React, { useState, type FormEvent } from 'react';
import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient({ basePath: '/api/auth' });

export function ResetPassword({ locale, token, enabled, copy }: {
  locale: string;
  token: string;
  enabled: boolean;
  copy: { resetTitle: string; resetHint: string; newPassword: string; confirmPassword: string; updatePassword: string; resetSuccess: string; resetInvalid: string; passwordMismatch: string; wait: string; signIn: string };
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(enabled && token ? '' : copy.resetInvalid);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || !token || pending) return;
    if (password !== confirm) { setError(copy.passwordMismatch); return; }
    setPending(true);
    setError('');
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) setError(copy.resetInvalid);
      else setNotice(copy.resetSuccess);
    } catch { setError(copy.resetInvalid); }
    finally { setPending(false); }
  }
  return <main className="reset-page"><section className="auth-panel">
    <h1>{copy.resetTitle}</h1>
    <p>{copy.resetHint}</p>
    {enabled && token && !notice && <form onSubmit={submit}>
      <label>{copy.newPassword}<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} /></label>
      <label>{copy.confirmPassword}<input type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={event => setConfirm(event.target.value)} /></label>
      <button className="auth-button" type="submit" disabled={pending}>{pending ? copy.wait : copy.updatePassword}</button>
    </form>}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <a className="auth-switch" href={`/${locale}`}>{copy.signIn}</a>
  </section></main>;
}
