'use client';

import { useReferralClaim } from '@/lib/use-referral-claim';

export function ReferralCapture({ signedIn }: { signedIn: boolean }) {
  useReferralClaim(signedIn);
  return null;
}
