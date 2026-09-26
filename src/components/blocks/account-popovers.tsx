'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createAuthClient } from 'better-auth/react';
import { Check, ChevronDown, CircleHelp, Coins, Copy, FileText, Gift, LayoutDashboard, LogOut, Mail, MessageCircle, Plus, Settings, Share2, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { messages } from '@/lib/config';
import './account-popovers.css';

const authClient = createAuthClient({ basePath: '/api/auth' });
type Copy = (typeof messages)['en']['account'];
type Plan = { id: string; billing: 'once' | 'year'; credits: number; amount: string; currency: string };
type Settings = { checkIn: { enabled: boolean; credits: number }; share: { enabled: boolean; credits: number; maxSubmissions: number }; referral: { enabled: boolean; inviterCredits: number; friendCredits: number }; contactEmail: string; feedbackEmail: string; commercialUseHref: string; icons: { checkin: string; share: string; invite: string; contact: string; feedback: string } };
type Activity = { balance: number; referralCode: string; checkInDays: string[]; submissions: { id: string; url: string; status: string; created_at: number }[]; referralCount: number; purchases: { source_id: string; granted: number; created_at: number }[] };
type Dialog = 'checkin' | 'share' | 'invite' | 'contact' | 'feedback' | 'plans' | 'invoices' | null;
type Menu = 'account' | 'credits' | null;
const icons = { sparkles: Sparkles, share: Share2, gift: Gift, mail: Mail, message: MessageCircle };
function FeatureIcon({ name }: { name: string }) { const Icon = icons[name as keyof typeof icons] ?? Sparkles; return <Icon aria-hidden="true" />; }

function PopupDialog({ title, closeLabel, onClose, children, wide = false }: { title: string; closeLabel: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = [...(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),summary') ?? [])];
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0]?.focus(); }
    }
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; previous?.focus(); };
  }, [onClose]);
  return <div className="account-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className={`account-dialog${wide ? ' wide' : ''}`} ref={ref} role="dialog" aria-modal="true" aria-labelledby="account-dialog-title"><button type="button" className="account-close" aria-label={closeLabel} onClick={onClose}><X size={20} /></button><h2 id="account-dialog-title">{title}</h2>{children}</div></div>;
}

