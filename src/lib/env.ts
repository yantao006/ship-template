import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database, R2Bucket, Queue } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  MEDIA?: R2Bucket;
  JOBS?: Queue;
  EMAIL?: { send(message: { from: string; to: string; subject: string; html: string; text?: string }): Promise<unknown> };
  BETTER_AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TURNSTILE_SECRET?: string;
  RESEND_API_KEY?: string;
  SITE_URL?: string;
  LOCAL_AUTH_TEST?: string;
  WAFFO_MERCHANT_ID?: string;
  WAFFO_PRIVATE_KEY?: string;
  WAFFO_PRODUCT_ID?: string;
  WAFFO_CALLBACK_PUBLIC_KEY?: string;
}

export function workerEnv(): Env { return getCloudflareContext().env as unknown as Env; }
