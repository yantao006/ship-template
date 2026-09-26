import { ensureSignupCredits } from '@/lib/auth';
import { auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { hasInvite, normalizeInviteCode, redeemInvite } from '@/lib/invites';
import { browserWriteAllowed, readJson, readSession } from '@/lib/request-context';

export async function POST(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  const env = workerEnv();
  if (!browserWriteAllowed(request, env)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const session = await readSession(env, request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (await hasInvite(env, session.user.id)) return Response.json({ redeemed: true });
  const parsed = await readJson<{ code?: string }>(request);
  if (!parsed.ok) return Response.json({ error: 'Invalid request' }, { status: 400 });
  if (!parsed.body.code || !await redeemInvite(env, session.user.id, normalizeInviteCode(parsed.body.code))) return Response.json({ error: 'Invalid or exhausted invite code' }, { status: 400 });
  await ensureSignupCredits(env, session.user.id);
  return Response.json({ redeemed: true });
}
