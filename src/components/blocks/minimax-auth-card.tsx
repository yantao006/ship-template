'use client';

// Visual variant of auth-4.tsx. Keep that licensed original untouched.
import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { requestJson } from '@/lib/json-request';
import { routePath } from '@/lib/route-paths';
import type { Auth4Props } from './auth-4';
import { Auth6 } from './auth-6';

const GoogleMark = () => <svg className="minimax-auth-google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="rgb(66,133,244)" d="M21.6 12.23c0-.71-.06-1.37-.19-2H12v3.79h5.38a4.6 4.6 0 0 1-2 3.02v2.48h3.22c1.88-1.74 3-4.3 3-7.29Z"/><path fill="rgb(52,168,83)" d="M12 22c2.7 0 4.97-.9 6.6-2.48l-3.22-2.48c-.89.6-2.02.96-3.38.96a6 6 0 0 1-5.64-4.15H3.04v2.56A10 10 0 0 0 12 22Z"/><path fill="rgb(251,188,5)" d="M6.36 13.85a6.04 6.04 0 0 1 0-3.7V7.59H3.04a10 10 0 0 0 0 8.82l3.32-2.56Z"/><path fill="rgb(234,67,53)" d="M12 6c1.47 0 2.78.51 3.82 1.5l2.85-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.59l3.32 2.56A6 6 0 0 1 12 6Z"/></svg>;
const GitHubMark = () => <svg className="minimax-auth-google-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98.01 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>;

export type MinimaxAuthCardProps = Auth4Props & {
  card: {
    welcome: string; mediaLines: readonly string[]; welcomeCredits: string; welcomeCreditsDetail: string;
    workflows: string; workflowsDetail: string; preview: string; previewDetail: string;
    emailAction: string; or: string; agreement: string; terms: string; privacy: string; and: string;
  };
  signupCredits: number;
  onCodeOpenChange?: (open: boolean) => void;
  onCloseAuth?: () => void;
};

