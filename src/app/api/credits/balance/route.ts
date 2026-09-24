import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { balance } from '@/lib/ledger';
import { workerEnv } from '@/lib/env';

export async function GET(request: Request) {
  const env = workerEnv();
  const session = await createAuth(env, new URL(request.url).hostname).api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureSignupCredits(env, session.user.id);
  return Response.json({ credits: await balance(env.DB, session.user.id) });
}
