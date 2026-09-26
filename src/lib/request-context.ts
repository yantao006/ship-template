import { createAuth, ensureSignupCredits } from './auth';
import { isAllowedBrowserOrigin } from './config';
import type { Env } from './env';
import { hasInvite } from './invites';
import { balance } from './ledger';

/** Session lookup for both HTTP handlers and server-rendered entries. */
export async function readSession(env: Env, request: Request | Headers) {
  const headers = request instanceof Request ? request.headers : request;
  const hostname = request instanceof Request ? new URL(request.url).hostname : headers.get('host')?.split(':')[0];
  return createAuth(env, hostname).api.getSession({ headers });
}

/** Preserve the public invite probe and Better Auth's originless callers. Signed webhooks are not browser requests. */
export function browserWriteAllowed(request: Request, env: Env, options: { originRequired?: boolean; allowLocalTest?: boolean; allowAnyOrigin?: boolean } = {}): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return options.originRequired === false;
  if (options.allowAnyOrigin) return true;
  const local = options.allowLocalTest === true && env.LOCAL_AUTH_TEST === '1' && origin === env.SITE_URL &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return isAllowedBrowserOrigin(origin) || local;
}

export async function readJson<T>(request: Request): Promise<{ ok: true; body: T } | { ok: false }> {
  try { return { ok: true, body: await request.json() as T }; }
  catch { return { ok: false }; }
}

/** Reads an account once, granting eligible signup credits before reading its balance. */
export async function accountSnapshot(env: Env, request: Request | Headers) {
  const session = await readSession(env, request);
  const invited = session ? await hasInvite(env, session.user.id) : false;
  if (!session || !invited) return { session, invited, credits: undefined };
  await ensureSignupCredits(env, session.user.id);
  return { session, invited, credits: await balance(env.DB, session.user.id) };
}
