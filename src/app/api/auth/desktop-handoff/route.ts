import { createAuth } from '@/lib/auth';
import { allowedDesktopTarget, handoffURL } from '@/lib/desktop-auth';
import { isAllowedBrowserOrigin } from '@/lib/config';
import { workerEnv } from '@/lib/env';

export async function POST(request: Request) {
  // The handoff exposes a bearer session. Never allow cross-origin or cross-site POSTs.
  if (!isAllowedBrowserOrigin(request.headers.get('origin')) || request.headers.get('sec-fetch-site') === 'cross-site') return Response.json({ error: 'Forbidden' }, { status: 403 });
  let body: { redirect?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
  const target = allowedDesktopTarget(typeof body.redirect === 'string' ? body.redirect : null);
  if (!target) return Response.json({ error: 'Desktop redirect disabled or invalid' }, { status: 400 });
  const session = await createAuth(workerEnv(), new URL(request.url).hostname).api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json({ url: handoffURL(target, session.session.token) }, { headers: { 'Cache-Control': 'no-store' } });
}
