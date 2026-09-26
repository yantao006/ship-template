import { allowedDesktopTarget, handoffURL } from '@/lib/desktop-auth';
import { browserWriteAllowed, readJson, readSession } from '@/lib/request-context';
import { workerEnv } from '@/lib/env';

export async function POST(request: Request) {
  // The handoff exposes a bearer session. Never allow cross-origin or cross-site POSTs.
  const env = workerEnv();
  if (!browserWriteAllowed(request, env)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = await readJson<{ redirect?: unknown }>(request);
  if (!parsed.ok) return Response.json({ error: 'Invalid request' }, { status: 400 });
  const target = allowedDesktopTarget(typeof parsed.body.redirect === 'string' ? parsed.body.redirect : null);
  if (!target) return Response.json({ error: 'Desktop redirect disabled or invalid' }, { status: 400 });
  const session = await readSession(env, request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json({ url: handoffURL(target, session.session.token) }, { headers: { 'Cache-Control': 'no-store' } });
}
