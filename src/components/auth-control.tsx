'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AccountPopoverCard } from './blocks/account-popover-card';
import { inviteGateRows, type AccountLinks } from './blocks/account-gate-rows';
import { AvatarTrigger, ProfileHeader } from './blocks/account-profile';
import type { AuthSettings } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import { SignInCard, type Copy } from './sign-in-card';

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
      <AvatarTrigger buttonRef={trigger} name={userName} label={copy.name} open={open} onClick={() => setOpen(value => !value)} />
      {open && <AccountPopoverCard role="menu" label={copy.name} className="account-menu" header={<ProfileHeader name={userName} email={userEmail} />} rows={inviteGateRows(accountLinks, copy.logout, () => void signOut(), pending)} />}
    </> : <><span className="account-name" title={userName}>{userName}</span><button className="auth-button" type="button" disabled={pending} onClick={() => void signOut()}>{copy.logout}</button></>}
    {error && <p className="auth-error" role="alert">{error}</p>}
  </div>;
}
