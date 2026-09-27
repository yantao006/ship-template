import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { messages } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { accountSnapshot } from '@/lib/request-context';
import { Header } from './sections/Header';
import { Footer } from './sections/Footer';

/** Persistent chrome for marketing and workspace routes in the same locale. */
export async function SiteShell({ locale, children }: { locale: keyof typeof messages; children: ReactNode }) {
  const { session, credits } = await accountSnapshot(workerEnv(), await headers());
  return <div className="public-shell">
    <Header locale={locale} userName={session?.user.name} userEmail={session?.user.email} userImage={session?.user.image} credits={credits} />
    {children}
    <Footer />
  </div>;
}
