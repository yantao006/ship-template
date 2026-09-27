"use client";

// Adapted from the supplied licensed @reactbits-pro/auth-4 source. Its layout,
// animated brand panel and form hierarchy remain; identity stays with better-auth.
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { authClient } from "@/lib/auth-client";
import { requestJson } from "@/lib/json-request";
import { routePath } from "@/lib/route-paths";
import type { AuthSettings } from "@/lib/auth";
import type { Copy } from "@/components/sign-in-card";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GoogleMark = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>;
const GitHubMark = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98.01 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" /></svg>;
const rings = ["h-40 w-40", "h-[280px] w-[280px]", "h-[400px] w-[400px]", "h-[520px] w-[520px]"];
const inputClasses = "h-11 w-full rounded-xl border border-neutral-300 bg-white px-3.5 text-base text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:hover:border-neutral-600 dark:focus:border-white dark:focus:ring-white/10 sm:text-sm";
const oauthClasses = "flex h-11 cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:ring-white disabled:cursor-wait disabled:opacity-60";
const linkClasses = "rounded-lg border-0 bg-transparent p-0 font-medium text-neutral-900 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-white dark:hover:text-neutral-300";

export type Auth4Props = {
  copy: Copy;
  brand: string;
  logo?: { src: string; alt: string };
  supportEmail: string;
  methods: Pick<AuthSettings, "email" | "google" | "github">;
  inviteRequired: boolean;
  locale: string;
  callbackURL: string;
  onAuthenticated: () => Promise<void>;
  onOAuthStart?: () => void;
  onOAuthFailure?: () => void;
};

