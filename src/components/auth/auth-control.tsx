'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { AccountPopoverCard } from '../account/account-popover-card';
import { inviteGateRows, type AccountLinks } from '../account/account-gate-rows';
import { AvatarTrigger, ProfileHeader } from '../account/account-profile';
import type { AuthSettings } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import { MinimaxAuthCard, type Copy, type MinimaxAuthCardProps } from './minimax-auth-card';
import { serverHasSession, useOptionalAuthDialog } from './auth-dialog';
import { UserRound, X } from 'lucide-react';

type StandaloneCard = Pick<MinimaxAuthCardProps, 'brand' | 'logo' | 'authMarketingImage' | 'supportEmail' | 'card' | 'signupCredits'>;

export function AuthControl({ copy, methods, standaloneCard, userName, userEmail, callbackURL, locale, inviteRequired = false, variant = 'default', accountLinks }: { copy: Copy; methods: Pick<AuthSettings, 'email' | 'google' | 'github'>; standaloneCard: StandaloneCard; userName?: string; userEmail?: string; callbackURL: string; locale: string; inviteRequired?: boolean; variant?: 'default' | 'avatar'; accountLinks?: AccountLinks }) {
  const authDialog = useOptionalAuthDialog();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [standaloneOpen, setStandaloneOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const standaloneDialog = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { setOpen(false); setStandaloneOpen(false); setCodeOpen(false); }, [pathname]);
  useDismissableLayer({ active: open, area, trigger, onClose: () => setOpen(false) });
  const closeStandalone = () => { setStandaloneOpen(false); setCodeOpen(false); };
  useDismissableLayer({ active: standaloneOpen && !codeOpen, area: standaloneDialog, trigger, backdrop, onClose: closeStandalone, trapFocus: true });
  useEffect(() => {
    if (!standaloneOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [standaloneOpen]);

  async function onStandaloneAuthenticated(method: 'email-code' | 'sign-up') {
    if (!(await serverHasSession())) throw new Error(copy.authFailed);
    if (callbackURL.startsWith('/auth-callback?')) {
      window.location.assign(callbackURL);
    } else if (method === 'email-code') {
      window.location.reload();
    } else {
      closeStandalone();
      router.refresh();
    }
  }

  async function signOut() {
    setPending(true);
    setError('');
    try { const result = await authClient.signOut(); if (result.error) setError(copy.signOutFailed); else { setOpen(false); router.refresh(); } }
    catch { setError(copy.signOutFailed); }
    finally { setPending(false); }
  }

  if (!userName) return <div className={variant === 'avatar' ? 'auth-actions replica-auth' : 'auth-actions'}>
    {variant === 'avatar' ? <button ref={trigger} className="replica-avatar" type="button" aria-label={copy.login} aria-haspopup="dialog" onClick={() => authDialog ? void authDialog.openAuth({ source: 'navigation', intent: 'stay', showImmediately: true }) : setStandaloneOpen(true)}><UserRound size={19} aria-hidden="true" /></button> : (methods.google.enabled || methods.github.enabled || methods.email.enabled) ? <button ref={trigger} className="ui-button-solid auth-button" type="button" onClick={() => authDialog ? void authDialog.openAuth({ source: 'navigation', intent: 'stay' }) : setStandaloneOpen(true)}>{copy.login}</button> : <span className="account-name">{copy.noMethods}</span>}
    {!authDialog && standaloneOpen && createPortal(<div ref={backdrop} className="auth4-overlay minimax-auth-overlay" aria-label={copy.signIn}>
      <div ref={standaloneDialog} role="dialog" aria-modal={!codeOpen} hidden={codeOpen} inert={codeOpen} aria-labelledby="auth4-title" className="auth4-dialog minimax-auth-dialog ui-enter-scale">
        <button type="button" className="auth4-close" onClick={closeStandalone} aria-label={copy.close}><X size={20} /></button>
        <MinimaxAuthCard {...standaloneCard} copy={copy} methods={methods} locale={locale} callbackURL={callbackURL} inviteRequired={inviteRequired} onAuthenticated={onStandaloneAuthenticated} onCodeOpenChange={setCodeOpen} onCloseAuth={closeStandalone} />
      </div>
    </div>, document.body)}
  </div>;
  return <div className={variant === 'avatar' ? 'auth-actions replica-auth' : 'auth-actions'} ref={area}>
    {variant === 'avatar' ? <>
      <AvatarTrigger buttonRef={trigger} name={userName} label={copy.name} open={open} onClick={() => setOpen(value => !value)} />
      {open && <AccountPopoverCard role="menu" label={copy.name} className="account-menu" header={<ProfileHeader name={userName} email={userEmail} />} rows={inviteGateRows(accountLinks, copy.logout, () => void signOut(), pending)} />}
    </> : <><span className="account-name" title={userName}>{userName}</span><button className="ui-button-solid auth-button" type="button" disabled={pending} onClick={() => void signOut()}>{copy.logout}</button></>}
    {error && <p className="auth-error" role="alert">{error}</p>}
  </div>;
}
