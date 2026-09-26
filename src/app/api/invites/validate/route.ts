import { auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { normalizeInviteCode, validateInvite } from '@/lib/invites';
import { browserWriteAllowed, readJson } from '@/lib/request-context';

export async function POST(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  const env = workerEnv();
  // Public probe historically accepts missing or arbitrary Origin; reject only the cross-site browser mark.
  if (!browserWriteAllowed(request, env, { originRequired: false, allowAnyOrigin: true })) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = await readJson<{ code?: string }>(request);
  if (!parsed.ok) return Response.json({ valid: false }, { status: 400 });
  const valid = await validateInvite(env, normalizeInviteCode(parsed.body.code));
  return Response.json({ valid });
}
