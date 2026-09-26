import { workerEnv } from '@/lib/env';
import { handlePaymentWebhook } from '@/lib/payments';
import { browserWriteAllowed } from '@/lib/request-context';

export async function POST(request: Request) {
  const env = workerEnv();
  // Signed server callbacks have no browser Origin; only reject an explicit cross-site browser mark.
  if (!browserWriteAllowed(request, env, { originRequired: false, allowAnyOrigin: true })) return Response.json({ error: 'Forbidden' }, { status: 403 });
  return handlePaymentWebhook(env, request);
}
