import { deleteOwnAccount } from '@/lib/delete-account-request';
import { workerEnv } from '@/lib/env';

export async function POST(request: Request) {
  try { return await deleteOwnAccount(request, workerEnv()); }
  catch { return Response.json({ error: 'Could not delete account' }, { status: 500 }); }
}
