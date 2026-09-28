'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FaFacebookF, FaLinkedinIn, FaRedditAlien, FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { Check, ChevronDown, CircleHelp, Copy, Crown, ExternalLink, Gift, Link2, Mail, Medal, MoreHorizontal, RefreshCw, Send, Share2, ShieldCheck, Trophy, Users, X } from 'lucide-react';
import { routePath } from '@/lib/route-paths';
import { checkinInviteShare } from '@/lib/checkin-invite';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import type en from '@site/messages/en';
import { CHECKIN_STREAK_DAYS, dailyRewardState } from './account-popover-state';
import { PricingConfetti } from '../pricing/pricing-confetti';
import { BuyCreditsContent, type PricingCopy } from './buy-credits-dialog';

export type AccountCopy = (typeof en)['account'];
export type Plan = { id: string; tier?: string; billing: 'once' | 'month' | 'year'; credits: number; amount: string; currency: string; name: string; checkoutEnabled: boolean };
export type Network = import('@/lib/site-config-types').ShareNetworkName;
export type Settings = import('@/lib/config').SiteConfig['account'];
export type Activity = { balance: number; referralCode: string; checkInDays: string[]; submissions: { id: string; url: string; status: string; created_at: number }[]; referralCount: number; purchases: { source_id: string; granted: number; created_at: number }[]; leaderboard: { name: string; total: number }[]; referralHistory: { name: string; created_at: number }[] };
export type Dialog = 'checkin' | 'share' | 'invite' | 'contact' | 'feedback' | 'plans' | 'invoices' | null;

const socialIcons = { Facebook: FaFacebookF, X: FaXTwitter, WhatsApp: FaWhatsapp, LinkedIn: FaLinkedinIn, Telegram: FaTelegram, Reddit: FaRedditAlien } satisfies Record<Network, typeof FaFacebookF>;
function SocialIcon({ name }: { name: Network }) { const Icon = socialIcons[name]; return <Icon aria-hidden="true" className={`account-social-mark ${name.toLowerCase()}`} />; }

export function shareRecommendationText(siteUrl: string, dailyCreditsEnabled: boolean, copy: Pick<AccountCopy, 'shareRecommendation' | 'shareRecommendationNoDaily'>) {
  return `${dailyCreditsEnabled ? copy.shareRecommendation : copy.shareRecommendationNoDaily}\n${siteUrl}`;
}

function PopupDialog({ title, closeLabel, onClose, children, wide = false, variant }: { title: string; closeLabel: string; onClose: () => void; children: ReactNode; wide?: boolean; variant: NonNullable<Dialog> }) {
  const ref = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  useDismissableLayer({ active: true, area: ref, backdrop: overlay, onClose, trapFocus: true });
  useEffect(() => { const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow; }; }, []);
  return <div className={`account-overlay account-${variant}-overlay`} ref={overlay}><div className={`account-dialog${wide ? ' wide' : ''} account-${variant}-dialog`} ref={ref} role="dialog" aria-modal="true" aria-labelledby="account-dialog-title"><button type="button" className="account-close" aria-label={closeLabel} onClick={onClose}><X size={20} /></button><h2 id="account-dialog-title">{title}</h2>{children}</div>{variant === 'plans' && <PricingConfetti />}</div>;
}

function DialogHero({ icon, kicker, title, lead, invite = false }: { icon: ReactNode; kicker: ReactNode; title: string; lead: ReactNode; invite?: boolean }) {
  return <div className={`account-hero account-checkin-hero${invite ? ' account-invite-hero' : ''}`}><span className="account-hero-icon">{icon}</span><div><span className="account-kicker">{kicker}</span><h2>{title}</h2><p>{lead}</p></div></div>;
}

