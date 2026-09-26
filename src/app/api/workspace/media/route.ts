import { createAuth } from '@/lib/auth';
import { workerEnv } from '@/lib/env';

export async function GET(request: Request) {
  const env = workerEnv();
  const session = await createAuth(env, new URL(request.url).hostname).api.getSession({ headers: request.headers });
  if (!session) return new Response(null, { status: 401 });
  const key = new URL(request.url).searchParams.get('key') ?? '';
  if (!key.startsWith(`workspace/${session.user.id}/`)) return new Response(null, { status: 404 });
  const used = key.includes('/avatar/')
    ? await env.DB.prepare('SELECT id FROM user WHERE id=? AND image=?').bind(session.user.id, `/api/workspace/media?key=${encodeURIComponent(key)}`).first()
    : await env.DB.prepare('SELECT m.id FROM ticket_message m JOIN support_ticket t ON m.ticket_id=t.id WHERE t.user_id=? AND m.attachment_key=?').bind(session.user.id,key).first();
  if (!used) return new Response(null, { status: 404 });
  const object = await env.MEDIA?.get(key);
  if (!object) return new Response(null, { status: 404 });
  return new Response(await object.arrayBuffer(), { headers: { 'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
