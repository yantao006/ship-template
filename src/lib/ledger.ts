import type { D1Database } from '@cloudflare/workers-types';
// Write-side ledger: D1 native statements and a single batch per business action.
export type DB = Pick<D1Database, 'prepare' | 'batch'>;
const stmt = (db: DB, sql: string, ...args: (string | number | null)[]) => db.prepare(sql).bind(...args);
const id = () => crypto.randomUUID();

export async function grant(db: DB, input: { userId: string; source: string; sourceId: string; credits: number; expiresAt?: number | null; now?: number }) {
  if (!Number.isSafeInteger(input.credits) || input.credits <= 0) throw new Error('Invalid grant');
  const now = input.now ?? Date.now(), lot = id(), entry = id();
  try {
    await db.batch([
      stmt(db, 'INSERT INTO credit_lot (id,user_id,source,source_id,granted,remaining,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?)', lot, input.userId, input.source, input.sourceId, input.credits, input.credits, input.expiresAt ?? null, now),
      stmt(db, "INSERT INTO credit_entry (id,user_id,kind,amount,idem_key,created_at) VALUES (?,?, 'grant', ?, ?, ?)", entry, input.userId, input.credits, `grant:${input.source}:${input.sourceId}`, now),
    ]);
    return true;
  } catch (error) {
    // Do not mask an unrelated constraint/connection error as a duplicate grant.
    const existing = await db.prepare('SELECT user_id,granted FROM credit_lot WHERE source=? AND source_id=?').bind(input.source, input.sourceId).first<{ user_id: string; granted: number }>();
    if (existing?.user_id === input.userId && existing.granted === input.credits) return false;
    throw error;
  }
}

// Payment integration will invoke this once per active year-month, never issue all 12 months at once.
export async function grantSubscriptionMonth(db: DB, input: { userId: string; subscriptionId: string; yearStart: number; monthIndex: number; credits: number }) {
  if (!Number.isInteger(input.monthIndex) || input.monthIndex < 0 || input.monthIndex > 11) throw new Error('Invalid subscription month');
  const start = new Date(input.yearStart);
  if (!Number.isFinite(start.getTime())) throw new Error('Invalid subscription start');
  const monthStart = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + input.monthIndex, 1);
  const monthEnd = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + input.monthIndex + 1, 1);
  return grant(db, { userId: input.userId, source: 'subscription_month', sourceId: `${input.subscriptionId}:${input.yearStart}:${input.monthIndex}`, credits: input.credits, expiresAt: monthEnd, now: monthStart });
}

export async function balance(db: DB, userId: string, now = Date.now()) {
  const row = await db.prepare('SELECT COALESCE(SUM(remaining),0) AS amount FROM credit_lot WHERE user_id=? AND (expires_at IS NULL OR expires_at>?)').bind(userId, now).first<{amount: number}>();
  return row?.amount ?? 0;
}

export async function reserve(db: DB, input: { taskId: string; userId: string; cost: number; now?: number }) {
  if (!Number.isSafeInteger(input.cost) || input.cost <= 0) throw new Error('Invalid cost');
  const now = input.now ?? Date.now(), entry = id();
  await db.batch([
    stmt(db, "INSERT INTO video_task (id,user_id,cost,status,consume_entry_id) VALUES (?,?,?,'reserved',?)", input.taskId, input.userId, input.cost, entry),
    stmt(db, `INSERT INTO credit_alloc (entry_id,lot_id,amount)
      SELECT ?,id,MIN(remaining,?-prev) FROM (
        SELECT id,remaining,COALESCE(SUM(remaining) OVER (ORDER BY expires_at IS NULL,expires_at,created_at,id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) AS prev
        FROM credit_lot WHERE user_id=? AND remaining>0 AND (expires_at IS NULL OR expires_at>?)
      ) WHERE prev<?`, entry, input.cost, input.userId, now, input.cost),
    stmt(db, 'UPDATE credit_lot SET remaining=remaining-(SELECT amount FROM credit_alloc WHERE entry_id=? AND lot_id=credit_lot.id) WHERE id IN (SELECT lot_id FROM credit_alloc WHERE entry_id=?)', entry, entry),
    stmt(db, `INSERT INTO credit_entry (id,user_id,kind,amount,requested,ref_id,idem_key,created_at)
      VALUES (?,?,'consume',-(SELECT COALESCE(SUM(amount),0) FROM credit_alloc WHERE entry_id=?),?,?,'consume:' || ?,?)`, entry, input.userId, entry, input.cost, input.taskId, input.taskId, now),
  ]);
}

export async function refundFailure(db: DB, taskId: string, now = Date.now()) {
  const refundId = id();
  const result = await db.batch([
    stmt(db, "UPDATE video_task SET status='refunded' WHERE id=? AND status IN ('reserved','submitted','processing')", taskId),
    stmt(db, `INSERT INTO credit_entry (id,user_id,kind,amount,ref_id,idem_key,created_at)
      SELECT ?,user_id,'refund',cost,id,'refund:' || id,? FROM video_task WHERE id=? AND status='refunded' AND changes()=1`, refundId, now, taskId),
    stmt(db, `UPDATE credit_lot SET remaining=remaining+(SELECT amount FROM credit_alloc WHERE entry_id=(SELECT consume_entry_id FROM video_task WHERE id=?) AND lot_id=credit_lot.id)
      WHERE id IN (SELECT lot_id FROM credit_alloc WHERE entry_id=(SELECT consume_entry_id FROM video_task WHERE id=?)) AND EXISTS (SELECT 1 FROM credit_entry WHERE id=?)`, taskId, taskId, refundId),
  ]);
  return result[0].meta.changes === 1;
}

export async function finish(db: DB, taskId: string) {
  const result = await db.prepare("UPDATE video_task SET status='succeeded' WHERE id=? AND status IN ('reserved','submitted','processing')").bind(taskId).run();
  return result.meta.changes === 1;
}

// A submitted cancellation never refunds. Reserving but not submitting is an internal failure.
export async function cancelSubmitted(db: DB, taskId: string) {
  const result = await db.prepare("UPDATE video_task SET status='canceled' WHERE id=? AND status IN ('submitted','processing')").bind(taskId).run();
  return result.meta.changes === 1;
}
