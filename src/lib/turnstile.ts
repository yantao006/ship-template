import type { Env } from './env';

export async function verifyTurnstile(env: Env, token: string | null, hostname: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  const local = /^localhost$|^127\.0\.0\.1$/.test(hostname) && env.LOCAL_AUTH_TEST === '1' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.SITE_URL ?? '');
  if (local && token === 'local-test-token') return true;
  if (!token || !env.TURNSTILE_SECRET) return false;
  const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }) });
  if (!response.ok) return false;
  const data = await response.json() as {success?: boolean; hostname?: string};
  return data.success === true && data.hostname === hostname;
}