export function AccountPopovers({ user, balance, locale, copy, labels, settings, palette, plans, siteUrl, brand }: { user: { name: string; email: string; image?: string | null }; balance: number; locale: string; copy: Copy; labels: { credits: string; logout: string; signOutFailed: string }; settings: Settings; palette: { accent: string; accentEnd: string; accentText: string }; plans: Plan[]; siteUrl: string; brand: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menu, setMenu] = useState<Menu>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [planBilling, setPlanBilling] = useState<'once' | 'year'>('once');
  const area = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const creditTrigger = useRef<HTMLButtonElement>(null);
  const referralRequest = useRef<string | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/account/activity', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setActivity(await response.json());
    } catch { setError(copy.loadFailed); }
  }, [copy.loadFailed]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const code = searchParams.get('ref') ?? sessionStorage.getItem('account-referral-code');
    if (!code || !/^[a-f0-9]{32}$/.test(code)) return;
    const key = `referral:${code}`;
    if (sessionStorage.getItem(key) || referralRequest.current === code) return;
    referralRequest.current = code;
    void fetch('/api/account/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'referral', code }) }).then(async response => {
      if (response.ok) { setActivity(await response.json()); setNotice(copy.referralNotice); router.refresh(); }
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 401)) {
        sessionStorage.setItem(key, '1');
        sessionStorage.removeItem('account-referral-code');
        const url = new URL(location.href); url.searchParams.delete('ref'); history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    }).catch(() => { /* Keep the referral code for the next visit if the network is unavailable. */ }).finally(() => { referralRequest.current = null; });
  }, [searchParams, copy.referralNotice, router]);
  useEffect(() => {
    if (!menu) return;
    const outside = (event: MouseEvent) => { if (!area.current?.contains(event.target as Node)) setMenu(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { (menu === 'account' ? trigger : creditTrigger).current?.focus(); setMenu(null); } };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [menu]);
  const show = (target: Dialog) => { setMenu(null); setError(''); setNotice(''); setDialog(target); void refresh(); };
  const currentBalance = activity?.balance ?? balance;
  const today = new Date().toISOString().slice(0, 10);
  const link = `${siteUrl}/${locale}?ref=${activity?.referralCode ?? ''}`;
  const shareText = `${brand} ${siteUrl}`;
  const shareTargets = (url: string) => [
    { name: 'Reddit', href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(brand)}` },
    { name: 'X', href: `https://x.com/intent/post?text=${encodeURIComponent(brand)}&url=${encodeURIComponent(url)}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${brand} ${url}`)}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(brand)}` },
  ];
  async function copyText(text: string) {
    try { await navigator.clipboard.writeText(text); setNotice(copy.copied); } catch { setError(copy.copyFailed); }
  }
  async function action(kind: 'checkin' | 'share') {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/account/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: kind, ...(kind === 'share' ? { url: postUrl } : {}) }) });
      if (!response.ok) throw new Error(copy.actionFailed);
      setActivity(await response.json());
      setNotice(kind === 'checkin' ? copy.claimedNotice : copy.sent);
      if (kind === 'share') setPostUrl('');
      router.refresh();
    } catch (cause) { setError(cause instanceof Error && cause.message ? cause.message : copy.actionFailed); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError('');
    try { const result = await authClient.signOut(); if (result.error) throw new Error(); setMenu(null); setActivity(null); router.refresh(); }
    catch { setError(labels.signOutFailed); } finally { setBusy(false); }
  }
  const reward = (target: Exclude<Dialog, null>, icon: string, text: string, tag: string, color: string, asMenu = false) => <button type="button" role={asMenu ? 'menuitem' : undefined} className={`account-reward ${color}`} onClick={() => show(target)}><FeatureIcon name={icon} /><span>{text}</span>{tag && <b>{tag}</b>}</button>;
  const rewards = (asMenu = false) => <>{settings.checkIn.enabled && reward('checkin', settings.icons.checkin, copy.daily, copy.free, 'violet', asMenu)}{settings.share.enabled && reward('share', settings.icons.share, copy.share, `+${settings.share.credits}`, 'pink', asMenu)}{settings.referral.enabled && reward('invite', settings.icons.invite, copy.invite, `+${settings.referral.inviterCredits}`, 'blue', asMenu)}</>;
  const accountStyle = { '--account-accent': palette.accent, '--account-accent-end': palette.accentEnd, '--account-accent-text': palette.accentText } as CSSProperties;
  return <><div className="account-controls" ref={area} style={accountStyle}>
    <div className="account-anchor"><button ref={creditTrigger} className="replica-credits-pill" type="button" aria-label={`${currentBalance} ${labels.credits}`} aria-haspopup="dialog" aria-expanded={menu === 'credits'} onClick={() => setMenu(menu === 'credits' ? null : 'credits')}><Coins size={17}/>{currentBalance}</button>
      {menu === 'credits' && <div className="account-popover account-credits" role="dialog" aria-label={labels.credits}><div className="account-balance"><strong><Coins size={23}/>{currentBalance}</strong><span>{labels.credits}</span></div><div className="account-rewards"><button type="button" className="account-buy" onClick={() => show('plans')}><Plus size={19}/>{copy.buy}</button>{rewards()}{reward('feedback', settings.icons.feedback, copy.feedback, '', 'cyan')}</div></div>}</div>
    <div className="account-anchor"><button ref={trigger} className="replica-avatar" type="button" aria-label={copy.menu} aria-haspopup="menu" aria-expanded={menu === 'account'} onClick={() => setMenu(menu === 'account' ? null : 'account')}>{user.image ? <img src={user.image} alt="" width={34} height={34} /> : user.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</button>
      {menu === 'account' && <div className="account-popover account-menu" role="menu" aria-label={copy.menu}><div className="account-profile"><span className="replica-avatar replica-avatar-large" aria-hidden="true">{user.image ? <img src={user.image} alt="" /> : user.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div><div className="account-rewards">{rewards(true)}</div><div className="account-list"><Link role="menuitem" href={`/${locale}${settings.commercialUseHref}`} onClick={() => setMenu(null)}><span className="account-icon violet"><ShieldCheck/></span>{copy.license}</Link><button role="menuitem" type="button" onClick={() => show('contact')}><span className="account-icon cyan"><FeatureIcon name={settings.icons.contact}/></span>{copy.contact}</button></div><div className="account-list"><Link role="menuitem" href={`/${locale}/dashboard`} onClick={() => setMenu(null)}><span className="account-icon"><Settings/></span>{copy.account}</Link><button role="menuitem" type="button" onClick={() => show('invoices')}><span className="account-icon"><FileText/></span>{copy.invoices}</button><Link role="menuitem" href={`/${locale}/credits`} onClick={() => setMenu(null)}><span className="account-icon blue"><Coins/></span>{copy.center}</Link></div><div className="account-list"><button role="menuitem" type="button" className="account-signout" disabled={busy} onClick={() => void signOut()}><span className="account-icon red"><LogOut/></span>{labels.logout}</button></div></div>}</div>
  </div>
  {!dialog && (error || notice) && <p className="account-toast" role={error ? 'alert' : 'status'}>{error || notice}<button aria-label={copy.close} onClick={() => { setError(''); setNotice(''); }}><X size={15}/></button></p>}
  {dialog && <div style={accountStyle}><PopupDialog title={{ checkin: copy.checkinTitle, share: copy.shareTitle, invite: copy.inviteTitle, contact: copy.contactTitle, feedback: copy.feedbackTitle, plans: copy.plansTitle, invoices: copy.invoiceTitle }[dialog]} closeLabel={copy.close} onClose={closeDialog} wide={dialog === 'invite' || dialog === 'plans'}>
    {dialog === 'checkin' && <><div className="account-hero"><p>{copy.checkinLead}</p></div><div className="account-body"><div className="account-heading"><b>{copy.daily}</b><span>{activity?.checkInDays.length ?? 0}/7 {copy.days}</span></div><div className="account-days">{Array.from({ length: 7 }, (_, index) => { const day = new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10); const done = activity?.checkInDays.includes(day); return <div key={day} className={done ? 'complete' : ''}><small>{copy.day} {index + 1}</small>{done ? <Check/> : <strong>+{settings.checkIn.credits}</strong>}</div>; })}</div><button className="account-primary" disabled={busy || !activity || activity.checkInDays.includes(today)} onClick={() => void action('checkin')}>{activity?.checkInDays.includes(today) ? copy.claimed : busy ? copy.loading : copy.claim}</button><p className="account-hint">{copy.checkinHint}</p>{settings.referral.enabled && <div className="account-panel"><h3>{copy.inviteNext}</h3><p>{copy.inviteLead}</p><button className="account-secondary" onClick={() => show('invite')}><Gift size={16}/>{copy.inviteNext}</button></div>}</div></>}
    {dialog === 'share' && <><div className="account-hero"><p>{copy.shareLead}</p></div><div className="account-body"><div className="account-panel"><h3>{copy.share}</h3><button className="account-secondary" onClick={() => void copyText(shareText)}><Copy size={15}/>{copy.quickCopy}</button><div className="account-sharelinks">{shareTargets(siteUrl).slice(0, 4).map(item => <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer">{item.name}</a>)}</div><details><summary>{copy.shareWhere}<ChevronDown size={15}/></summary><p>{copy.shareWhereDetail}</p></details></div><form className="account-panel" onSubmit={event => { event.preventDefault(); void action('share'); }}><h3>{copy.submitPost}</h3><div className="account-submit"><input type="url" required value={postUrl} onChange={event => setPostUrl(event.target.value)} placeholder={copy.postPlaceholder} aria-label={copy.submitPost} /><button type="submit" disabled={busy || !activity || activity.submissions.length >= settings.share.maxSubmissions}>{activity && activity.submissions.length >= settings.share.maxSubmissions ? copy.shareLimit : busy ? copy.loading : copy.submit}</button></div></form>{!!activity?.submissions.length && <div className="account-panel"><h3>{copy.submissions}</h3>{activity.submissions.map(item => <p className="account-entry" key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a><span>{copy[item.status as 'pending' | 'approved' | 'rejected'] ?? item.status}</span></p>)}</div>}</div></>}
    {dialog === 'invite' && <><div className="account-hero"><p>{copy.inviteLead}</p></div><div className="account-body account-invite-grid"><div className="account-panel"><h3>{copy.referralLink}</h3><div className="account-referral"><span>{activity ? link : copy.loading}</span><button disabled={!activity} onClick={() => void copyText(link)}><Copy size={15}/>{copy.copyLink}</button></div><small>{copy.shareVia}</small><div className="account-sharelinks">{activity && shareTargets(link).slice(1).map(item => <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer">{item.name}</a>)}</div><h3>{copy.history}</h3><p>{activity?.referralCount ? `${activity.referralCount} ${copy.referred}` : copy.noReferrals}</p></div><div className="account-panel"><h3>{copy.yourRewards}</h3><div className="account-stats"><span>{copy.youGet}<b>+{settings.referral.inviterCredits}</b></span><span>{copy.friendGets}<b>+{settings.referral.friendCredits}</b></span></div><p>{copy.referred}: {activity?.referralCount ?? 0}</p><p>{copy.referralRules}</p></div></div></>}
    {dialog === 'contact' || dialog === 'feedback' ? <div className="account-body account-contact">{dialog === 'contact' ? <CircleHelp size={28}/> : <MessageCircle size={28}/>}<p>{dialog === 'contact' ? copy.contactLead : copy.feedbackLead}</p><a href={`mailto:${dialog === 'contact' ? settings.contactEmail : settings.feedbackEmail}`}>{dialog === 'contact' ? settings.contactEmail : settings.feedbackEmail}</a></div> : null}
    {dialog === 'plans' && <div className="account-body"><div className="account-tabs">{(['once','year'] as const).map(period => <button key={period} className={planBilling === period ? 'selected' : ''} onClick={() => setPlanBilling(period)}>{copy[period]}</button>)}</div><div className="account-plans">{plans.filter(plan => plan.billing === planBilling).map(plan => <Link key={plan.id} href={`/${locale}/pricing`}><h3>{plan.id}</h3><strong>{plan.currency} {plan.amount}</strong><span>{plan.credits} {labels.credits}</span></Link>)}</div><p>{copy.planHint}</p><Link className="account-primary" href={`/${locale}/pricing`}>{copy.viewPlans}</Link></div>}
    {dialog === 'invoices' && <div className="account-body"><p>{copy.invoiceLead}</p>{activity?.purchases.length ? activity.purchases.map(item => <div className="account-entry" key={item.source_id}><span><b>{item.source_id}</b><small>{new Date(item.created_at).toLocaleDateString(locale)}</small></span><strong>+{item.granted} {labels.credits}</strong></div>) : <div className="account-panel">{copy.noInvoices}</div>}<a className="account-secondary" href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(copy.requestInvoice)}`}><Mail size={16}/>{copy.requestInvoice}</a></div>}
    {(error || notice) && <p className={error ? 'account-error' : 'account-message'} role={error ? 'alert' : 'status'}>{error || notice}</p>}
  </PopupDialog></div>}
  </>;
}
