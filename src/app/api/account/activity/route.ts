import { accountActivity, AccountRewardError, claimCheckIn, claimReferral, submitShare } from '@/lib/account-rewards';
import { workerEnv } from '@/lib/env';
import { accountSnapshot, browserWriteAllowed, readJson } from '@/lib/request-context';

export async function GET(request: Request) {
  const env = workerEnv();
  const { session, invited } = await accountSnapshot(env, request);
  if (!session || !invited) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json(await accountActivity(env, session.user.id), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const env = workerEnv();
  if (!browserWriteAllowed(request, env, { allowLocalTest: true })) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { session, invited } = await accountSnapshot(env, request);
  if (!session || !invited) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = await readJson<{ action?: string; url?: string; code?: string }>(request);
  if (!parsed.ok) return Response.json({ error: 'Invalid request' }, { status: 400 });
  const body = parsed.body;
  try {
    switch (body.action) {
      case 'checkin': await claimCheckIn(env, session.user.id); break;
      case 'share': await submitShare(env, session.user.id, body.url ?? ''); break;
      case 'referral': await claimReferral(env, session.user.id, body.code ?? ''); break;
      default: return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
    return Response.json(await accountActivity(env, session.user.id), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof AccountRewardError) {
      const statusByCode: Record<AccountRewardError['code'], number> = {
        disabled: 400, invalid_url: 400, limit_reached: 400, duplicate_share: 400,
        invalid_referral: 400, already_claimed: 400, claim_expired: 400,
      };
      return Response.json({ error: error.message }, { status: statusByCode[error.code] });
    }
    return Response.json({ error: 'Request failed' }, { status: 500 });
  }
}
