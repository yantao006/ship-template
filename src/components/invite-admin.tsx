'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { requestJson } from '@/lib/json-request';

type Code = { code: string; max_uses: number; used_count: number; expires_at: number | null };
export function InviteAdmin() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch('/api/invites');
    if (!response.ok) throw new Error('Could not load invite codes');
    setCodes((await response.json() as { codes: Code[] }).codes);
  }, []);
  useEffect(() => { void load().catch((reason: Error) => setError(reason.message)); }, [load]);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await requestJson('/api/invites', { maxUses: Number(form.get('maxUses')) });
      if (!response.ok) throw new Error('Could not create invite code');
      await load();
    } catch (reason) { setError((reason as Error).message); }
    finally { setPending(false); }
  }
  async function revoke(code: string) {
    if (!window.confirm('Revoke this invite code?')) return;
    setPending(true); setError('');
    try {
      const response = await requestJson('/api/invites', { code }, 'DELETE');
      if (!response.ok) throw new Error('Could not revoke invite code');
      await load();
    } catch (reason) { setError((reason as Error).message); }
    finally { setPending(false); }
  }
  return <main className="invite-admin">
    <h1>Invite codes</h1>
    <form onSubmit={create}><label>Maximum uses <input name="maxUses" type="number" min="1" max="10000" defaultValue="1" required /></label><button className="auth-button" disabled={pending}>Create code</button></form>
    {error && <p role="alert">{error}</p>}
    <ul>{codes.map(item => <li key={item.code}><code>{item.code}</code><span>{item.used_count} / {item.max_uses} used</span><button type="button" disabled={pending} onClick={() => void revoke(item.code)}>Revoke</button></li>)}</ul>
  </main>;
}
