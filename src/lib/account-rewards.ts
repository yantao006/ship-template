import { balance, grant } from './ledger';
import { site } from './config';
import type { Env } from './env';

export type AccountRewardCode = 'disabled' | 'invalid_url' | 'limit_reached' | 'duplicate_share' | 'invalid_referral' | 'already_claimed' | 'claim_expired';
const rewardMessages: Record<AccountRewardCode, string> = {
  disabled: 'Disabled', invalid_url: 'Invalid URL', limit_reached: 'Limit reached',
  duplicate_share: 'Already submitted or limit reached', invalid_referral: 'Invalid referral',
  already_claimed: 'Already claimed', claim_expired: 'Claim window expired',
};
export class AccountRewardError extends Error {
  constructor(readonly code: AccountRewardCode) {
    super(rewardMessages[code]);
    this.name = 'AccountRewardError';
  }
}

const referralAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const legacyReferralCode = /^[a-f0-9]{32}$/;
function createReferralCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, byte => referralAlphabet[byte % referralAlphabet.length]).join('');
}
function validReferralCode(code: string): boolean { return /^[a-z0-9]{8}$/.test(code) || legacyReferralCode.test(code); }
function uniqueConstraint(error: unknown): boolean { return error instanceof Error && /UNIQUE constraint failed/i.test(error.message); }
const utcDay = (now: number) => new Date(now).toISOString().slice(0, 10);

async function referralCodeFor(db: Env['DB'], userId: string) {
  return db.prepare('SELECT code FROM account_referral_code WHERE user_id=?').bind(userId).first<{code: string}>();
}

async function insertReferralCode(db: Env['DB'], userId: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = createReferralCode();
    try {
      const result = await db.prepare('INSERT INTO account_referral_code (user_id,code) VALUES (?,?)').bind(userId, code).run();
      if (result.meta.changes) return code;
    } catch (error) {
      if (!uniqueConstraint(error)) throw error;
      const existing = await referralCodeFor(db, userId);
      if (existing) return legacyReferralCode.test(existing.code) ? migrateLegacyReferralCode(db, userId, existing.code) : existing.code;
    }
  }
  throw new Error('Could not allocate a referral code');
}

async function migrateLegacyReferralCode(db: Env['DB'], userId: string, legacy: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = createReferralCode();
    try {
      const results = await db.batch([
        db.prepare('UPDATE account_referral_code SET code=? WHERE user_id=? AND code=?').bind(code, userId, legacy),
        db.prepare('INSERT OR IGNORE INTO account_referral_alias (code,user_id) SELECT ?,? WHERE EXISTS (SELECT 1 FROM account_referral_code WHERE user_id=? AND code=?)').bind(legacy, userId, userId, code),
      ]);
      if (results[0].meta.changes === 1) return code;
      const current = await referralCodeFor(db, userId);
      if (current && !legacyReferralCode.test(current.code)) return current.code;
      if (current) legacy = current.code;
    } catch (error) {
      if (!uniqueConstraint(error)) throw error;
    }
  }
  throw new Error('Could not allocate a referral code');
}

async function ensureReferralCode(db: Env['DB'], userId: string): Promise<string> {
  const existing = await referralCodeFor(db, userId);
  if (!existing) return insertReferralCode(db, userId);
  if (legacyReferralCode.test(existing.code)) return migrateLegacyReferralCode(db, userId, existing.code);
  return existing.code;
}

export async function accountActivity(env: Env, userId: string, now = Date.now()) {
  const db = env.DB;
  const referralCode = await ensureReferralCode(db, userId);
  const [days, shares, count, leaderboard] = await Promise.all([
    db.prepare('SELECT day FROM account_checkin WHERE user_id=? AND day>=? ORDER BY day DESC').bind(userId, utcDay(now - 6 * 86400000)).all<{day: string}>(),
    db.prepare('SELECT id,url,status,created_at FROM account_share WHERE user_id=? ORDER BY created_at DESC LIMIT 20').bind(userId).all<{id: string; url: string; status: string; created_at: number}>(),
    db.prepare('SELECT COUNT(*) AS total FROM account_referral WHERE inviter_id=?').bind(userId).first<{total: number}>(),
    db.prepare('SELECT u.name, COUNT(*) AS total FROM account_referral r JOIN user u ON u.id=r.inviter_id GROUP BY r.inviter_id ORDER BY total DESC, r.inviter_id LIMIT 3').all<{name: string; total: number}>(),
  ]);
  return { balance: await balance(db, userId, now), referralCode, checkInDays: days.results.map(row => row.day), submissions: shares.results, referralCount: count?.total ?? 0, leaderboard: leaderboard.results.map(({ name, total }) => ({ name: name.length > 2 ? `${name.slice(0, 2)}***${name.at(-1)}` : `${name.slice(0, 1)}***`, total })) };
}

