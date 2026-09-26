import { workerEnv } from '@/lib/env';
import { accountSnapshot } from '@/lib/request-context';

export async function GET(request: Request) {
  const { session, invited, credits } = await accountSnapshot(workerEnv(), request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!invited) return Response.json({ error: 'Invite required' }, { status: 403 });
  return Response.json({ credits });
}
