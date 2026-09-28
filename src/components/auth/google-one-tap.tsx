'use client';

import { useEffect } from 'react';
import { promptGoogleOneTap } from '@/lib/auth-client';

export function GoogleOneTap({ clientId, callbackURL }: { clientId: string; callbackURL: string }) {
  useEffect(() => {
    void promptGoogleOneTap(clientId, callbackURL).catch(() => { /* Dismissal leaves normal sign-in available. */ });
  }, [clientId, callbackURL]);
  return null;
}
