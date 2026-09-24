'use client';

import { useEffect } from 'react';
import { createAuthClient } from 'better-auth/react';
import { oneTapClient } from 'better-auth/client/plugins';

export function GoogleOneTap({ clientId, callbackURL }: { clientId: string; callbackURL: string }) {
  useEffect(() => {
    const client = createAuthClient({
      basePath: '/api/auth',
      plugins: [oneTapClient({ clientId, autoSelect: false, cancelOnTapOutside: false, promptOptions: { maxAttempts: 1 } })],
    });
    void client.oneTap({ callbackURL }).catch(() => { /* Dismissal leaves normal sign-in available. */ });
  }, [clientId, callbackURL]);
  return null;
}
