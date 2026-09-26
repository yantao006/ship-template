import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { oneTap } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import { authSchema } from './auth-schema';
import { grant } from './ledger';
import { hasInvite } from './invites';
import { createEmailProvider, type EmailProvider } from './email';
import type { Env } from './env';
import { site, auth, allowedBrowserOrigins } from './config';
import { notifyVerification, notifyPasswordReset } from './notifications';
import { authBasePath } from './auth-path';

export interface AuthSettings {
  email: { enabled: boolean; requireVerification?: boolean; passwordReset?: boolean };
  google: { enabled: boolean; oneTapEnabled?: boolean };
  github: { enabled: boolean };
}

export function createAuth(env: Env, requestHostname?: string, settings: AuthSettings = auth, emailProvider?: EmailProvider) {
  const local = env.LOCAL_AUTH_TEST === '1' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.SITE_URL ?? '') && (!requestHostname || /^(localhost|127\.0\.0\.1)$/.test(requestHostname));
  const preview = requestHostname === new URL(site.previewOrigin).hostname;
  if (!env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET missing');
  if (settings.google.enabled && (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)) throw new Error('Google credentials missing');
  if (settings.github.enabled && (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET)) throw new Error('GitHub credentials missing');
  const baseURL = preview ? site.previewOrigin : env.SITE_URL;
  if (!baseURL || (!local && !preview && baseURL !== site.url)) throw new Error('SITE_URL must match this site');
  const db = drizzle(env.DB, { schema: authSchema });
  const mailer = settings.email.enabled && (settings.email.requireVerification || settings.email.passwordReset) ? (emailProvider ?? createEmailProvider(site, env)) : undefined;
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite', schema: authSchema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: authBasePath,
    trustedOrigins: local ? [env.SITE_URL!] : allowedBrowserOrigins(),
    socialProviders: {
      ...(settings.google.enabled ? { google: { clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! } } : {}),
      ...(settings.github.enabled ? { github: { clientId: env.GITHUB_CLIENT_ID!, clientSecret: env.GITHUB_CLIENT_SECRET! } } : {}),
    },
    emailAndPassword: {
      enabled: settings.email.enabled,
      requireEmailVerification: !!settings.email.requireVerification,
      autoSignIn: !settings.email.requireVerification,
      ...(settings.email.enabled && settings.email.passwordReset ? {
        resetPasswordTokenExpiresIn: 60 * 60,
        sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
          await notifyPasswordReset(mailer!, site, user.email, url);
        },
      } : {}),
    },
    ...(settings.email.enabled && settings.email.requireVerification ? {
      emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: false,
        autoSignInAfterVerification: true,
        expiresIn: 60 * 60 * 24,
        sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
          await notifyVerification(mailer!, site, user.email, url);
        },
        afterEmailVerification: async (user: { id: string }) => {
          await ensureSignupCredits(env, user.id, true);
        },
      },
    } : {}),
    plugins: settings.google.enabled && settings.google.oneTapEnabled ? [oneTap()] : [],
    databaseHooks: { user: { create: { after: async (created) => {
      await ensureSignupCredits(env, created.id, !!settings.email.requireVerification);
    } } } },
  });
}

export async function ensureSignupCredits(env: Env, userId: string, requireVerification = auth.email.requireVerification) {
  if (requireVerification) {
    const user = await env.DB.prepare('SELECT email_verified FROM user WHERE id = ?').bind(userId).first<{ email_verified: number }>();
    if (!user?.email_verified) return false;
  }
  if (!await hasInvite(env, userId)) return false;
  return grant(env.DB, { userId, source: 'signup', sourceId: userId, credits: site.signupCredits });
}
