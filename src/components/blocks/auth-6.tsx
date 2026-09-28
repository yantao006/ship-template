'use client';

// Adapted from the licensed React Bits Pro Auth-6 block for the shared sign-in dialog.
import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type FocusEvent, type FormEvent, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { authClient } from '@/lib/auth-client';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CODE_LENGTH = 6;

type Auth6Props = {
  email: string;
  copy: {
    codeTitle: string; codeSent: string; codeExpiry: string; verifyCode: string;
    differentEmail: string; close: string; codeInvalid: string; codeSendFailed: string;
    resendCode: string; resendIn: string; didNotReceive: string;
  };
  onClose: () => void;
  onDifferentEmail: () => void;
  onAuthenticated: () => Promise<void>;
  returnFocus: RefObject<HTMLElement | null>;
};

export function Auth6({ email, copy, onClose, onDifferentEmail, onAuthenticated, returnFocus }: Auth6Props) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(30);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const dialog = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isComplete = code.every(Boolean);
  useDismissableLayer({ active: true, area: dialog, backdrop, trigger: returnFocus, onClose, trapFocus: true });

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown(seconds => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const focusInput = (index: number) => inputsRef.current[index]?.focus();
  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(-1);
    setCode(current => { const next = [...current]; next[index] = value; return next; });
    if (value && index < CODE_LENGTH - 1) focusInput(index + 1);
  };
  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) focusInput(index - 1);
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); focusInput(index - 1); }
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) { event.preventDefault(); focusInput(index + 1); }
  };
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    setCode(Array(CODE_LENGTH).fill('').map((_, index) => pasted[index] ?? ''));
    focusInput(Math.min(pasted.length, CODE_LENGTH - 1));
  };
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => event.target.select();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete || pending) return;
    setPending(true);
    setError('');
    try {
      const result = await authClient.signIn.emailOtp({ email, otp: code.join('') });
      if (result.error) setError(copy.codeInvalid);
      else await onAuthenticated();
    } catch { setError(copy.codeInvalid); }
    finally { setPending(false); }
  };
  const handleResend = async () => {
    if (pending || cooldown > 0) return;
    setPending(true);
    setError('');
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
      if (result.error) setError(copy.codeSendFailed);
      else { setCode(Array(CODE_LENGTH).fill('')); setCooldown(30); focusInput(0); }
    } catch { setError(copy.codeSendFailed); }
    finally { setPending(false); }
  };

  const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };
  const renderInput = (index: number) => <input
    key={index}
    ref={element => { inputsRef.current[index] = element; }}
    id={`auth6-digit-${index + 1}`}
    name={`digit-${index + 1}`}
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={1}
    autoComplete={index === 0 ? 'one-time-code' : 'off'}
    value={code[index]}
    onChange={event => handleChange(index, event)}
    onKeyDown={event => handleKeyDown(index, event)}
    onPaste={handlePaste}
    onFocus={handleFocus}
    aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
    className={code[index] ? 'auth6-digit is-filled' : 'auth6-digit'}
  />;

  return createPortal(<div ref={backdrop} className="auth6-overlay">
    <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="auth6-title" className="auth6-dialog">
      <motion.div initial="hidden" animate="visible" variants={container} className="auth6-content">
        <div className="auth6-top">
          <button type="button" className="auth6-back" onClick={onDifferentEmail}>
            <ArrowLeft size={16} aria-hidden="true" />{copy.differentEmail}
          </button>
          <button type="button" className="auth6-close" onClick={onClose} aria-label={copy.close}><X size={20} aria-hidden="true" /></button>
        </div>
        <motion.div variants={item} className="auth6-intro">
          <h2 id="auth6-title">{copy.codeTitle}</h2>
          <p>{copy.codeSent}<strong>{email}</strong></p>
          <p className="auth6-expiry">{copy.codeExpiry}</p>
        </motion.div>
        <motion.form variants={item} onSubmit={handleSubmit} className="auth6-form">
          <fieldset>
            <legend className="sr-only">6-digit verification code</legend>
            <div className="auth6-digits">
              <div className="auth6-group">{[0, 1, 2].map(renderInput)}</div>
              <span className="auth6-separator" aria-hidden="true" />
              <div className="auth6-group">{[3, 4, 5].map(renderInput)}</div>
            </div>
          </fieldset>
          <button type="submit" disabled={!isComplete || pending} className="auth6-submit">{copy.verifyCode}</button>
        </motion.form>
        <motion.p variants={item} className="auth6-resend" aria-live="polite">
          {copy.didNotReceive}{' '}{cooldown > 0 ? <span className="auth6-countdown">{copy.resendIn.replace('{seconds}', String(cooldown))}</span> :
            <button type="button" disabled={pending} onClick={() => void handleResend()}>{copy.resendCode}</button>}
        </motion.p>
        {error && <p role="alert" className="auth6-error">{error}</p>}
      </motion.div>
    </section>
  </div>, document.body);
}