export function MinimaxAuthCard({ copy, card, signupCredits, brand, logo, methods, inviteRequired, locale, callbackURL, onAuthenticated, onOAuthStart, onOAuthFailure, onCodeOpenChange, onCloseAuth }: MinimaxAuthCardProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot' | 'verify'>('sign-in');
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [codeOpen, setCodeOpen] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const emailInput = useRef<HTMLInputElement>(null);
  const openCode = () => { setSentEmail(email.trim()); setCodeOpen(true); onCodeOpenChange?.(true); };
  const closeCode = () => { setCodeOpen(false); onCodeOpenChange?.(false); };
  const changeEmail = () => { closeCode(); requestAnimationFrame(() => emailInput.current?.focus()); };
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const needsVerification = methods.email.requireVerification;
  const canReset = methods.email.passwordReset;
  const switchMode = (next: typeof mode) => { setMode(next); setEmailExpanded(true); closeCode(); setError(''); setNotice(''); };

  async function social(provider: 'google' | 'github') {
    if (!methods[provider].enabled || pending) return;
    setPending(true);
    setError('');
    try {
      onOAuthStart?.();
      const result = await authClient.signIn.social({ provider, callbackURL });
      if (result.error) { onOAuthFailure?.(); setError(copy.socialFailed); }
    } catch { onOAuthFailure?.(); setError(copy.socialFailed); }
    finally { setPending(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !methods.email.enabled) return;
    setPending(true);
    setError('');
    try {
      if (mode === 'forgot') {
        const result = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: routePath(locale, 'resetPassword') });
        if (result.error) setError(copy.resetSendFailed);
        else setNotice(copy.resetSent);
      } else if (mode === 'verify') {
        const result = await authClient.sendVerificationEmail({ email: email.trim(), callbackURL });
        if (result.error) setError(copy.resendFailed);
        else setNotice(copy.verificationSent);
      } else if (mode === 'sign-in') {
        const sent = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: 'sign-in' });
        if (sent.error) setError(copy.codeSendFailed);
        else openCode();
      } else {
        const code = inviteCode.trim().toUpperCase();
        if (inviteRequired) {
          const validation = await requestJson('/api/invites/validate', { code });
          if (!validation.ok || !(await validation.json() as { valid: boolean }).valid) { setError(copy.inviteInvalid); return; }
        }
        const result = await authClient.signUp.email({ email: email.trim(), password, name: name.trim(), ...(needsVerification ? { callbackURL } : {}), ...(inviteRequired ? { inviteCode: code } : {}) } as Parameters<typeof authClient.signUp.email>[0]);
        if (result.error) setError(result.error.message ?? copy.authFailed);
        else if (needsVerification) {
          switchMode('verify'); setNotice(copy.verificationSent);
        } else {
          if (inviteRequired) {
            const redeemed = await requestJson('/api/invites/redeem', { code });
            if (!redeemed.ok) { setError(copy.createdButInviteFailed); return; }
          }
          await onAuthenticated('sign-up');
        }
      }
    } catch { setError(copy.authFailed); }
    finally { setPending(false); }
  }

  const title = mode === 'verify' ? copy.verifyTitle : mode === 'forgot' ? copy.forgotTitle : mode === 'sign-up' ? copy.signUp : copy.signIn;
  const initial = mode === 'sign-in';
  const benefits = [
    [card.welcomeCredits, card.welcomeCreditsDetail.replace('{credits}', String(signupCredits))],
    [card.workflows, card.workflowsDetail],
    [card.preview, card.previewDetail],
  ];

  return <><div className="minimax-auth">
    <aside className="minimax-auth-media" aria-hidden="true">
      <img className="minimax-auth-photo" src="/video-tool/professional-headshot.webp" alt="" />
      <div className="minimax-auth-media-top">{logo && <img src={logo.src} alt="" />}{brand}</div>
      <p className="minimax-auth-media-bottom">{card.mediaLines.map((line, index) => <span key={index}>{line}</span>)}</p>
    </aside>
    <div className="minimax-auth-content">
      {initial && emailExpanded && <button type="button" className="minimax-auth-link minimax-auth-mobile-sign-up" onClick={() => switchMode('sign-up')}>{copy.signUp}</button>}
      {initial ? <>
        <div className="minimax-auth-intro">
          <h2 id="auth4-title">{card.welcome} {brand}</h2>
          <div className="minimax-auth-benefits">
            {benefits.map(([heading, detail]) => <div className="minimax-auth-benefit" key={heading}>
              <span className="minimax-auth-benefit-icon"><Check size={16} strokeWidth={2.5} aria-hidden="true" /></span>
              <div className="minimax-auth-benefit-text"><strong>{heading}</strong><span>{detail}</span></div>
            </div>)}
          </div>
        </div>
        <div className="minimax-auth-actions">
          {methods.google.enabled && <button className="minimax-auth-primary" type="button" disabled={pending} onClick={() => void social('google')}><GoogleMark />{copy.google}</button>}
          {methods.github.enabled && <button className="minimax-auth-primary" type="button" disabled={pending} onClick={() => void social('github')}><GitHubMark />{copy.github}</button>}
          {methods.email.enabled && <div className={`minimax-auth-email-group${emailExpanded ? ' is-expanded' : ''}`}>
            {(methods.google.enabled || methods.github.enabled) && <div className="minimax-auth-divider" aria-hidden="true"><span>{card.or}</span></div>}
            {emailExpanded ? <form className="minimax-auth-inline-form" onSubmit={submit}>
              <div className="minimax-auth-inline-fields">
                <Mail className="minimax-auth-inline-icon" size={16} aria-hidden="true" />
                <input ref={emailInput} name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={copy.emailLabel} aria-label={copy.emailLabel} required autoComplete="email" />
                <button type="submit" disabled={pending} aria-label={pending ? copy.wait : copy.sendCode}><ArrowRight size={18} aria-hidden="true" /></button>
              </div>
              <button type="button" className="minimax-auth-link minimax-auth-sign-up" onClick={() => switchMode('sign-up')}>{copy.signUp}</button>
            </form> : <button className="minimax-auth-email-action" type="button" onClick={() => setEmailExpanded(true)}><Mail size={16} aria-hidden="true" />{card.emailAction}</button>}
          </div>}
          <p className="minimax-auth-terms">{card.agreement} <a href={routePath(locale, 'terms')}>{card.terms}</a> {card.and} <a href={routePath(locale, 'privacy')}>{card.privacy}</a></p>
          {error && <p role="alert" className="minimax-auth-error">{error}</p>}
        </div>
      </> : <div className="minimax-auth-form-view">
        <h2 id="auth4-title">{title}</h2>
        {mode === 'verify' ? <div className="minimax-auth-form">
          <p role="status">{notice} {email}</p><p>{copy.verifyHint}</p>
          <button type="button" disabled={pending} className="minimax-auth-primary" onClick={async () => { if (pending) return; setPending(true); try { const result = await authClient.sendVerificationEmail({ email: email.trim(), callbackURL }); if (result.error) setError(copy.resendFailed); else setNotice(copy.verificationSent); } catch { setError(copy.resendFailed); } finally { setPending(false); } }}>{pending ? copy.wait : copy.resendVerification}</button>
          <a href={`${routePath(locale, 'verifyEmail')}?email=${encodeURIComponent(email)}`}>{copy.verifyLink}</a>
          <button type="button" className="minimax-auth-link" onClick={() => switchMode('sign-in')}>{copy.signIn}</button>
        </div> : <>
          {mode === 'forgot' && <p className="minimax-auth-hint">{copy.forgotHint}</p>}
          <form className="minimax-auth-form" onSubmit={submit}>
            {mode === 'sign-up' && <label>{copy.name}<input name="name" value={name} onChange={event => setName(event.target.value)} required autoComplete="name" /></label>}
            <label>{copy.emailLabel}<input name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /></label>
            {mode === 'sign-up' && <label>{copy.password}<span className="minimax-auth-password"><input name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" /><button type="button" aria-label={showPassword ? copy.hidePassword : copy.showPassword} onClick={() => setShowPassword(current => !current)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>}
            {mode === 'sign-up' && needsVerification && <p className="minimax-auth-hint">{copy.verifyHint}</p>}
            {mode === 'sign-up' && inviteRequired && <label>{copy.invite}<input name="inviteCode" value={inviteCode} onChange={event => setInviteCode(event.target.value)} required maxLength={32} /></label>}
            <button type="submit" disabled={pending} className="minimax-auth-primary">{pending ? copy.wait : mode === 'forgot' ? copy.forgotPassword : copy.signUp}<ArrowRight size={18} aria-hidden="true" /></button>
          </form>
          <div className="minimax-auth-form-links">
            {mode === 'sign-up' && canReset && <button type="button" className="minimax-auth-link" onClick={() => switchMode('forgot')}>{copy.forgotPassword}</button>}
            <button type="button" className="minimax-auth-link" onClick={() => switchMode('sign-in')}>{copy.signIn}</button>
          </div>
        </>}
        {notice && mode === 'forgot' && <p role="status" className="minimax-auth-hint">{notice}</p>}
        {error && <p role="alert" className="minimax-auth-error">{error}</p>}
        <p className="minimax-auth-assurance"><ShieldCheck size={14} aria-hidden="true" />{copy.assurance}</p>
      </div>}
    </div>
  </div>
  {codeOpen && <Auth6 email={sentEmail} copy={copy} onClose={onCloseAuth ?? closeCode} onDifferentEmail={changeEmail} onAuthenticated={() => onAuthenticated('email-code')} returnFocus={emailInput} />}
  </>;
}
