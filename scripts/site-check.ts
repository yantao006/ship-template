import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { googleCallback, githubCallback } from '../src/lib/config';
import { dangerousProtocols } from '../src/lib/desktop-auth';
import { accountIconNames, shareNetworkNames } from '../src/lib/site-config-types';

export async function check(root: string, env: Record<string, string | undefined> = process.env, strict = false) {
  const config = (await import(pathToFileURL(join(root, 'site/site.config.ts')).href)).default;
  const auth = (await import(pathToFileURL(join(root, 'site/auth.config.ts')).href)).default;
  const theme = (await import(pathToFileURL(join(root, 'site/theme.config.ts')).href)).default;
  const copy = (await import(pathToFileURL(join(root, 'site/messages/index.ts')).href)).default;
  const wrangler = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8'));
  const errors: string[] = [];
  if (config.languages.some((language: { code: string }) => !copy[language.code]) || !copy[config.defaultLocale]) errors.push('Site language copy missing');
  for (const key of ['light', 'dark'] as const) {
    if (!theme[key] || !theme.chrome?.[key] || !theme.dialog?.[key] || !theme.videoTool?.[key] || !theme.rowTones?.[key]) errors.push(`Theme ${key} missing`);
  }
  const requireValue = (key: string) => { if (!env[key]) errors.push(`${key} missing`); };
  const d1 = wrangler.d1_databases?.find((item: {binding: string}) => item.binding === 'DB');
  const r2 = wrangler.r2_buckets?.find((item: {binding: string}) => item.binding === 'MEDIA');
  const queue = wrangler.queues?.producers?.find((item: {binding: string}) => item.binding === 'JOBS');
  if (wrangler.name !== config.deploy.worker) errors.push('Worker name mismatch');
  if (d1?.database_name !== config.deploy.d1 || !d1?.database_id) errors.push('D1 mismatch');
  if (r2?.bucket_name !== config.deploy.r2) errors.push('R2 mismatch');
  if (queue?.queue !== config.deploy.queue || !wrangler.queues?.consumers?.some((item: {queue: string}) => item.queue === config.deploy.queue)) errors.push('Queue mismatch');
  if (wrangler.main !== 'worker.ts') errors.push('Custom Worker entry missing');
  if (!/^https:\/\/[^/]+$/.test(config.url) || new URL(config.url).hostname !== config.apex) errors.push('Canonical site URL mismatch');
  if (wrangler.vars?.SITE_URL !== config.url) errors.push('Worker SITE_URL mismatch');
  if (auth.backend !== 'better-auth' || Object.hasOwn(auth, 'basePath') || !['email', 'google', 'github'].every(key => typeof auth[key as 'email' | 'google' | 'github']?.enabled === 'boolean')) errors.push('Auth config mismatch');
  if (typeof auth.email.requireVerification !== 'boolean' || (auth.email.requireVerification && !auth.email.enabled)) errors.push('Invalid email verification switch');
  if (typeof auth.email.passwordReset !== 'boolean' || (auth.email.passwordReset && !auth.email.enabled)) errors.push('Invalid password reset switch');
  if (auth.google.oneTapEnabled && !auth.google.enabled) errors.push('Google One Tap requires Google auth');
  if (auth.invite?.required && (!Array.isArray(auth.invite.adminEmails) || !auth.invite.adminEmails.length)) errors.push('Invite admin email missing');
  if (auth.desktop?.schemes?.some((scheme: string) => !/^[a-z][a-z0-9+.-]*$/i.test(scheme) || dangerousProtocols.some(protocol => protocol === scheme.toLowerCase()))) errors.push('Invalid desktop scheme');
  if (config.email.provider === 'cloudflare' && !wrangler.send_email?.some((item: {name: string}) => item.name === 'EMAIL')) errors.push('EMAIL binding missing');
  if (config.email.provider !== 'cloudflare' && config.email.provider !== 'resend') errors.push('Invalid email provider');
  const account = config.account;
  const positive = (value: unknown) => Number.isSafeInteger(value) && (value as number) > 0;
  const validNetworks = (value: unknown) => Array.isArray(value) && value.length > 0 && new Set(value).size === value.length && value.every(name => shareNetworkNames.some(network => network === name));
  if (!account || !['checkIn', 'share', 'referral'].every(key => typeof account[key]?.enabled === 'boolean') ||
      !positive(account.checkIn?.credits) || !positive(account.share?.credits) || !positive(account.share?.maxSubmissions) ||
      !positive(account.referral?.inviterCredits) || !positive(account.referral?.friendCredits) || !positive(account.referral?.claimWindowHours) ||
      !['contactEmail', 'feedbackEmail'].every(key => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(account[key] ?? '')) ||
      !/^\/(?!\/)[a-z0-9/-]+$/.test(account.commercialUseHref ?? '') ||
      !validNetworks(account.shareNetworks) || !validNetworks(account.sharePostNetworks) ||
      !['checkin', 'share', 'invite', 'contact', 'feedback'].every(key => accountIconNames.some(icon => icon === account.icons?.[key]))) errors.push('Invalid account experience settings');
  const paymentSecrets = ['WAFFO_MERCHANT_ID', 'WAFFO_PRIVATE_KEY', 'WAFFO_PRODUCT_ID', 'WAFFO_CALLBACK_PUBLIC_KEY'];
  const requiredSecrets = ['BETTER_AUTH_SECRET', ...(auth.google.enabled ? ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] : []), ...(auth.github.enabled ? ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'] : []), ...(auth.turnstile.onSignIn ? ['TURNSTILE_SECRET'] : []), ...(config.email.provider === 'resend' ? ['RESEND_API_KEY'] : []), ...paymentSecrets];
  const plans = config.plans as { id: string; billing: string; credits: number; amount: string; currency: string; description: string }[] | undefined;
  const planIds = new Set<string>();
  if (!plans?.length) errors.push('Site plans missing');
  for (const plan of plans ?? []) {
    if (!plan.id || planIds.has(plan.id) || (plan.billing !== 'once' && plan.billing !== 'year') || !Number.isSafeInteger(plan.credits) || plan.credits <= 0 || !/^\d+\.\d{2}$/.test(plan.amount) || !/^[A-Z]{3}$/.test(plan.currency) || !plan.description) errors.push('Invalid site plan');
    planIds.add(plan.id);
  }
  if (JSON.stringify([...wrangler.secrets?.required ?? []].sort()) !== JSON.stringify(requiredSecrets.sort())) errors.push('Required secrets declaration mismatch');
  if (strict) {
    for (const name of requiredSecrets) requireValue(name);
    if (env.SITE_URL !== config.url) errors.push('SITE_URL mismatch');
    if (d1?.database_id === 'REPLACE_WITH_SITE_D1_ID') errors.push('D1 id placeholder');
  }
  return { config, callback: googleCallback(config), githubCallback: githubCallback(config), errors };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const result = await check(resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? '.'), process.env, process.argv.includes('--strict'));
  console.log(`Google callback: ${result.callback}`);
  console.log(result.errors.length ? result.errors.join('\n') : 'site-check OK');
  if (result.errors.length) process.exitCode = 1;
}
