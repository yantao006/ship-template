'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { requestJson } from '@/lib/json-request';
import type { messages } from '@/lib/config';

type Code = { code: string; max_uses: number; used_count: number; expires_at: number | null };
export function InviteAdmin({ copy }: { copy: (typeof messages)['en']['invites'] }) {
  const [codes, setCodes] = useState<Code[]>([]);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch('/api/invites');
    if (!response.ok) throw new Error(copy.loadFailed);
    setCodes((await response.json() as { codes: Code[] }).codes);
  }, [copy.loadFailed]);
  useEffect(() => { void load().catch((reason: Error) => setError(reason.message)); }, [load]);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await requestJson('/api/invites', { maxUses: Number(form.get('maxUses')) });
      if (!response.ok) throw new Error(copy.createFailed);
      await load();
    } catch (reason) { setError((reason as Error).message); }
    finally { setPending(false); }
  }
  async function revoke(code: string) {
    if (!window.confirm(copy.revokeConfirm)) return;
    setPending(true); setError('');
    try {
      const response = await requestJson('/api/invites', { code }, 'DELETE');
      if (!response.ok) throw new Error(copy.revokeFailed);
      await load();
    } catch (reason) { setError((reason as Error).message); }
    finally { setPending(false); }
  }
  return <main className="mx-auto max-w-[900px] px-6 py-[60px]">
    <h1 className="text-[36px]">{copy.title}</h1>
    <form className="flex flex-wrap items-end gap-3" onSubmit={create}><label className="grid gap-2">{copy.maxUses} <input className="ui-input min-h-[42px] rounded-[6px] p-2" name="maxUses" type="number" min="1" max="10000" defaultValue="1" required /></label><button className="ui-button-solid auth-button" disabled={pending}>{copy.create}</button></form>
    {error && <p role="alert">{error}</p>}
    <ul className="list-none p-0">{codes.map(item => <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] py-[15px]" key={item.code}><code className="break-words">{item.code}</code><span>{item.used_count} / {item.max_uses} {copy.used}</span><button type="button" disabled={pending} onClick={() => void revoke(item.code)}>{copy.revoke}</button></li>)}</ul>
  </main>;
}
