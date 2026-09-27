import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import type { Env } from '../src/lib/env';
import { accountActivity, AccountRewardError, claimCheckIn, claimReferral, submitShare } from '../src/lib/account-rewards';
import { grant } from '../src/lib/ledger';
import en from '../site/messages/en';
import zh from '../site/messages/zh';

let mf: Miniflare;
let env: Env;
before(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { DB: 'account-rewards' } });
  const db = await mf.getD1Database('DB');
  for (const file of ['0001_initial.sql', '0003_account_rewards.sql', '0004_referral_alias.sql']) {
    for (const sql of readFileSync(`migrations/${file}`, 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
  }
  env = { DB: db, SITE_URL: 'http://localhost:8817', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: 'test-secret-long-enough-for-local-test' };
  for (const [id, created] of [['alice', 1000], ['bob', 1000], ['old', 1000], ['taken', 1000], ['newbie', 1000], ['mina', 1000], ['neo', 1000], ['pia', 1000], ['oldstyle', 1000], ['pal', 1000]] as const) {
    await db.prepare('INSERT INTO user(id,name,email,created_at,updated_at) VALUES (?,?,?,?,?)').bind(id, id, `${id}@example.com`, created, created).run();
  }
});
after(async () => { await mf?.dispose(); });

test('account dialog copy exists in both locales', () => {
  assert.deepEqual(Object.keys(en.account).sort(), Object.keys(zh.account).sort());
});

test('daily claim changes the ledger exactly once even under concurrency and retries', async () => {
  await Promise.all(Array.from({ length: 6 }, () => claimCheckIn(env, 'alice', 2000)));
  const state = await accountActivity(env, 'alice', 2000);
  assert.equal(state.balance, 1);
  assert.deepEqual(state.checkInDays, ['1970-01-01']);
  await claimCheckIn(env, 'alice', 86402000);
  assert.equal((await accountActivity(env, 'alice', 86402000)).balance, 2);
  assert.equal((await accountActivity(env, 'bob', 86402000)).balance, 0);
});

test('share submissions persist as pending, enforce URL validation and cap without granting credits', async () => {
  await assert.rejects(submitShare(env, 'bob', 'http://localhost/secret', 3000), (error: unknown) => error instanceof AccountRewardError && error.code === 'invalid_url' && error.message === 'Invalid URL');
  await submitShare(env, 'bob', 'https://reddit.com/r/example/one', 3000);
  await assert.rejects(submitShare(env, 'bob', 'https://reddit.com/r/example/one', 3000), /Already submitted/);
  await submitShare(env, 'bob', 'https://reddit.com/r/example/two', 3000);
  await submitShare(env, 'bob', 'https://reddit.com/r/example/three', 3000);
  await assert.rejects(submitShare(env, 'bob', 'https://reddit.com/r/example/four', 3000), /Limit reached/);
  const state = await accountActivity(env, 'bob', 3000);
  assert.equal(state.balance, 0);
  assert.equal(state.submissions.length, 3);
  assert.equal(state.submissions[0].status, 'pending');
});

test('referral rewards are user-scoped, once per new account, with safe retry and age limit', async () => {
  const code = (await accountActivity(env, 'alice', 3000)).referralCode;
  await assert.rejects(claimReferral(env, 'alice', code, 3000), (error: unknown) => error instanceof AccountRewardError && error.code === 'invalid_referral' && error.message === 'Invalid referral');
  await Promise.all(Array.from({ length: 4 }, () => claimReferral(env, 'bob', code, 3000)));
  await claimReferral(env, 'bob', code, 3000);
  assert.equal((await accountActivity(env, 'alice', 3000)).balance, 8);
  assert.equal((await accountActivity(env, 'bob', 3000)).balance, 4);
  assert.equal((await accountActivity(env, 'alice', 3000)).referralCount, 1);
  assert.deepEqual((await accountActivity(env, 'alice', 3000)).leaderboard, [{ name: 'al***e', total: 1 }]);
  const other = (await accountActivity(env, 'old', 3000)).referralCode;
  await assert.rejects(claimReferral(env, 'bob', other, 3000), /Already claimed/);
  await assert.rejects(claimReferral(env, 'old', code, 4 * 86400000), /Claim window expired/);
});

test('new referral codes are 8 character lowercase alphanumeric and retry a unique collision', async () => {
  const original = crypto.getRandomValues.bind(crypto);
  let calls = 0;
  crypto.getRandomValues = ((array: Uint8Array) => {
    calls += 1;
    if (calls === 1) { array.fill(0); return array; }
    return original(array);
  }) as typeof crypto.getRandomValues;
  try {
    await env.DB.prepare('INSERT INTO account_referral_code (user_id,code) VALUES (?,?)').bind('taken', 'aaaaaaaa').run();
    const code = (await accountActivity(env, 'newbie', 4000)).referralCode;
    assert.match(code, /^[a-z0-9]{8}$/);
    assert.notEqual(code, 'aaaaaaaa');
    assert.ok(calls >= 2);
    assert.equal((await accountActivity(env, 'newbie', 4000)).referralCode, code);
  } finally {
    crypto.getRandomValues = original;
  }
});

test('claims accept a new short code and a previously issued 32 hex code, including after display migration', async () => {
  const legacy = '2d3cbeafcc6041fa8f7c70b9d7cd2bf0';
  const untouched = 'ab'.repeat(16);
  await env.DB.prepare('INSERT INTO account_referral_code (user_id,code) VALUES (?,?)').bind('mina', legacy).run();
  await env.DB.prepare('INSERT INTO account_referral_code (user_id,code) VALUES (?,?)').bind('oldstyle', untouched).run();
  await claimReferral(env, 'pal', untouched, 5000);
  const display = (await accountActivity(env, 'mina', 5000)).referralCode;
  assert.match(display, /^[a-z0-9]{8}$/);
  assert.equal((await accountActivity(env, 'mina', 5000)).referralCode, display);
  await claimReferral(env, 'neo', legacy, 5000);
  await claimReferral(env, 'pia', display, 5000);
  assert.equal((await accountActivity(env, 'mina', 5000)).referralCount, 2);
  const alias = await env.DB.prepare('SELECT user_id FROM account_referral_alias WHERE code=?').bind(legacy).first<{user_id: string}>();
  assert.equal(alias?.user_id, 'mina');
  assert.equal((await env.DB.prepare('SELECT code FROM account_referral_code WHERE user_id=?').bind('oldstyle').first<{code: string}>())?.code, untouched);
});

test('payment receipts reflect only settled user ledger entries, not unrelated grants', async () => {
  await grant(env.DB, { userId: 'alice', source: 'payment', sourceId: 'pay-one', credits: 100, now: 9000 });
  await grant(env.DB, { userId: 'bob', source: 'payment', sourceId: 'pay-two', credits: 50, now: 9000 });
  assert.deepEqual((await accountActivity(env, 'alice', 9000)).purchases.map(item => item.source_id), ['pay-one']);
  assert.deepEqual((await accountActivity(env, 'bob', 9000)).purchases.map(item => item.source_id), ['pay-two']);
});
