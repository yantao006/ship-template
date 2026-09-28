import { deleteAccountData } from './delete-account';
import type { Env } from './env';
import { browserWriteAllowed, readJson, readSession } from './request-context';

export async function deleteOwnAccount(request: Request, env: Env) {
  if (!browserWriteAllowed(request, env, { originRequired: true, allowLocalTest: true })) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const session = await readSession(env, request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = await readJson<{ confirm?: string }>(request);
  if (!parsed.ok || parsed.body.confirm !== session.user.email) return Response.json({ error: 'Confirmation required' }, { status: 400 });
  await deleteAccountData(env.DB, { id: session.user.id, email: session.user.email });
  return Response.json({ deleted: true }, { headers: { 'Cache-Control': 'no-store' } });
}
