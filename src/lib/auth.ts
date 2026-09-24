import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { drizzle } from 'drizzle-orm/d1';
import { authSchema } from './auth-schema';
import { grant } from './ledger';
import type { Env } from './env';
import { site, auth } from './config';

export function createAuth(env: Env, requestHostname?: string) {
  const local = env.LOCAL_AUTH_TEST === '1' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.SITE_URL ?? '') && (!requestHostname || /^(localhost|127\.0\.0\.1)$/.test(requestHostname));
  if (!env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET missing');
  if (!local && (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)) throw new Error('Google credentials missing');
  const baseURL = env.SITE_URL;
  if (!baseURL || (!local && baseURL !== site.url)) throw new Error('SITE_URL must match this site');
  const db = drizzle(env.DB, { schema: authSchema });
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite', schema: authSchema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: auth.basePath,
    trustedOrigins: local ? [env.SITE_URL!] : [site.url, `https://www.${site.apex}`],
    socialProviders: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } } : {},
    emailAndPassword: { enabled: local },
    databaseHooks: { user: { create: { after: async (created) => {
      await grant(env.DB, { userId: created.id, source: 'signup', sourceId: created.id, credits: site.signupCredits });
    } } } },
  });
}

export async function ensureSignupCredits(env: Env, userId: string) {
  return grant(env.DB, { userId, source: 'signup', sourceId: userId, credits: site.signupCredits });
}
