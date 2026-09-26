import { createAuth } from '@/lib/auth';
import { accountActivity, claimCheckIn, claimReferral, submitShare } from '@/lib/account-rewards';
import { hasInvite } from '@/lib/invites';
import { site } from '@/lib/config';
import { workerEnv } from '@/lib/env';

async function authorized(request: Request) {
  const env = workerEnv();
  const session = await createAuth(env, new URL(request.url).hostname).api.getSession({ headers: request.headers });
  if (!session || !await hasInvite(env, session.user.id)) return null;
  return { env, userId: session.user.id };
}

export async function GET(request: Request) {
  const context = await authorized(request);
  if (!context) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json(await accountActivity(context.env, context.userId), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const env = workerEnv();
  const origin = request.headers.get('origin');
  const local = env.LOCAL_AUTH_TEST === '1' && origin === env.SITE_URL && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if ((!local && origin !== site.url) || request.headers.get('sec-fetch-site') === 'cross-site') return Response.json({ error: 'Forbidden' }, { status: 403 });
  const context = await authorized(request);
  if (!context) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { action?: string; url?: string; code?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
  try {
    switch (body.action) {
      case 'checkin': await claimCheckIn(env, context.userId); break;
      case 'share': await submitShare(env, context.userId, body.url ?? ''); break;
      case 'referral': await claimReferral(env, context.userId, body.code ?? ''); break;
      default: return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
    return Response.json(await accountActivity(env, context.userId), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const known = ['Invalid URL', 'Limit reached', 'Already submitted or limit reached', 'Invalid referral', 'Already claimed', 'Claim window expired', 'Disabled'];
    if (error instanceof Error && known.includes(error.message)) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: 'Request failed' }, { status: 500 });
  }
}
