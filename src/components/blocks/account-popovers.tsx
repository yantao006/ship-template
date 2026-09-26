'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { requestJson } from '@/lib/json-request';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import { Coins, FileText, Gift, LogOut, Mail, MessageCircle, Plus, Settings as SettingsIcon, Share2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { routePath, sitePath } from '@/lib/route-paths';
import { AccountPopoverCard, type PopoverRow } from './account-popover-card';
import { AvatarTrigger, ProfileHeader } from './account-profile';
import { AccountDialogs, type AccountCopy, type Activity, type Dialog, type Plan, type Settings } from './account-dialogs';
import './account-popovers.css';

type Menu = 'account' | 'credits' | null;
const icons = { sparkles: Sparkles, share: Share2, gift: Gift, mail: Mail, message: MessageCircle };
function FeatureIcon({ name }: { name: string }) { const Icon = icons[name as keyof typeof icons] ?? Sparkles; return <Icon aria-hidden="true" />; }

export function AccountPopovers({ user, balance, locale, dateLocale, copy, labels, settings, palette, plans, siteUrl, brand }: { user: { name: string; email: string; image?: string | null }; balance: number; locale: string; dateLocale: string; copy: AccountCopy; labels: { credits: string; logout: string; signOutFailed: string }; settings: Settings; palette: { accent: string; accentEnd: string; accentText: string }; plans: Plan[]; siteUrl: string; brand: string }) {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const area = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const creditTrigger = useRef<HTMLButtonElement>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/account/activity', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setActivity(await response.json());
      setError('');
    } catch { setError(copy.loadFailed); }
  }, [copy.loadFailed]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const claimed = (event: Event) => { setActivity((event as CustomEvent<Activity>).detail); setNotice(copy.referralNotice); };
    window.addEventListener('account-referral-claimed', claimed);
    return () => window.removeEventListener('account-referral-claimed', claimed);
  }, [copy.referralNotice]);
  useDismissableLayer({ active: !!menu && !dialog, area, trigger: menu === 'account' ? trigger : creditTrigger, onClose: () => setMenu(null) });
  const show = (target: Dialog) => { setMenu(null); setError(''); setNotice(''); setDialog(target); void refresh(); };
  const currentBalance = activity?.balance ?? balance;
  async function copyText(text: string) {
    try { await navigator.clipboard.writeText(text); setNotice(copy.copied); } catch { setError(copy.copyFailed); }
  }
  async function action(kind: 'checkin' | 'share', postUrl = ''): Promise<boolean> {
    if (busy) return false;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await requestJson('/api/account/activity', { action: kind, ...(kind === 'share' ? { url: postUrl } : {}) });
      if (!response.ok) throw new Error(copy.actionFailed);
      setActivity(await response.json());
      setNotice(kind === 'checkin' ? copy.claimedNotice : copy.sent);
      router.refresh();
      return true;
    } catch (cause) { setError(cause instanceof Error && cause.message ? cause.message : copy.actionFailed); return false; }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError('');
    try { const result = await authClient.signOut(); if (result.error) throw new Error(); setMenu(null); setActivity(null); router.refresh(); }
    catch { setError(labels.signOutFailed); } finally { setBusy(false); }
  }
  const rewardRows = (): PopoverRow[] => [
    ...(settings.checkIn.enabled ? [{ id: 'checkin', icon: <FeatureIcon name={settings.icons.checkin}/>, label: copy.daily, tone: 'account' as const, badge: { label: copy.free, boxed: true }, onClick: () => show('checkin') }] : []),
    ...(settings.share.enabled ? [{ id: 'share', icon: <FeatureIcon name={settings.icons.share}/>, label: copy.share, tone: 'pink' as const, badge: { label: `+${settings.share.credits}`, boxed: true }, onClick: () => show('share') }] : []),
    ...(settings.referral.enabled ? [{ id: 'invite', icon: <FeatureIcon name={settings.icons.invite}/>, label: copy.invite, tone: 'info' as const, badge: { label: `+${settings.referral.inviterCredits}`, boxed: true }, onClick: () => show('invite') }] : []),
  ];
  const creditRows: PopoverRow[] = [
    ...rewardRows(),
    { id: 'feedback', icon: <FeatureIcon name={settings.icons.feedback}/>, label: copy.feedback, onClick: () => show('feedback') },
  ];
  const accountRows: PopoverRow[] = [
    ...rewardRows().map((row, index, rows) => ({ ...row, dividerBelow: index === rows.length - 1 })),
    { id: 'license', icon: <ShieldCheck/>, label: copy.license, href: sitePath(locale, settings.commercialUseHref), onClick: () => setMenu(null) },
    { id: 'contact', icon: <FeatureIcon name={settings.icons.contact}/>, label: copy.contact, onClick: () => show('contact'), dividerBelow: true },
    { id: 'account', icon: <SettingsIcon/>, label: copy.account, href: routePath(locale, 'dashboard'), onClick: () => setMenu(null) },
    { id: 'invoices', icon: <FileText/>, label: copy.invoices, onClick: () => show('invoices') },
    { id: 'center', icon: <Coins/>, label: copy.center, href: routePath(locale, 'credits'), onClick: () => setMenu(null), dividerBelow: true },
    { id: 'signout', icon: <LogOut/>, label: labels.logout, tone: 'danger', disabled: busy, onClick: () => void signOut() },
  ];
  const accountStyle = { '--account-accent': palette.accent, '--account-accent-end': palette.accentEnd, '--account-accent-text': palette.accentText } as CSSProperties;
  return <><div className="account-controls" ref={area} style={accountStyle}>
    <div className="account-anchor"><button ref={creditTrigger} className="replica-credits-pill" type="button" aria-label={`${currentBalance} ${labels.credits}`} aria-haspopup="dialog" aria-expanded={menu === 'credits'} onClick={() => setMenu(menu === 'credits' ? null : 'credits')}><Coins size={17}/>{currentBalance}</button>
      {menu === 'credits' && <AccountPopoverCard role="dialog" label={labels.credits} className="account-credits" header={<div className="account-credit-header"><div className="account-balance"><strong><Coins size={23}/>{currentBalance}</strong><span>{labels.credits}</span></div><button type="button" className="account-buy" onClick={() => show('plans')}><Plus size={19}/>{copy.buy}</button></div>} rows={creditRows} />}</div>
    <div className="account-anchor"><AvatarTrigger buttonRef={trigger} name={user.name} image={user.image} label={copy.menu} open={menu === 'account'} onClick={() => setMenu(menu === 'account' ? null : 'account')} />
      {menu === 'account' && <AccountPopoverCard role="menu" label={copy.menu} className="account-menu" header={<ProfileHeader name={user.name} email={user.email} image={user.image} />} rows={accountRows} />}</div>
  </div>
  {!dialog && (error || notice) && <p className="account-toast" role={error ? 'alert' : 'status'}>{error || notice}<button aria-label={copy.close} onClick={() => { setError(''); setNotice(''); }}><X size={15}/></button></p>}
  {dialog && <div style={accountStyle}><AccountDialogs key={dialog} dialog={dialog} onClose={closeDialog} copy={copy} labels={labels} settings={settings} plans={plans} activity={activity} busy={busy} error={error} notice={notice} locale={locale} dateLocale={dateLocale} siteUrl={siteUrl} brand={brand} icons={{ checkin: <FeatureIcon name={settings.icons.checkin}/>, share: <FeatureIcon name={settings.icons.share}/>, invite: <FeatureIcon name={settings.icons.invite}/> }} onCopyText={text => void copyText(text)} onAction={action} /></div>}
  </>;
}
