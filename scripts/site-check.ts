import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function check(root: string, env: Record<string, string | undefined> = process.env, strict = false) {
  const config = (await import(pathToFileURL(join(root, 'site/site.config.ts')).href)).default;
  const auth = (await import(pathToFileURL(join(root, 'site/auth.config.ts')).href)).default;
  const wrangler = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8'));
  const errors: string[] = [];
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
  if (auth.backend !== 'better-auth' || auth.basePath !== '/api/auth') errors.push('Auth config mismatch');
  if (config.email.provider === 'cloudflare' && !wrangler.send_email?.some((item: {name: string}) => item.name === 'EMAIL')) errors.push('EMAIL binding missing');
  if (config.email.provider !== 'cloudflare' && config.email.provider !== 'resend') errors.push('Invalid email provider');
  const requiredSecrets = ['BETTER_AUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', ...(auth.turnstile.onSignIn ? ['TURNSTILE_SECRET'] : []), ...(config.email.provider === 'resend' ? ['RESEND_API_KEY'] : [])];
  if (JSON.stringify([...wrangler.secrets?.required ?? []].sort()) !== JSON.stringify(requiredSecrets.sort())) errors.push('Required secrets declaration mismatch');
  if (strict) {
    for (const name of requiredSecrets) requireValue(name);
    if (env.SITE_URL !== config.url) errors.push('SITE_URL mismatch');
    if (d1?.database_id === 'REPLACE_WITH_SITE_D1_ID') errors.push('D1 id placeholder');
  }
  return { config, callback: `${config.url}${auth.basePath}/callback/google`, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const result = await check(resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? '.'), process.env, process.argv.includes('--strict'));
  console.log(`Google callback: ${result.callback}`);
  console.log(result.errors.length ? result.errors.join('\n') : 'site-check OK');
  if (result.errors.length) process.exitCode = 1;
}
