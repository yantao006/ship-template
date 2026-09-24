import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { oneTap } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import { authSchema } from './auth-schema';
import { grant } from './ledger';
import { hasInvite } from './invites';
import type { Env } from './env';
import { site, auth } from './config';

export interface AuthSettings {
  basePath: string;
  email: { enabled: boolean };
  google: { enabled: boolean; oneTapEnabled?: boolean };
  github: { enabled: boolean };
}

export function createAuth(env: Env, requestHostname?: string, settings: AuthSettings = auth) {
  const local = env.LOCAL_AUTH_TEST === '1' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.SITE_URL ?? '') && (!requestHostname || /^(localhost|127\.0\.0\.1)$/.test(requestHostname));
  if (!env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET missing');
  if (settings.google.enabled && (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)) throw new Error('Google credentials missing');
  if (settings.github.enabled && (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET)) throw new Error('GitHub credentials missing');
  const baseURL = env.SITE_URL;
  if (!baseURL || (!local && baseURL !== site.url)) throw new Error('SITE_URL must match this site');
  const db = drizzle(env.DB, { schema: authSchema });
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite', schema: authSchema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: settings.basePath,
    trustedOrigins: local ? [env.SITE_URL!] : [site.url, `https://www.${site.apex}`],
    socialProviders: {
      ...(settings.google.enabled ? { google: { clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! } } : {}),
      ...(settings.github.enabled ? { github: { clientId: env.GITHUB_CLIENT_ID!, clientSecret: env.GITHUB_CLIENT_SECRET! } } : {}),
    },
    emailAndPassword: { enabled: settings.email.enabled },
    plugins: settings.google.enabled && settings.google.oneTapEnabled ? [oneTap()] : [],
    databaseHooks: { user: { create: { after: async (created) => {
      await ensureSignupCredits(env, created.id);
    } } } },
  });
}

export async function ensureSignupCredits(env: Env, userId: string) {
  if (!await hasInvite(env, userId)) return false;
  return grant(env.DB, { userId, source: 'signup', sourceId: userId, credits: site.signupCredits });
}
