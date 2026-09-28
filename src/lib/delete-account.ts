import type { D1Database } from '@cloudflare/workers-types';

/** Remove this user's ledger and identity atomically. FK cascades remove sessions, OAuth accounts,
 * invitations, check-ins, shares and referral records from the versioned schema. */
export async function deleteAccountData(db: Pick<D1Database, 'prepare' | 'batch'>, user: { id: string; email: string }) {
  const statements = [
    db.prepare('DELETE FROM credit_alloc WHERE lot_id IN (SELECT id FROM credit_lot WHERE user_id=?) OR entry_id IN (SELECT id FROM credit_entry WHERE user_id=?)').bind(user.id, user.id),
    db.prepare('DELETE FROM video_task WHERE user_id=?').bind(user.id),
    db.prepare('DELETE FROM credit_entry WHERE user_id=?').bind(user.id),
    db.prepare('DELETE FROM credit_lot WHERE user_id=?').bind(user.id),
    db.prepare("DELETE FROM verification WHERE identifier=? OR substr(identifier, -length(?) - 1)=':' || ?").bind(user.email, user.email, user.email),
    db.prepare('DELETE FROM user WHERE id=? AND email=?').bind(user.id, user.email),
  ];
  const result = await db.batch(statements);
  if (!result.at(-1)?.meta.changes) throw new Error('Account no longer exists');
}