export function AccountDialogs({ dialog, onClose, copy, labels, settings, plans, pricing, activity, busy, error, notice, locale, dateLocale, siteUrl, brand, viewerEmail, icons, onCopyText, onAction, onRefresh }: {
  dialog: NonNullable<Dialog>; onClose: () => void; copy: AccountCopy; labels: { credits: string }; settings: Settings; plans: Plan[]; pricing: PricingCopy;
  activity: Activity | null; busy: boolean; error: string; notice: string; locale: string; dateLocale: string; siteUrl: string; brand: string; viewerEmail: string;
  icons: { checkin: ReactNode; share: ReactNode; invite: ReactNode };
  onCopyText: (text: string) => void; onAction: (kind: 'checkin' | 'share', postUrl?: string) => Promise<boolean>; onRefresh: () => void;
}) {
  const [postUrl, setPostUrl] = useState('');
  const shareDetailsRef = useRef<HTMLDetailsElement>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { claimedToday, completed: streakDays, nextClaimAt } = dailyRewardState(activity?.checkInDays ?? [], new Date());
  const nextClaim = nextClaimAt.toLocaleString(dateLocale);
  const link = checkinInviteShare(siteUrl, activity?.referralCode ?? '', copy.checkinInviteMessage).link;
  const [inviteBeforeCredit, inviteAfterCredit] = copy.inviteLead.replaceAll('{brand}', brand).split('{creditLabel}');
  const checkinShare = checkinInviteShare(siteUrl, activity?.referralCode ?? '', copy.checkinInviteMessage);
  const shareText = shareRecommendationText(siteUrl, settings.checkIn.enabled, copy);
  const shareTargets = (url: string) => [
    { name: 'Reddit', href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(brand)}` },
    { name: 'X', href: `https://x.com/intent/post?text=${encodeURIComponent(brand)}&url=${encodeURIComponent(url)}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${brand} ${url}`)}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(brand)}` },
  ];
  const networks = (url: string, names: readonly Network[]) => names.map(name => shareTargets(url).find(item => item.name === name)!);
  const leaderboardDemo = !!activity && activity.leaderboard.length === 0 && !!settings.leaderboardDemo?.entries.length && settings.leaderboardDemo.viewerEmail.toLowerCase() === viewerEmail.toLowerCase();
  const leaderboard = activity?.leaderboard.length ? activity.leaderboard : leaderboardDemo ? settings.leaderboardDemo?.entries ?? [] : [];
  return <><PopupDialog title={{ checkin: copy.checkinTitle, share: copy.shareTitle, invite: copy.inviteTitle, contact: copy.contactTitle, feedback: copy.feedbackTitle, plans: copy.plansTitle, invoices: copy.invoiceTitle }[dialog]} closeLabel={copy.close} onClose={onClose} wide={dialog === 'invite' || dialog === 'plans' || dialog === 'checkin' || dialog === 'share'} variant={dialog}>
    {dialog === 'checkin' && <><DialogHero icon={icons.checkin} kicker={copy.checkinKicker} title={copy.daily} lead={copy.checkinLead.replace('{credits}', String(settings.checkIn.credits))} /><div className="account-body account-checkin-body"><div><div className="account-heading"><b>{copy.checkinRewards.replace('{days}', String(CHECKIN_STREAK_DAYS))}</b><span>{streakDays}/{CHECKIN_STREAK_DAYS} {copy.days}</span></div><div className="account-days">{Array.from({ length: CHECKIN_STREAK_DAYS }, (_, index) => { const done = index < streakDays; const current = !claimedToday && index === streakDays; return <div key={index} className={done ? 'complete' : current ? 'current' : 'future'}><small>{copy.day} {index + 1}</small>{done ? <Check aria-label={copy.claimed}/> : <strong>+{settings.checkIn.credits}</strong>}</div>; })}</div></div><button className="account-primary" disabled={busy || !activity || claimedToday} onClick={() => onAction('checkin')}>{claimedToday && <Check size={20}/>}{claimedToday ? copy.claimed : busy ? copy.loading : copy.claim}</button>{claimedToday ? <p className="account-next-claim">{copy.nextClaim} {nextClaim}</p> : <p className="account-next-claim">{copy.checkinHint}</p>}{settings.referral.enabled && <section className="account-daily-share"><div className="account-daily-share-intro"><div><span className="account-kicker"><Share2 size={15}/>{copy.inviteShareKicker}</span><h3>{copy.inviteNext}</h3><p>{copy.inviteShareLead}</p></div><button className="account-secondary" disabled={!activity} onClick={() => onCopyText(checkinShare.text)}><Copy size={16}/>{copy.copyInvite}</button></div><div className="account-social-grid">{settings.shareNetworks.map(name => <a key={name} href={activity ? checkinShare.targets[name] : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!activity} onClick={event => { if (!activity) event.preventDefault(); }}><SocialIcon name={name}/>{name}</a>)}</div></section>}<button type="button" className="account-details-toggle" aria-expanded={detailsOpen} onClick={() => setDetailsOpen(open => !open)}><CircleHelp size={14}/>{copy.activityDetails}</button>{detailsOpen && <p className="account-details-content">{copy.activityDetailText} <Link href={routePath(locale, 'credits')} onClick={onClose}>{copy.center}</Link></p>}</div></>}
    {dialog === 'share' && <><DialogHero icon={icons.share} kicker={`+${settings.share.credits}`} title={copy.shareHeroTitle.replace('{credits}', String(settings.share.credits))} lead={copy.shareLead.replace('{credits}', String(settings.share.credits)).replace('{limit}', String(settings.share.maxSubmissions))} /><div className="account-body account-share-body"><div className="account-panel"><h3><span className="account-share-step-icon"><Copy size={18}/></span>{copy.publishStep}</h3><p>{copy.publishLead}</p><p><b>{copy.publishAdvice}</b></p><button type="button" className="account-primary" onClick={() => onCopyText(shareText)}><Copy size={19}/>{copy.quickCopy}</button><div className="account-sharelinks">{networks(siteUrl, settings.sharePostNetworks).map(item => <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.name}><SocialIcon name={item.name as Network}/></a>)}<button type="button" aria-label={copy.otherCommunities} title={copy.otherCommunities} onClick={() => { if (shareDetailsRef.current) shareDetailsRef.current.open = true; }}><MoreHorizontal size={21}/></button></div><details ref={shareDetailsRef}><summary>{copy.shareWhere}<ChevronDown size={15}/></summary><div className="account-share-guide"><div className="account-share-community-links">{settings.sharePostNetworks.map(name => <a key={name} href={{ Reddit: 'https://www.reddit.com/', X: 'https://x.com/', Facebook: 'https://www.facebook.com/', LinkedIn: 'https://www.linkedin.com/', WhatsApp: 'https://www.whatsapp.com/', Telegram: 'https://telegram.org/' }[name]} target="_blank" rel="noopener noreferrer">{name}<ExternalLink size={13}/></a>)}</div><ul>{copy.shareGuidelines.map(line => <li key={line}>{line}</li>)}</ul></div></details></div><form className="account-panel" onSubmit={event => { event.preventDefault(); void onAction('share', postUrl).then(success => { if (success) setPostUrl(''); }); }}><h3><span className="account-share-step-icon"><Send size={18}/></span>{copy.submitStep}</h3><p>{copy.submitLead.replace('{credits}', String(settings.share.credits))}</p><div className="account-submit"><label className="account-submit-url"><ExternalLink size={17}/><input type="url" required value={postUrl} onChange={event => setPostUrl(event.target.value)} placeholder={copy.postPlaceholder} aria-label={copy.submitPost} /></label><button type="submit" disabled={busy || !activity || !postUrl.trim() || activity.submissions.length >= settings.share.maxSubmissions}><Send size={19}/>{activity && activity.submissions.length >= settings.share.maxSubmissions ? copy.shareLimit : busy ? copy.loading : copy.submit}</button></div></form>{!!activity?.submissions.length && <div className="account-panel account-share-history"><h3>{copy.submissions}</h3>{activity.submissions.map(item => <p className="account-entry" key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a><span>{copy[item.status as 'pending' | 'approved' | 'rejected'] ?? item.status}</span></p>)}</div>}</div></>}
    {dialog === 'invite' && <>
      <DialogHero icon={icons.invite} kicker={copy.inviteKicker.replace('{credits}', String(settings.referral.inviterCredits))} title={copy.inviteTitle} lead={<>{inviteBeforeCredit}<strong className="account-invite-credit-pill">{settings.referral.inviterCredits} {copy.inviteCreditUnit}</strong>{inviteAfterCredit}</>} invite />
      <div className="account-body account-invite-grid">
        <section className="account-panel account-invite-link">
          <div className="account-invite-link-heading"><span className="account-invite-link-icon"><Link2 size={20}/></span><div><h3>{copy.referralLink}</h3><p>{copy.inviteLinkLead.replace('{credits}', String(settings.referral.inviterCredits)).replace('{brand}', brand)}</p></div></div>
          <div className="account-referral"><span>{activity ? link : copy.loading}</span><button type="button" disabled={!activity} onClick={() => onCopyText(link)}><Copy size={15}/>{copy.copyLink}</button></div>
          <div className="account-invite-social"><small>{copy.shareVia}</small><div className="account-sharelinks">{activity && networks(link, settings.shareNetworks).map(item => <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.name}><SocialIcon name={item.name as Network}/></a>)}</div></div>
        </section>
        <section className="account-panel account-invite-rewards">
          <h3><Gift size={18}/>{copy.yourRewards}</h3>
          <p>{copy.inviteSummary.replace('{inviter}', String(settings.referral.inviterCredits)).replace('{friend}', String(settings.referral.friendCredits))}</p>
          <div className="account-stats"><span>{copy.youGet}<b>+{settings.referral.inviterCredits}</b></span><span>{copy.friendGets}<b>+{settings.referral.friendCredits}</b></span></div>
          <div className="account-invite-totals"><span>{copy.totalEarned}<b>{(activity?.referralCount ?? 0) * settings.referral.inviterCredits}</b></span><span>{copy.referred}<b>{activity?.referralCount ?? 0}</b></span></div>
          <div className="account-invite-rules"><strong><ShieldCheck size={14}/>{copy.rewardRules}</strong><ul>{copy.referralRules.map(rule => <li key={rule}>{rule.replace('{hours}', String(settings.referral.claimWindowHours))}</li>)}</ul></div>
        </section>
        <section className="account-panel account-invite-leaderboard">
          <div className="account-invite-title-row"><h3><Trophy size={20}/>{copy.leaderboard}</h3><span>{copy.leaderboardTop}</span></div>
          <p>{leaderboardDemo ? copy.leaderboardDemoLead : copy.leaderboardLead}</p>
          {leaderboard.length ? <ol className="account-leaderboard" data-demo={leaderboardDemo || undefined}>{leaderboard.map((item, index) => <li key={`${item.name}-${index}`}><span className="account-rank">{index === 0 ? <Crown size={17}/> : index + 1}</span><span className="account-rank-person"><b>{item.name}</b><small>{item.total} {copy.successfulInvites}</small></span><Medal size={16} className="account-rank-medal" aria-hidden="true"/></li>)}</ol> : <div className="account-invite-empty"><Users size={28}/><b>{copy.leaderboardEmptyTitle}</b><p>{copy.leaderboardEmptyLead}</p></div>}
        </section>
        <section className="account-panel account-referral-history">
          <div className="account-invite-title-row"><h3><Users size={20}/>{copy.history}</h3><button type="button" aria-label={copy.refreshHistory} title={copy.refreshHistory} onClick={onRefresh}><RefreshCw size={17}/></button></div>
          {activity?.referralHistory.length ? <ul className="account-referral-list">{activity.referralHistory.map((item, index) => <li key={`${item.created_at}-${index}`}><span>{item.name}</span><time dateTime={new Date(item.created_at).toISOString()}>{new Date(item.created_at).toLocaleDateString(dateLocale)}</time></li>)}</ul> : <div className="account-invite-empty"><span className="account-invite-empty-icon"><Users size={28}/></span><b>{copy.historyEmptyTitle}</b><p>{copy.historyEmptyLead}</p></div>}
        </section>
      </div>
    </>}
    {dialog === 'contact' && <div className="account-body account-contact"><Mail size={48} strokeWidth={2} aria-hidden="true"/><p>{copy.contactLead.replace('{brand}', brand)}</p><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></div>}
    {dialog === 'feedback' && <div className="account-body account-feedback-body"><p>{copy.feedbackLead.replace('{brand}', brand)}</p><a href={`mailto:${settings.feedbackEmail || settings.contactEmail}`}>{settings.feedbackEmail || settings.contactEmail}</a><p>{copy.feedbackReview.replace('{brand}', brand)}</p></div>}
    {dialog === 'plans' && <BuyCreditsContent plans={plans} copy={copy} pricing={pricing} brand={brand} locale={locale} />}
    {dialog === 'invoices' && <div className="account-body"><p>{copy.invoiceLead}</p>{activity?.purchases.length ? activity.purchases.map(item => <div className="account-entry" key={item.source_id}><span><b>{item.source_id}</b><small>{new Date(item.created_at).toLocaleDateString(dateLocale)}</small></span><strong>+{item.granted} {labels.credits}</strong></div>) : <div className="account-panel">{copy.noInvoices}</div>}<a className="account-secondary" href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(copy.requestInvoice)}`}><Mail size={16}/>{copy.requestInvoice}</a></div>}
    {(error || (dialog !== 'share' && dialog !== 'invite' && notice)) && <p className={error ? 'account-error' : 'account-message'} role={error ? 'alert' : 'status'}>{error || notice}</p>}
  </PopupDialog>{(dialog === 'share' || dialog === 'invite') && notice && !error && createPortal(<p className="account-share-toast" role="status">{dialog === 'share' && notice === copy.copied ? copy.shareCopied : notice}</p>, document.body)}</>;
}
