'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Trash2, X } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { routePath } from '@/lib/route-paths';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import type { CreditMovement } from '@/lib/account-page-history';

type Labels = { changeType: string; allRecords: string; earned: string; spent: string; noCredits: string; noFilteredCredits: string; expires: string; noExpiry: string; signOut: string; signOutFailed: string; creditsUnit: string; deleteAccount: string; deleteTitle: string; deleteWarning: string; deleteCancel: string; deleteConfirm: string; deleting: string; deleteFailed: string };

export function AccountActions({ labels, email, locale }: { labels: Pick<Labels, 'signOut' | 'signOutFailed' | 'deleteAccount' | 'deleteTitle' | 'deleteWarning' | 'deleteCancel' | 'deleteConfirm' | 'deleting' | 'deleteFailed'>; email: string; locale: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const deleteTrigger = useRef<HTMLButtonElement>(null);
  useDismissableLayer({ active: confirming, area: dialog, backdrop, trigger: deleteTrigger, trapFocus: true, onClose: () => { if (!busy) setConfirming(false); } });
  async function deleteAccount() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: email }) });
      if (!response.ok) throw new Error();
      try { await authClient.signOut(); } catch { /* The server already revoked this session. */ }
      window.location.replace(routePath(locale, 'home'));
    } catch { setError(labels.deleteFailed); setBusy(false); }
  }
  return <><div className="account-page-actions"><button type="button" className="ui-nav-item" disabled={busy} onClick={async () => {
    setBusy(true); setError('');
    try { const result = await authClient.signOut(); if (result.error) throw new Error(); router.refresh(); }
    catch { setError(labels.signOutFailed); setBusy(false); }
  }}><LogOut size={16} aria-hidden="true"/>{labels.signOut}</button><button ref={deleteTrigger} type="button" className="account-page-delete ui-nav-item" disabled={busy} onClick={() => { setError(''); setConfirming(true); }}><Trash2 size={16} aria-hidden="true"/>{labels.deleteAccount}</button></div>
    {error && !confirming && <p className="account-page-action-error" role="alert">{error}</p>}
    {confirming && <div className="account-delete-overlay" ref={backdrop}><div className="account-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="account-delete-title" aria-describedby="account-delete-warning" ref={dialog}>
      <button type="button" className="account-delete-close" aria-label={labels.deleteCancel} disabled={busy} onClick={() => setConfirming(false)}><X size={18}/></button>
      <h2 id="account-delete-title">{labels.deleteTitle}</h2><p id="account-delete-warning">{labels.deleteWarning}</p>
      {error && <p className="account-page-action-error" role="alert">{error}</p>}
      <div className="account-delete-buttons"><button type="button" className="ui-button-outline" disabled={busy} onClick={() => setConfirming(false)}>{labels.deleteCancel}</button><button type="button" className="ui-button-solid" disabled={busy} onClick={() => void deleteAccount()}>{busy ? labels.deleting : labels.deleteConfirm}</button></div>
    </div></div>}
  </>;
}

export function CreditRecords({ entries, labels, locale, sourceLabels }: { entries: CreditMovement[]; labels: Labels; locale: string; sourceLabels: Record<string, string> }) {
  const [filter, setFilter] = useState('all');
  const visible = entries.filter(entry => filter === 'all' || (filter === 'earned' ? entry.amount > 0 : entry.amount < 0));
  const date = (time: number, withTime = false) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', ...(withTime ? { timeStyle: 'short' as const } : {}), timeZone: 'UTC' }).format(time);
  return <>
    <label className="account-page-filter">{labels.changeType}<select className="ui-input" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">{labels.allRecords}</option><option value="earned">{labels.earned}</option><option value="spent">{labels.spent}</option></select></label>
    {visible.length ? <ul className="account-page-records">{visible.map(entry => <li key={entry.id}>
      <span className={`account-page-record-icon ${entry.amount > 0 ? 'positive' : ''}`} aria-hidden="true">{entry.amount > 0 ? '+' : '−'}</span>
      <span className="account-page-record-detail"><strong>{entry.source ? (sourceLabels[entry.source] ?? entry.source) : entry.kind === 'refund' ? labels.earned : labels.spent}</strong><small>{date(entry.created_at, true)}</small>{entry.source && <small>{entry.expires_at ? labels.expires.replace('{date}', date(entry.expires_at)) : labels.noExpiry}</small>}</span>
      <strong className={entry.amount > 0 ? 'account-page-positive' : ''}>{entry.amount > 0 ? '+' : ''}{entry.amount}</strong>
    </li>)}</ul> : <div className="account-page-empty">{entries.length ? labels.noFilteredCredits : labels.noCredits}</div>}
  </>;
}
