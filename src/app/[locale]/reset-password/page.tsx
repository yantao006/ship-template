import { ResetPassword } from '@/components/reset-password';
import { auth, localeFor, messages } from '@/lib/config';

export default async function ResetPasswordPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string; error?: string }> }) {
  const locale = localeFor((await params).locale);
  const query = await searchParams;
  const token = query.error === 'INVALID_TOKEN' ? '' : (query.token ?? '');
  return <ResetPassword locale={locale} token={token} enabled={auth.email.enabled && !!auth.email.passwordReset} copy={messages[locale].nav} />;
}
