'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Props = { action: string; id?: string; label: string; children?: ReactNode; onCreated?: boolean; copyLabel?: string; secretHint?: string; errorLabel?: string };
export function WorkspaceAction({ action, id, label, children, onCreated, copyLabel = 'Copy', secretHint = 'Copy this key now. It will not be shown again.', errorLabel = 'Request failed' }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [key, setKey] = useState('');
  return <form className="workspace-form" onSubmit={async event => {
    event.preventDefault(); setPending(true); setError(''); setKey('');
    try {
      const form = new FormData(event.currentTarget);
      form.set('action', action); if (id) form.set('id', id);
      const response = await fetch('/api/workspace', { method: 'POST', body: form });
      const result = await response.json() as { error?: string; key?: string };
      if (!response.ok) throw new Error(result.error ?? errorLabel);
      if (result.key) setKey(result.key);
      if (onCreated) (event.target as HTMLFormElement).reset();
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : errorLabel); }
    finally { setPending(false); }
  }}>
    {children}
    <button type="submit" disabled={pending}>{pending ? '…' : label}</button>
    {error && <p role="alert" className="form-error">{error}</p>}
    {key && <div className="workspace-secret"><code>{key}</code><button type="button" onClick={() => navigator.clipboard.writeText(key)} aria-label={copyLabel}>{copyLabel}</button><p>{secretHint}</p></div>}
  </form>;
}
