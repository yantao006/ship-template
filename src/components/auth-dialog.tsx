'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { MinimaxAuthCard, type MinimaxAuthCardProps } from './blocks/minimax-auth-card';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';

const storageKey = 'site-auth-return';
export type AuthIntent = { source?: string; intent?: 'stay' | 'open-history' | 'restore-draft' | 'resume-checkout'; draftId?: string; onSuccess?: () => void };
type AuthContextValue = { openAuth: (options?: AuthIntent) => Promise<boolean>; closeAuth: () => void };
const Context = createContext<AuthContextValue | null>(null);

export function useOptionalAuthDialog() { return useContext(Context); }

export function useAuthDialog() {
  const value = useContext(Context);
  if (!value) throw new Error('Auth dialog must be inside SiteShell');
  return value;
}

// Never let a caller turn an OAuth callback into an external redirect.
export function safeReturnPath(path: string, origin: string) {
  if (!path.startsWith('/') || path.startsWith('//') || /[\\\r\n]/.test(path)) return '/';
  try { const target = new URL(path, origin); return target.origin === origin ? `${target.pathname}${target.search}${target.hash}` : '/'; }
  catch { return '/'; }
}

async function serverHasSession() {
  const response = await fetch('/api/auth/get-session', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) return false;
  const session = await response.json() as { session?: { id: string }; user?: { id: string } } | null;
  return !!session?.session && !!session.user;
}

export function AuthDialogProvider({ children, ...auth }: Omit<MinimaxAuthCardProps, 'onAuthenticated' | 'onOAuthStart'> & { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>({});
  const shell = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const active = useRef(false);
  const opening = useRef(false);
  const attempt = useRef(0);
  const oauthConsumed = useRef(false);
  const router = useRouter();
  const closeAuth = useCallback(() => {
    attempt.current += 1;
    active.current = false;
    setOpen(false);
    setCodeOpen(false);
    setIntent({});
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem('pricing-auth-selection');
  }, []);
  useDismissableLayer({ active: open && !codeOpen, area: dialog, trigger, backdrop, onClose: closeAuth, trapFocus: true });

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (shell.current) shell.current.inert = true;
    return () => { document.body.style.overflow = oldOverflow; if (shell.current) shell.current.inert = false; };
  }, [open]);

  // OAuth's full-page redirect consumes the recorded intent only after the
  // callback has established a real session. It never replays a paid action.
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (!saved || oauthConsumed.current) return;
    oauthConsumed.current = true;
    void serverHasSession().then(ok => {
      // A failed/cancelled OAuth callback must not leave a stale navigation intent
      // that could fire on a later, unrelated sign-in.
      sessionStorage.removeItem(storageKey);
      if (!ok) return;
      try {
        const remembered = JSON.parse(saved) as { intent?: string; draftId?: string; returnTo?: string };
        const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (remembered.intent === 'open-history' && remembered.draftId && remembered.returnTo === current) {
          router.push(safeReturnPath(remembered.draftId, window.location.origin));
          return;
        }
      } catch { /* Stale context cannot authorize navigation. */ }
      router.refresh();
    }).catch(() => {});
  }, [router]);

  const openAuth = useCallback(async (options: AuthIntent = {}) => {
    if (active.current || opening.current) return false;
    opening.current = true;
    try {
      if (await serverHasSession()) { options.onSuccess?.(); router.refresh(); return true; }
    } catch { /* Network failures leave the form available for retry. */ }
    finally { opening.current = false; }
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    attempt.current += 1;
    setIntent(options);
    active.current = true;
    setOpen(true);
    return false;
  }, [router]);

  // Bind each form mount to its own attempt: a late response from a dismissed
  // form may refresh identity, but must not resume a newer form's action.
  const mountedAttempt = attempt.current;
  const onAuthenticated = async (method: 'email-code' | 'sign-up') => {
    if (!(await serverHasSession())) throw new Error(auth.copy.authFailed);
    if (!active.current || mountedAttempt !== attempt.current) { router.refresh(); return; }
    if (method === 'sign-up') {
      const resume = intent.onSuccess;
      closeAuth();
      router.refresh();
      // Callers may restore UI state, never auto-submit a paid operation.
      resume?.();
      return;
    }
    // The tool saves a serializable draft synchronously before the modal closes
    // and before a full reload can unmount its state.
    window.dispatchEvent(new Event('site-auth-reload-start'));
    if (intent.intent === 'open-history' && intent.draftId) {
      const returnTo = safeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`, window.location.origin);
      sessionStorage.setItem(storageKey, JSON.stringify({ intent: intent.intent, draftId: intent.draftId, returnTo }));
    }
    attempt.current += 1;
    active.current = false;
    flushSync(() => { setOpen(false); setIntent({}); });
    window.location.reload();
  };
  const onOAuthStart = () => {
    const returnTo = safeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`, window.location.origin);
    sessionStorage.setItem(storageKey, JSON.stringify({ source: intent.source, intent: intent.intent, draftId: intent.draftId, returnTo }));
    window.dispatchEvent(new Event('site-auth-oauth-start'));
  };
  const onOAuthFailure = () => {
    sessionStorage.removeItem(storageKey);
    window.dispatchEvent(new Event('site-auth-oauth-cancel'));
  };
  const callbackURL = typeof window === 'undefined' ? auth.callbackURL : safeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`, window.location.origin);
  return <Context.Provider value={{ openAuth, closeAuth }}>
    <div ref={shell} className="public-shell">{children}</div>
    {open && createPortal(<div ref={backdrop} className="auth4-overlay minimax-auth-overlay" aria-label={auth.copy.signIn}>
      <div ref={dialog} role="dialog" aria-modal={!codeOpen} aria-hidden={codeOpen} inert={codeOpen} aria-labelledby="auth4-title" className="auth4-dialog minimax-auth-dialog">
        <button type="button" className="auth4-close" onClick={closeAuth} aria-label={auth.copy.close}><X size={20} /></button>
        <MinimaxAuthCard {...auth} callbackURL={callbackURL} onAuthenticated={onAuthenticated} onOAuthStart={onOAuthStart} onOAuthFailure={onOAuthFailure} onCodeOpenChange={setCodeOpen} />
      </div>
    </div>, document.body)}
  </Context.Provider>;
}
