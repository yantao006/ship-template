'use client';

import { useEffect, useState } from 'react';

export function DesktopHandoff({ target, copy }: { target: string; copy: { desktopReturning: string; desktopFailed: string } }) {
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    fetch('/api/auth/desktop-handoff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ redirect: target }) })
      .then(async response => { if (!response.ok) throw new Error(copy.desktopFailed); return response.json() as Promise<{ url: string }>; })
      .then(({ url }) => { if (active) window.location.assign(url); })
      .catch((reason: Error) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [target]);
  return <p role={error ? 'alert' : 'status'}>{error || copy.desktopReturning}</p>;
}
