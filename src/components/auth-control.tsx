'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Wallet, LayoutDashboard } from 'lucide-react';
import type { AuthSettings } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import { SignInCard, type Copy } from './sign-in-card';

type AccountLinks = { workspace: { label: string; href: string }; credits: { label: string; href: string }; pricing: { label: string; href: string } };
export function AuthControl({ copy, methods, userName, userEmail, callbackURL, locale, inviteRequired = false, variant = 'default', accountLinks }: { copy: Copy; methods: Pick<AuthSettings, 'email' | 'google' | 'github'>; userName?: string; userEmail?: string; callbackURL: string; locale: string; inviteRequired?: boolean; variant?: 'default' | 'avatar'; accountLinks?: AccountLinks }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { setOpen(false); }, [pathname]);
  useDismissableLayer({ active: open, area, trigger, onClose: () => setOpen(false) });

  async function signOut() {
    setPending(true);
    setError('');
    try { const result = await authClient.signOut(); if (result.error) setError(copy.signOutFailed); else { setOpen(false); router.refresh(); } }
    catch { setError(copy.signOutFailed); }
    finally { setPending(false); }
  }

  if (!userName) return <SignInCard copy={copy} methods={methods} callbackURL={callbackURL} locale={locale} inviteRequired={inviteRequired} variant={variant} />;
  return <div className={variant === 'avatar' ? 'auth-actions replica-auth' : 'auth-actions'} ref={area}>
    {variant === 'avatar' ? <>
      <button ref={trigger} className="replica-avatar" type="button" aria-label={copy.name} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(value => !value)}>{userName.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</button>
      {open && <div className="replica-popover replica-account-menu" role="menu" aria-label={copy.name}>
        <div className="replica-profile"><span className="replica-avatar replica-avatar-large" aria-hidden="true">{userName.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{userName}</strong>{userEmail && <small>{userEmail}</small>}</div></div>
        {accountLinks && <div className="replica-account-list">
          <a role="menuitem" href={accountLinks.workspace.href}><LayoutDashboard size={18} />{accountLinks.workspace.label}</a>
          <a role="menuitem" href={accountLinks.credits.href}><Wallet size={18} />{accountLinks.credits.label}</a>
          <a role="menuitem" href={accountLinks.pricing.href}>{accountLinks.pricing.label}</a>
        </div>}
        <div className="replica-account-list"><button role="menuitem" type="button" className="replica-sign-out" disabled={pending} onClick={() => void signOut()}><LogOut size={18} />{copy.logout}</button></div>
      </div>}
    </> : <><span className="account-name" title={userName}>{userName}</span><button className="auth-button" type="button" disabled={pending} onClick={() => void signOut()}>{copy.logout}</button></>}
    {error && <p className="auth-error" role="alert">{error}</p>}
  </div>;
}
