import type { D1Database } from '@cloudflare/workers-types';

export type CreditLot = { id: string; source: string; granted: number; remaining: number; created_at: number; expires_at: number | null };

export async function creditHistory(db: Pick<D1Database, 'prepare'>, userId: string): Promise<CreditLot[]> {
  const result = await db.prepare('SELECT id,source,granted,remaining,created_at,expires_at FROM credit_lot WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT 100').bind(userId).all<CreditLot>();
  return result.results;
}
