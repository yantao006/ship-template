import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { auth, isAllowedBrowserOrigin } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { hasInvite, redeemInvite } from '@/lib/invites';

export async function POST(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  if (!isAllowedBrowserOrigin(request.headers.get('origin'))) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const env = workerEnv();
  const session = await createAuth(env, new URL(request.url).hostname).api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (await hasInvite(env, session.user.id)) return Response.json({ redeemed: true });
  let body: { code?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
  if (!body.code || !await redeemInvite(env, session.user.id, body.code.trim().toUpperCase())) return Response.json({ error: 'Invalid or exhausted invite code' }, { status: 400 });
  await ensureSignupCredits(env, session.user.id);
  return Response.json({ redeemed: true });
}
