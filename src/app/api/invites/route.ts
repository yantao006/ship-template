import { auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { createInvite, isInviteAdmin, listInvites, revokeInvite, validInviteCode } from '@/lib/invites';
import { browserWriteAllowed, readJson, readSession } from '@/lib/request-context';

async function admin(request: Request) {
  const env = workerEnv();
  const session = await readSession(env, request);
  return { env, authorized: !!session && isInviteAdmin(session.user.email) };
}

export async function GET(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  const { env, authorized } = await admin(request);
  if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
  return Response.json({ codes: await listInvites(env) });
}

export async function POST(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  const env = workerEnv();
  if (!browserWriteAllowed(request, env)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { authorized } = await admin(request);
  if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = await readJson<{ maxUses?: number; expiresAt?: number | null }>(request);
  if (!parsed.ok) return Response.json({ error: 'Invalid request' }, { status: 400 });
  const body = parsed.body;
  if (!Number.isSafeInteger(body.maxUses) || body.maxUses! < 1 || body.maxUses! > 10000 || (body.expiresAt != null && (!Number.isSafeInteger(body.expiresAt) || body.expiresAt <= Date.now()))) return Response.json({ error: 'Invalid invite settings' }, { status: 400 });
  return Response.json({ code: await createInvite(env, body.maxUses!, body.expiresAt) }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  const env = workerEnv();
  if (!browserWriteAllowed(request, env)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { authorized } = await admin(request);
  if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = await readJson<{ code?: string }>(request);
  if (!parsed.ok) return Response.json({ error: 'Invalid request' }, { status: 400 });
  if (!parsed.body.code || !validInviteCode(parsed.body.code)) return Response.json({ error: 'Invalid code' }, { status: 400 });
  return Response.json({ deleted: await revokeInvite(env, parsed.body.code) });
}