export async function claimCheckIn(env: Env, userId: string, now = Date.now()) {
  if (!site.account.checkIn.enabled || !site.account.checkIn.credits) throw new AccountRewardError('disabled');
  const day = utcDay(now);
  await env.DB.prepare('INSERT OR IGNORE INTO account_checkin (user_id,day,created_at) VALUES (?,?,?)').bind(userId, day, now).run();
  // A second request also reconciles a previously inserted claim whose grant was interrupted.
  return grant(env.DB, { userId, source: 'checkin', sourceId: `${userId}:${day}`, credits: site.account.checkIn.credits, now });
}

export async function submitShare(env: Env, userId: string, raw: string, now = Date.now()) {
  if (!site.account.share.enabled) throw new AccountRewardError('disabled');
  let url: URL;
  try { url = new URL(raw); } catch { throw new AccountRewardError('invalid_url'); }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || /^(localhost|.*\.local|\d+(\.\d+){3})$/i.test(url.hostname) || raw.length > 2048 || url.username || url.password) throw new AccountRewardError('invalid_url');
  const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM account_share WHERE user_id=?').bind(userId).first<{total: number}>();
  if ((count?.total ?? 0) >= site.account.share.maxSubmissions) throw new AccountRewardError('limit_reached');
  const result = await env.DB.prepare('INSERT OR IGNORE INTO account_share (id,user_id,url,created_at) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM account_share WHERE user_id=?) < ?').bind(crypto.randomUUID(), userId, url.href, now, userId, site.account.share.maxSubmissions).run();
  if (!result.meta.changes) throw new AccountRewardError('duplicate_share');
}

export async function claimReferral(env: Env, referredId: string, code: string, now = Date.now()) {
  const config = site.account.referral;
  if (!config.enabled || !validReferralCode(code)) throw new AccountRewardError('invalid_referral');
  const user = await env.DB.prepare('SELECT created_at FROM user WHERE id=?').bind(referredId).first<{created_at: number}>();
  const inviter = await env.DB.prepare('SELECT user_id FROM account_referral_code WHERE code=? UNION ALL SELECT user_id FROM account_referral_alias WHERE code=?').bind(code, code).first<{user_id: string}>();
  if (!user || !inviter || inviter.user_id === referredId) throw new AccountRewardError('invalid_referral');
  // better-auth stores timestamps in milliseconds. Existing claims can be retried to reconcile grants.
  const existing = await env.DB.prepare('SELECT inviter_id FROM account_referral WHERE referred_id=?').bind(referredId).first<{inviter_id: string}>();
  if (existing && existing.inviter_id !== inviter.user_id) throw new AccountRewardError('already_claimed');
  if (!existing) {
    if (now - user.created_at > config.claimWindowHours * 3600000 || user.created_at > now + 60000) throw new AccountRewardError('claim_expired');
    const inserted = await env.DB.prepare('INSERT OR IGNORE INTO account_referral (referred_id,inviter_id,created_at) VALUES (?,?,?)').bind(referredId, inviter.user_id, now).run();
    if (!inserted.meta.changes) {
      const winner = await env.DB.prepare('SELECT inviter_id FROM account_referral WHERE referred_id=?').bind(referredId).first<{inviter_id: string}>();
      if (winner?.inviter_id !== inviter.user_id) throw new AccountRewardError('already_claimed');
    }
  }
  await grant(env.DB, { userId: inviter.user_id, source: 'referral_inviter', sourceId: referredId, credits: config.inviterCredits, now });
  await grant(env.DB, { userId: referredId, source: 'referral_friend', sourceId: referredId, credits: config.friendCredits, now });
}
