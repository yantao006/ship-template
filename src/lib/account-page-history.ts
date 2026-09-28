import type { D1Database } from '@cloudflare/workers-types';

export type CreditMovement = {
  id: string; kind: string; amount: number; created_at: number;
  source: string | null; source_id: string | null; expires_at: number | null;
};

/** The ledger is the source of truth for grants, spending, and refunds. Never infer a charge from a credit grant. */
export async function creditMovements(db: Pick<D1Database, 'prepare'>, userId: string): Promise<CreditMovement[]> {
  const result = await db.prepare(`SELECT e.id,e.kind,e.amount,e.created_at,l.source,l.source_id,l.expires_at
    FROM credit_entry e LEFT JOIN credit_lot l ON e.idem_key='grant:' || l.source || ':' || l.source_id AND l.user_id=e.user_id
    WHERE e.user_id=? ORDER BY e.created_at DESC,e.id DESC LIMIT 100`).bind(userId).all<CreditMovement>();
  return result.results;
}
