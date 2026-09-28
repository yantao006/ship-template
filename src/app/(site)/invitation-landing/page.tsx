import type { Metadata } from 'next';
import { HomeContent } from '@/components/home/home-content';
import { messages, site } from '@/lib/config';

// Use the existing branded homepage and its referral capture on the shared invite URL.
// ReferralCapture keeps invite_code through sign-in and claims it for eligible new accounts.
export const dynamic = 'force-dynamic';
const description = messages[site.defaultLocale as keyof typeof messages].account.checkinInviteMessage;
export const metadata: Metadata = {
  title: 'Invite',
  description,
  alternates: { canonical: '/invitation-landing' },
  openGraph: { title: site.brand, description },
};

export default function InvitationLanding() {
  return <HomeContent />;
}
