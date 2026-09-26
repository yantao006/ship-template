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
  for (const file of ['0001_initial.sql', '0003_account_rewards.sql']) {
    for (const sql of readFileSync(`migrations/${file}`, 'utf8').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(sql).run();
  }
  env = { DB: db, SITE_URL: 'http://localhost:8817', LOCAL_AUTH_TEST: '1', BETTER_AUTH_SECRET: 'test-secret-long-enough-for-local-test' };
  for (const [id, created] of [['alice', 1000], ['bob', 1000], ['old', 1000]] as const) {
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

test('payment receipts reflect only settled user ledger entries, not unrelated grants', async () => {
  await grant(env.DB, { userId: 'alice', source: 'payment', sourceId: 'pay-one', credits: 100, now: 9000 });
  await grant(env.DB, { userId: 'bob', source: 'payment', sourceId: 'pay-two', credits: 50, now: 9000 });
  assert.deepEqual((await accountActivity(env, 'alice', 9000)).purchases.map(item => item.source_id), ['pay-one']);
  assert.deepEqual((await accountActivity(env, 'bob', 9000)).purchases.map(item => item.source_id), ['pay-two']);
});
