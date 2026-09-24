'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient({ basePath: '/api/auth' });

export function AuthControl({ login, logout, userName }: { login: string; logout: string; userName?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function signIn() {
    setPending(true);
    setError('');
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/' });
      if (result.error) { setError('Google sign-in could not start. Please try again.'); setPending(false); }
    } catch {
      setError('Google sign-in could not start. Please try again.');
      setPending(false);
    }
  }

  async function signOut() {
    setPending(true);
    setError('');
    try { await authClient.signOut(); router.refresh(); }
    catch { setError('Sign-out failed. Please try again.'); }
    finally { setPending(false); }
  }

  return <div className="auth-actions">
    {userName && <span className="account-name" title={userName}>{userName}</span>}
    <button className="auth-button" type="button" disabled={pending} onClick={userName ? signOut : signIn}>
      {!userName && <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.01v2.51h3.24c1.9-1.75 2.98-4.34 2.98-7.34Z"/><path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.51c-.9.6-2.04.96-3.4.96-2.62 0-4.84-1.77-5.63-4.15H3.04v2.58A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.37 13.87a6 6 0 0 1 0-3.74V7.55H3.04a10 10 0 0 0 0 8.9l3.33-2.58Z"/><path fill="#EA4335" d="M12 5.98c1.47 0 2.8.5 3.84 1.51l2.88-2.88A9.56 9.56 0 0 0 12 2a10 10 0 0 0-8.96 5.55l3.33 2.58C7.16 7.75 9.38 5.98 12 5.98Z"/></svg>}
      {pending ? 'Please wait…' : userName ? logout : login}
    </button>
    {error && <p className="auth-error" role="alert">{error}</p>}
  </div>;
}
