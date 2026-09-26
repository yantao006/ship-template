import { balance, grant, paidLedgerSources } from './ledger';
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

function createReferralCode(): string { return crypto.randomUUID().replaceAll('-', ''); }
function validReferralCode(code: string): boolean { return /^[a-f0-9]{32}$/.test(code); }
const utcDay = (now: number) => new Date(now).toISOString().slice(0, 10);

export async function accountActivity(env: Env, userId: string, now = Date.now()) {
  const db = env.DB;
  const code = createReferralCode();
  await db.prepare('INSERT OR IGNORE INTO account_referral_code (user_id,code) VALUES (?,?)').bind(userId, code).run();
  const [referral, days, shares, count, purchases, leaderboard] = await Promise.all([
    db.prepare('SELECT code FROM account_referral_code WHERE user_id=?').bind(userId).first<{code: string}>(),
    db.prepare('SELECT day FROM account_checkin WHERE user_id=? AND day>=? ORDER BY day DESC').bind(userId, utcDay(now - 6 * 86400000)).all<{day: string}>(),
    db.prepare('SELECT id,url,status,created_at FROM account_share WHERE user_id=? ORDER BY created_at DESC LIMIT 20').bind(userId).all<{id: string; url: string; status: string; created_at: number}>(),
    db.prepare('SELECT COUNT(*) AS total FROM account_referral WHERE inviter_id=?').bind(userId).first<{total: number}>(),
    db.prepare(`SELECT source_id,granted,created_at FROM credit_lot WHERE user_id=? AND source IN (${paidLedgerSources.map(() => '?').join(',')}) ORDER BY created_at DESC LIMIT 30`).bind(userId, ...paidLedgerSources).all<{source_id: string; granted: number; created_at: number}>(),
    db.prepare('SELECT u.name, COUNT(*) AS total FROM account_referral r JOIN user u ON u.id=r.inviter_id GROUP BY r.inviter_id ORDER BY total DESC, r.inviter_id LIMIT 3').all<{name: string; total: number}>(),
  ]);
  return { balance: await balance(db, userId, now), referralCode: referral!.code, checkInDays: days.results.map(row => row.day), submissions: shares.results, referralCount: count?.total ?? 0, purchases: purchases.results, leaderboard: leaderboard.results.map(({ name, total }) => ({ name: name.length > 2 ? `${name.slice(0, 2)}***${name.at(-1)}` : `${name.slice(0, 1)}***`, total })) };
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
  const inviter = await env.DB.prepare('SELECT user_id FROM account_referral_code WHERE code=?').bind(code).first<{user_id: string}>();
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
