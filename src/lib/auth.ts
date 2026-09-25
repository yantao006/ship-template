import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { oneTap } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import { authSchema } from './auth-schema';
import { grant } from './ledger';
import { hasInvite } from './invites';
import { createEmailProvider, type EmailProvider } from './email';
import type { Env } from './env';
import { site, auth, messages, localeFor } from './config';

export interface AuthSettings {
  basePath: string;
  email: { enabled: boolean; requireVerification?: boolean; passwordReset?: boolean };
  google: { enabled: boolean; oneTapEnabled?: boolean };
  github: { enabled: boolean };
}

function resetMailCopy(url: string) {
  try {
    const callback = new URL(url).searchParams.get('callbackURL') ?? '';
    const path = callback.startsWith('http') ? new URL(callback).pathname : callback;
    return messages[localeFor(path.split('/').filter(Boolean)[0] ?? '')].nav;
  } catch {
    return messages[localeFor('')].nav;
  }
}

export function createAuth(env: Env, requestHostname?: string, settings: AuthSettings = auth, emailProvider?: EmailProvider) {
  const local = env.LOCAL_AUTH_TEST === '1' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.SITE_URL ?? '') && (!requestHostname || /^(localhost|127\.0\.0\.1)$/.test(requestHostname));
  if (!env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET missing');
  if (settings.google.enabled && (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)) throw new Error('Google credentials missing');
  if (settings.github.enabled && (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET)) throw new Error('GitHub credentials missing');
  const baseURL = env.SITE_URL;
  if (!baseURL || (!local && baseURL !== site.url)) throw new Error('SITE_URL must match this site');
  const db = drizzle(env.DB, { schema: authSchema });
  const mailer = settings.email.enabled && (settings.email.requireVerification || settings.email.passwordReset) ? (emailProvider ?? createEmailProvider(site, env)) : undefined;
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
    emailAndPassword: {
      enabled: settings.email.enabled,
      requireEmailVerification: !!settings.email.requireVerification,
      autoSignIn: !settings.email.requireVerification,
      ...(settings.email.enabled && settings.email.passwordReset ? {
        resetPasswordTokenExpiresIn: 60 * 60,
        sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
          const copy = resetMailCopy(url);
          await mailer!.sendEmail({
            from: site.email.from,
            to: user.email,
            subject: copy.resetMailSubject,
            text: `${copy.resetMailLead}\n\n${url}\n\n${copy.resetMailExpiry}`,
            html: `<p>${copy.resetMailLead}</p><p><a href="${url.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}">${copy.resetMailAction}</a></p><p>${copy.resetMailExpiry}</p>`,
          });
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
          const copy = `Verify your email for ${site.brand}`;
          await mailer!.sendEmail({
            from: site.email.from,
            to: user.email,
            subject: copy,
            text: `Open this link to verify your email and sign in:\n\n${url}\n\nThis link expires in 24 hours.`,
            html: `<p>Open the link below to verify your email and sign in.</p><p><a href="${url.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
          });
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
