import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyRewardState } from '../src/components/blocks/account-popover-state';

test('daily reward highlights the next day after a completed claim', () => {
  const now = new Date('2026-09-26T17:30:00Z');
  const state = dailyRewardState(['2026-09-26'], now);
  assert.equal(state.claimedToday, true);
  assert.equal(state.completed, 1);
  assert.equal(state.nextClaimAt.toISOString(), '2026-09-27T00:00:00.000Z');
});

test('streak includes yesterday before the next claim but resets after a gap', () => {
  const now = new Date('2026-09-26T17:30:00Z');
  assert.equal(dailyRewardState(['2026-09-24', '2026-09-25'], now).completed, 2);
  assert.equal(dailyRewardState(['2026-09-24'], now).completed, 0);
  assert.equal(dailyRewardState([], now).completed, 0);
});
