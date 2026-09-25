import { workerEnv } from '@/lib/env';
import { handlePaymentWebhook } from '@/lib/payments';

export async function POST(request: Request) {
  return handlePaymentWebhook(workerEnv(), request);
}
