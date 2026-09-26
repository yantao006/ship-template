import { auth } from './config';
import type { Env } from './env';

export function normalizeInviteCode(code: unknown): string {
  return typeof code === 'string' ? code.trim().toUpperCase() : '';
}

export function validInviteCode(code: string): boolean {
  return /^[A-F0-9]{32}$/.test(code);
}

export async function listInvites(env: Env) {
  const rows = await env.DB.prepare('SELECT code, max_uses, used_count, expires_at, created_at FROM invite_code WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100').all();
  return rows.results;
}

export async function createInvite(env: Env, maxUses: number, expiresAt: number | null = null): Promise<string> {
  const code = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  await env.DB.prepare('INSERT INTO invite_code (code, max_uses, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(code, maxUses, expiresAt, Date.now()).run();
  return code;
}

export async function revokeInvite(env: Env, code: string): Promise<boolean> {
  const result = await env.DB.prepare('UPDATE invite_code SET deleted_at = ? WHERE code = ? AND deleted_at IS NULL').bind(Date.now(), code).run();
  return result.meta.changes === 1;
}

export async function hasInvite(env: Env, userId: string, required = auth.invite.required): Promise<boolean> {
  if (!required) return true;
  return !!await env.DB.prepare('SELECT user_id FROM invite_redemption WHERE user_id = ?').bind(userId).first();
}

export async function validateInvite(env: Env, code: string, required = auth.invite.required): Promise<boolean> {
  if (!required || !validInviteCode(code)) return false;
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
