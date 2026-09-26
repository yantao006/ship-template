import { createAuth } from '@/lib/auth';
import { auth, isAllowedBrowserOrigin } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { isInviteAdmin } from '@/lib/invites';

async function admin(request: Request) {
  const env = workerEnv();
  const session = await createAuth(env, new URL(request.url).hostname).api.getSession({ headers: request.headers });
  return { env, authorized: !!session && isInviteAdmin(session.user.email) };
}

export async function GET(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  const { env, authorized } = await admin(request);
  if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const rows = await env.DB.prepare('SELECT code, max_uses, used_count, expires_at, created_at FROM invite_code WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100').all();
  return Response.json({ codes: rows.results });
}

export async function POST(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  if (!isAllowedBrowserOrigin(request.headers.get('origin'))) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { env, authorized } = await admin(request);
  if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
  let body: { maxUses?: number; expiresAt?: number | null };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
  if (!Number.isSafeInteger(body.maxUses) || body.maxUses! < 1 || body.maxUses! > 10000 || (body.expiresAt != null && (!Number.isSafeInteger(body.expiresAt) || body.expiresAt <= Date.now()))) return Response.json({ error: 'Invalid invite settings' }, { status: 400 });
  const code = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  await env.DB.prepare('INSERT INTO invite_code (code, max_uses, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(code, body.maxUses, body.expiresAt ?? null, Date.now()).run();
  return Response.json({ code }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  if (!isAllowedBrowserOrigin(request.headers.get('origin'))) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { env, authorized } = await admin(request);
  if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
  let body: { code?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
  if (!body.code || !/^[A-F0-9]{32}$/.test(body.code)) return Response.json({ error: 'Invalid code' }, { status: 400 });
  const result = await env.DB.prepare('UPDATE invite_code SET deleted_at = ? WHERE code = ? AND deleted_at IS NULL').bind(Date.now(), body.code).run();
  return Response.json({ deleted: result.meta.changes === 1 });
}
