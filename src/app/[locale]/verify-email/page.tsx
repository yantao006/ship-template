import { VerifyEmail } from '@/components/verify-email';
import { auth, localeFor, messages } from '@/lib/config';

export default async function VerifyEmailPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ email?: string }> }) {
  const locale = localeFor((await params).locale);
  const { email } = await searchParams;
  return <VerifyEmail locale={locale} email={email ?? ''} enabled={auth.email.enabled && auth.email.requireVerification} copy={messages[locale].nav} />;
}
