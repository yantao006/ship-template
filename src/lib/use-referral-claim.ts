'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { requestJson } from './json-request';

const pendingKey = 'account-referral-code';
const validCode = (code: string | null): code is string => !!code && /^[a-f0-9]{32}$/.test(code);

export function useReferralClaim(signedIn: boolean) {
  const router = useRouter();
  const inFlight = useRef<string | null>(null);
  useEffect(() => {
    const url = new URL(location.href);
    const fromUrl = url.searchParams.get('ref');
    if (validCode(fromUrl)) sessionStorage.setItem(pendingKey, fromUrl);
    const code = validCode(fromUrl) ? fromUrl : sessionStorage.getItem(pendingKey);
    if (!signedIn || !validCode(code) || sessionStorage.getItem(`referral:${code}`) || inFlight.current === code) return;
    inFlight.current = code;
    void requestJson('/api/account/activity', { action: 'referral', code }).then(async response => {
      if (response.ok) {
        const activity: unknown = await response.json();
        window.dispatchEvent(new CustomEvent('account-referral-claimed', { detail: activity }));
        router.refresh();
      }
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 401)) {
        sessionStorage.setItem(`referral:${code}`, '1');
        sessionStorage.removeItem(pendingKey);
        const current = new URL(location.href);
        current.searchParams.delete('ref');
        history.replaceState(null, '', current.pathname + current.search + current.hash);
      }
    }).catch(() => { /* Retain pending code for a later visit on network failure. */ }).finally(() => { inFlight.current = null; });
  }, [signedIn, router]);
}
