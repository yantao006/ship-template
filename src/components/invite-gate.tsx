'use client';

import { requestJson } from '@/lib/json-request';
import { useState, type FormEvent } from 'react';

export function InviteGate({ copy }: { copy: { invite: string; inviteInvalid: string; inviteRedeemFailed: string; wait: string } }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError('');
    const code = String(new FormData(event.currentTarget).get('code') ?? '');
    try {
      const result = await requestJson('/api/invites/redeem', { code });
      if (!result.ok) setError(copy.inviteInvalid);
      else window.location.reload();
    } catch { setError(copy.inviteRedeemFailed); }
    finally { setPending(false); }
  }
  return <form className="invite-gate" onSubmit={submit}>
    <label>{copy.invite}<input name="code" autoComplete="off" required maxLength={32} placeholder={copy.invite} /></label>
    <button className="auth-button" disabled={pending}>{pending ? copy.wait : copy.invite}</button>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>;
}
