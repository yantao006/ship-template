import { auth } from './config';
import type { Env } from './env';

export async function hasInvite(env: Env, userId: string, required = auth.invite.required): Promise<boolean> {
  if (!required) return true;
  return !!await env.DB.prepare('SELECT user_id FROM invite_redemption WHERE user_id = ?').bind(userId).first();
}

export async function validateInvite(env: Env, code: string, required = auth.invite.required): Promise<boolean> {
  if (!required || !/^[A-F0-9]{32}$/.test(code)) return false;
  return !!await env.DB.prepare('SELECT code FROM invite_code WHERE code = ? AND deleted_at IS NULL AND used_count < max_uses AND (expires_at IS NULL OR expires_at > ?)').bind(code, Date.now()).first();
}

export async function redeemInvite(env: Env, userId: string, code: string, required = auth.invite.required): Promise<boolean> {
  if (!await validateInvite(env, code, required)) return false;
  const results = await env.DB.batch([
    env.DB.prepare('UPDATE invite_code SET used_count = used_count + 1 WHERE code = ? AND deleted_at IS NULL AND used_count < max_uses AND (expires_at IS NULL OR expires_at > ?) AND NOT EXISTS (SELECT 1 FROM invite_redemption WHERE user_id = ?)').bind(code, Date.now(), userId),
    env.DB.prepare('INSERT INTO invite_redemption (user_id, code, created_at) SELECT ?, ?, ? WHERE changes() = 1').bind(userId, code, Date.now()),
  ]);
  return results[0].meta.changes === 1 && results[1].meta.changes === 1;
}

export function isInviteAdmin(email: string): boolean {
  return auth.invite.adminEmails.some(admin => admin.toLowerCase() === email.toLowerCase());
}
