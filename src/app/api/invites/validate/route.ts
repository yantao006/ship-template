import { auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { validateInvite } from '@/lib/invites';

export async function POST(request: Request) {
  if (!auth.invite.required) return Response.json({ error: 'Invites disabled' }, { status: 404 });
  let body: { code?: string };
  try { body = await request.json(); } catch { return Response.json({ valid: false }, { status: 400 }); }
  const valid = await validateInvite(workerEnv(), typeof body.code === 'string' ? body.code.trim().toUpperCase() : '');
  return Response.json({ valid });
}
