import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import site from '../site/site.config';
import videoTool from '../site/video-tool.config';
import messages from '../site/messages';
import { videoToolTemplates } from '../site/video-tool/templates';
import { videoTemplatesEn } from '../site/messages/en/video-templates';
import { videoTemplatesZh } from '../site/messages/zh/video-templates';

test('template catalog has 57 unique local assets with complete, exact bilingual copy', () => {
  const ids = videoToolTemplates.map(item => item.id);
  assert.equal(ids.length, 57);
  assert.equal(new Set(ids).size, 57, 'duplicate template id');
  for (const copy of [videoTemplatesEn, videoTemplatesZh]) {
    assert.deepEqual(Object.keys(copy).sort(), [...ids].sort(), 'missing or orphaned template copy');
    for (const id of ids) {
      const entry = copy[id as keyof typeof copy];
      assert.ok(entry?.title.trim() && entry?.description.trim(), `${id} needs title and description`);
    }
  }
  for (const item of videoToolTemplates) {
    assert.match(item.url, /^\/video-tool\/[a-z0-9-]+\.webp$/);
    assert.ok(existsSync(`public${item.url}`), `${item.id}: missing ${item.url}`);
  }
  assert.deepEqual(videoTool.assets.filter(item => ids.includes(item.id as typeof ids[number])).map(item => item.id), ids, 'template display order changed');
  for (const locale of ['en', 'zh'] as const) {
    for (const id of ids) assert.deepEqual(messages[locale].videoTool.assets[id as keyof typeof videoTemplatesEn], locale === 'en' ? videoTemplatesEn[id as keyof typeof videoTemplatesEn] : videoTemplatesZh[id as keyof typeof videoTemplatesZh]);
  }
});

test('the thirteen payment plan identities, credits, amounts and descriptions remain fixed', () => {
  assert.deepEqual(site.plans.map(plan => [plan.id, 'tier' in plan ? plan.tier : '', plan.billing, plan.credits, plan.amount, plan.currency, plan.description]), [
    ['lite-month', 'lite', 'month', 600, '29.90', 'USD', 'Lite monthly'],
    ['lite-year', 'lite', 'year', 600, '178.80', 'USD', 'Lite annual'],
    ['standard-month', 'standard', 'month', 1500, '49.90', 'USD', 'Standard monthly'],
    ['standard-year', 'standard', 'year', 1500, '298.80', 'USD', 'Standard annual'],
    ['pro-month', 'pro', 'month', 3600, '99.90', 'USD', 'Pro monthly'],
    ['pro-year', 'pro', 'year', 3600, '598.80', 'USD', 'Pro annual'],
    ['max-month', 'max', 'month', 8000, '199.90', 'USD', 'Max monthly'],
    ['max-year', 'max', 'year', 8000, '1198.80', 'USD', 'Max annual'],
    ['starter', '', 'once', 800, '39.90', 'USD', 'Starter credit pack'],
    ['value', '', 'once', 2000, '79.90', 'USD', 'Value credit pack'],
    ['pro-pack', '', 'once', 7500, '199.90', 'USD', 'Pro credit pack'],
    ['bulk', '', 'once', 50000, '999.90', 'USD', 'Bulk credit pack'],
    ['mega', '', 'once', 160000, '2599.00', 'USD', 'Mega credit pack'],
  ]);
});
