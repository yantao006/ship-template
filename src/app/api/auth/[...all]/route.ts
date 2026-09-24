import { createAuth } from '@/lib/auth';
import { workerEnv } from '@/lib/env';
import { verifyTurnstile } from '@/lib/turnstile';

async function handle(request: Request) {
  const env = workerEnv();
  if (env.SITE_MODE === 'test-static') return Response.json({ error: 'Login unavailable on this test Worker' }, { status: 503 });
  const url = new URL(request.url);
  if (request.method === 'POST' && (url.pathname.endsWith('/sign-in/social') || url.pathname.endsWith('/sign-in/email'))) {
    const token = request.headers.get('x-turnstile-token');
    if (!await verifyTurnstile(env, token, url.hostname)) return Response.json({ error: 'Turnstile verification failed' }, { status: 403 });
  }
  return createAuth(env, url.hostname).handler(request);
}
export const GET = handle;
export const POST = handle;