export function Auth4({ copy, brand, logo, supportEmail, methods, inviteRequired, locale, callbackURL, onAuthenticated, onOAuthStart, onOAuthFailure }: Auth4Props) {
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "forgot" | "verify">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const reduce = useReducedMotion();
  const needsVerification = methods.email.requireVerification;
  const canReset = methods.email.passwordReset;
  const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
  const item: Variants = { hidden: { opacity: 0, y: reduce ? 0 : 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };
  const title = mode === "verify" ? copy.verifyTitle : mode === "forgot" ? copy.forgotTitle : mode === "sign-up" ? copy.signUp : copy.signIn;
  const switchMode = (next: typeof mode) => { setMode(next); setError(""); setNotice(""); };

  async function social(provider: "google" | "github") {
    if (!methods[provider].enabled || pending) return;
    setPending(true);
    setError("");
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
    setError("");
    try {
      if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: routePath(locale, "resetPassword") });
        if (result.error) setError(copy.resetSendFailed);
        else setNotice(copy.resetSent);
      } else if (mode === "verify") {
        const result = await authClient.sendVerificationEmail({ email: email.trim(), callbackURL });
        if (result.error) setError(copy.resendFailed);
        else setNotice(copy.verificationSent);
      } else {
        const code = inviteCode.trim().toUpperCase();
        if (mode === "sign-up" && inviteRequired) {
          const validation = await requestJson("/api/invites/validate", { code });
          if (!validation.ok || !(await validation.json() as { valid: boolean }).valid) { setError(copy.inviteInvalid); return; }
        }
        const result = mode === "sign-up"
          ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim(), ...(needsVerification ? { callbackURL } : {}), ...(inviteRequired ? { inviteCode: code } : {}) } as Parameters<typeof authClient.signUp.email>[0])
          : await authClient.signIn.email({ email: email.trim(), password });
        if (result.error) {
          if (needsVerification && mode === "sign-in" && (result.error.code === "EMAIL_NOT_VERIFIED" || (result.error.status === 403 && /not verified/i.test(result.error.message ?? "")))) {
            switchMode("verify"); setNotice(copy.emailNotVerified);
          } else setError(result.error.message ?? copy.authFailed);
        } else if (mode === "sign-up" && needsVerification) {
          switchMode("verify"); setNotice(copy.verificationSent);
        } else {
          if (mode === "sign-up" && inviteRequired) {
            const redeemed = await requestJson("/api/invites/redeem", { code });
            if (!redeemed.ok) { setError(copy.createdButInviteFailed); return; }
          }
          await onAuthenticated();
        }
      }
    } catch { setError(copy.authFailed); }
    finally { setPending(false); }
  }

  return (
    <div className="auth4 mx-auto grid w-full max-w-[960px] grid-cols-1 overflow-hidden rounded-3xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 dark:text-white min-[850px]:grid-cols-2">
      <motion.div initial={reduce ? false : "hidden"} animate="visible" variants={container} className="flex min-w-0 flex-col gap-6 px-6 py-8 sm:px-10 min-[850px]:px-12 min-[850px]:py-10">
        <motion.header variants={item} className="flex items-center justify-between gap-3 pr-7">
          <span className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">{logo ? <img src={logo.src} alt={logo.alt} className="h-6 w-6 object-contain" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}</span>
            {brand}
          </span>
          <a href={`mailto:${supportEmail}`} className="hidden text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white sm:inline">{supportEmail}</a>
        </motion.header>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <motion.div variants={item} className="mb-6">
            <h2 id="auth4-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{copy.intro}</p>
          </motion.div>
          {mode === "verify" ? <motion.div variants={item} className="space-y-4 text-sm">
            <p role="status">{notice} {email}</p><p>{copy.verifyHint}</p>
            <button type="button" disabled={pending} className={oauthClasses} onClick={async () => { if (pending) return; setPending(true); try { const result = await authClient.sendVerificationEmail({ email: email.trim(), callbackURL }); if (result.error) setError(copy.resendFailed); else setNotice(copy.verificationSent); } catch { setError(copy.resendFailed); } finally { setPending(false); } }}>{pending ? copy.wait : copy.resendVerification}</button>
            <a href={`${routePath(locale, "verifyEmail")}?email=${encodeURIComponent(email)}`} className={linkClasses}>{copy.verifyLink}</a>
            <button type="button" className={linkClasses} onClick={() => switchMode("sign-in")}>{copy.signIn}</button>
          </motion.div> : <>
            {mode === "sign-in" && (methods.google.enabled || methods.github.enabled) && <motion.div variants={item} className="grid grid-cols-1 gap-3">
              {methods.google.enabled && <button type="button" disabled={pending} className={oauthClasses} onClick={() => void social("google")}><GoogleMark />{copy.google}</button>}
              {methods.github.enabled && <button type="button" disabled={pending} className={oauthClasses} onClick={() => void social("github")}><GitHubMark />{copy.github}</button>}
            </motion.div>}
            {mode === "sign-in" && methods.email.enabled && (methods.google.enabled || methods.github.enabled) && <motion.div variants={item} className="my-5 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" /><span className="text-xs font-medium uppercase tracking-widest text-neutral-400">{copy.orEmail}</span><span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" /></motion.div>}
            {methods.email.enabled && <motion.form variants={item} onSubmit={submit} className="space-y-4">
              {mode === "forgot" && <p className="text-sm text-neutral-600 dark:text-neutral-400">{copy.forgotHint}</p>}
              {mode === "sign-up" && <label className="block text-sm font-medium">{copy.name}<input name="name" value={name} onChange={event => setName(event.target.value)} required autoComplete="name" className={inputClasses} /></label>}
              <label className="block text-sm font-medium">{copy.emailLabel}<input name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" className={inputClasses} /></label>
              {mode !== "forgot" && <div><div className="flex items-baseline justify-between gap-3"><label htmlFor="auth4-password" className="text-sm font-medium">{copy.password}</label>{mode === "sign-in" && canReset && <button type="button" className="border-0 bg-transparent p-0 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white" onClick={() => switchMode("forgot")}>{copy.forgotPassword}</button>}</div><div className="relative"><input id="auth4-password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} className={`${inputClasses} pr-11`} /><button type="button" aria-label={showPassword ? copy.hidePassword : copy.showPassword} onClick={() => setShowPassword(current => !current)} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent text-neutral-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>}
              {mode === "sign-up" && needsVerification && <p className="text-xs text-neutral-500">{copy.verifyHint}</p>}
              {mode === "sign-up" && inviteRequired && <label className="block text-sm font-medium">{copy.invite}<input name="inviteCode" value={inviteCode} onChange={event => setInviteCode(event.target.value)} required maxLength={32} className={inputClasses} /></label>}
              <motion.button type="submit" disabled={pending} whileHover="hover" className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">{pending ? copy.wait : mode === "forgot" ? copy.forgotPassword : mode === "sign-up" ? copy.signUp : copy.signIn}<motion.span variants={{ hover: { x: reduce ? 0 : 3 } }} transition={{ duration: 0.2, ease: EASE }}><ArrowRight className="h-4 w-4" aria-hidden="true" /></motion.span></motion.button>
            </motion.form>}
            {mode === "sign-in" && methods.email.enabled && <motion.p variants={item} className="mt-6 text-sm text-neutral-600 dark:text-neutral-400"><button type="button" className={linkClasses} onClick={() => switchMode("sign-up")}>{copy.signUp}</button></motion.p>}
            {(mode === "sign-up" || mode === "forgot") && <button type="button" className={`mt-5 text-sm ${linkClasses}`} onClick={() => switchMode("sign-in")}>{copy.signIn}</button>}
          </>}
          {notice && mode === "forgot" && <p role="status" className="mt-4 text-sm">{notice}</p>}
          {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}
        </div>
        <motion.p variants={item} className="flex items-center gap-1.5 text-xs text-neutral-500"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{copy.assurance}</motion.p>
      </motion.div>
      <motion.aside initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.15, ease: EASE }} className="relative hidden min-h-[580px] flex-col overflow-hidden border-l border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/50 min-[850px]:flex">
        <div className="relative flex flex-1 items-center justify-center overflow-hidden"><div className="relative h-[520px] w-[520px] shrink-0">{rings.map(size => <div key={size} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200 dark:border-neutral-800 ${size}`} />)}<div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2"><motion.div animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="h-full w-full rounded-full border border-dashed border-neutral-300 dark:border-neutral-700" /></div><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-lg dark:bg-white dark:text-neutral-900">{logo ? <img src={logo.src} alt="" className="h-8 w-8 object-contain" /> : <ShieldCheck className="h-6 w-6" aria-hidden="true" />}</span></div></div></div>
        <div className="px-8 py-8 text-center text-lg font-medium text-neutral-900 dark:text-neutral-100">{brand}<p className="mt-3 text-sm font-normal text-neutral-500">{copy.brandDescription}</p></div>
      </motion.aside>
    </div>
  );
}

export default Auth4;
