import { createAuth } from '@/lib/auth';
import { browserWriteAllowed, readJson } from '@/lib/request-context';
import { auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { verifyTurnstile } from '@/lib/turnstile';
import { normalizeInviteCode, validateInvite } from '@/lib/invites';

async function handle(request: Request) {
  const env = workerEnv();
  const url = new URL(request.url);
  if (request.method === 'POST' && !browserWriteAllowed(request, env, { originRequired: false, allowLocalTest: true })) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (auth.invite.required && request.method === 'POST' && url.pathname.endsWith('/sign-up/email')) {
    const parsed = await readJson<{ inviteCode?: string }>(request.clone());
    if (!parsed.ok) return Response.json({ error: 'Invalid request' }, { status: 400 });
    if (!await validateInvite(env, normalizeInviteCode(parsed.body.inviteCode))) return Response.json({ error: 'Valid invite code required' }, { status: 403 });
  }
  if (auth.turnstile.onSignIn && request.method === 'POST' && (url.pathname.endsWith('/sign-in/social') || url.pathname.endsWith('/sign-in/email'))) {
    const token = request.headers.get('x-turnstile-token');
    if (!await verifyTurnstile(env, token, url.hostname)) return Response.json({ error: 'Turnstile verification failed' }, { status: 403 });
  }
  return createAuth(env, url.hostname).handler(request);
}
export const GET = handle;
export const POST = handle;
