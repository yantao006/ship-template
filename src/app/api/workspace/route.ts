import { createHash, randomBytes } from 'node:crypto';
import { createAuth } from '@/lib/auth';
import { workerEnv } from '@/lib/env';
import { cancelUserSubscription } from '@/lib/payments';

const error = (message: string, status: number) => Response.json({ error: message }, { status });
const text = (data: FormData, key: string, limit = 2000) => String(data.get(key) ?? '').trim().slice(0, limit);
const imageTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
async function imageKey(file: FormDataEntryValue | null, env: ReturnType<typeof workerEnv>, userId: string, kind: string) {
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > 2_000_000 || !imageTypes.has(file.type)) throw new Error('Invalid image (PNG, JPEG or WebP under 2 MB required)');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const valid = file.type === 'image/png' ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
    : file.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!valid) throw new Error('Invalid image content');
  const key = `workspace/${userId}/${kind}/${crypto.randomUUID()}`;
  if (!env.MEDIA) throw new Error('Media storage unavailable');
  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: file.type } });
  return key;
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') return error('Forbidden', 403);
  if (Number(request.headers.get('content-length') ?? 0) > 2_200_000) return error('Too large', 413);
  const env = workerEnv();
  const session = await createAuth(env, new URL(request.url).hostname).api.getSession({ headers: request.headers });
  if (!session) return error('Unauthorized', 401);
  const userId = session.user.id;
  const form = await request.formData().catch(() => null);
  if (!form) return error('Invalid form', 400);
  const action = text(form, 'action', 40), id = text(form, 'id', 100), now = Date.now();
  try {
    if (action === 'key.create') {
      const name = text(form, 'name', 80);
      if (!name) return error('Name required', 400);
      const secret = `ajev_${randomBytes(32).toString('base64url')}`;
      await env.DB.prepare('INSERT INTO user_api_key (id,user_id,name,prefix,key_hash,created_at) VALUES (?,?,?,?,?,?)')
        .bind(crypto.randomUUID(), userId, name, secret.slice(0, 13), createHash('sha256').update(secret).digest('hex'), now).run();
      return Response.json({ key: secret });
    }
    if (action === 'key.delete') {
      await env.DB.prepare('DELETE FROM user_api_key WHERE id=? AND user_id=?').bind(id, userId).run();
    } else if (action === 'notification.read') {
      await env.DB.prepare('UPDATE user_notification SET read_at=? WHERE id=? AND user_id=? AND read_at IS NULL').bind(now, id, userId).run();
    } else if (action === 'ticket.create') {
      const subject = text(form, 'subject', 150), body = text(form, 'body', 4000);
      if (!subject || !body) return error('Subject and message required', 400);
      const attachment = await imageKey(form.get('image'), env, userId, 'tickets');
      const ticketId = crypto.randomUUID();
      try { await env.DB.batch([
        env.DB.prepare("INSERT INTO support_ticket (id,user_id,subject,status,created_at,updated_at) VALUES (?,?,?,'open',?,?)").bind(ticketId,userId,subject,now,now),
        env.DB.prepare('INSERT INTO ticket_message (id,ticket_id,user_id,body,attachment_key,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),ticketId,userId,body,attachment,now),
      ]); } catch (err) { if (attachment) await env.MEDIA?.delete(attachment); throw err; }
    } else if (action === 'ticket.reply') {
      const body = text(form, 'body', 4000);
      if (!body) return error('Message required', 400);
      const owned = await env.DB.prepare("SELECT id FROM support_ticket WHERE id=? AND user_id=? AND status!='closed'").bind(id,userId).first();
      if (!owned) return error('Ticket not found or closed', 404);
      const attachment = await imageKey(form.get('image'), env, userId, 'tickets');
      try { await env.DB.batch([
        env.DB.prepare('INSERT INTO ticket_message (id,ticket_id,user_id,body,attachment_key,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),id,userId,body,attachment,now),
        env.DB.prepare("UPDATE support_ticket SET status='open',updated_at=? WHERE id=? AND user_id=? AND status!='closed'").bind(now,id,userId),
      ]); } catch (err) { if (attachment) await env.MEDIA?.delete(attachment); throw err; }
    } else if (action === 'ticket.close') {
      await env.DB.prepare("UPDATE support_ticket SET status='closed',updated_at=? WHERE id=? AND user_id=? AND status!='closed'").bind(now,id,userId).run();
    } else if (action === 'profile.update') {
      const name = text(form, 'name', 100);
      if (!name) return error('Name required', 400);
      const attachment = await imageKey(form.get('image'), env, userId, 'avatar');
      try { await env.DB.prepare('UPDATE user SET name=?,image=COALESCE(?,image),updated_at=? WHERE id=?').bind(name,attachment ? `/api/workspace/media?key=${encodeURIComponent(attachment)}` : null,now,userId).run(); }
      catch (err) { if (attachment) await env.MEDIA?.delete(attachment); throw err; }
    } else if (action === 'subscription.cancel') {
      if (!await cancelUserSubscription(env,userId,id)) return error('Subscription not found', 404);
    } else if (action !== 'key.delete' && action !== 'notification.read') return error('Unknown action', 400);
    return Response.json({ ok: true });
  } catch (cause) {
    console.error('Workspace action failed', cause);
    return error('Could not save. Please try again.', 500);
  }
}
