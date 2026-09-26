import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import en from '../site/messages/en';
import zh from '../site/messages/zh';
import config from '../site/video-tool.config';
import second from '../fixtures/second-site/site/video-tool.config';
import { buildCreatePayload, modelForMedia, previewCost, reconcileFieldValues, snapToStops, summaryFields, visibleWorkflows } from '../src/components/video-tool/state';
import type { VideoToolCopy } from '../src/components/video-tool/types';

const videoModels = ['minimax-h3-max', 'minimax-h3', 'minimax-h3-lite', 'seedance-2-5', 'seedance-2-0', 'seedance-2-0-fast', 'seedance-2-0-mini', 'seedance-1-5-pro', 'wan-3-0', 'wan-2-7', 'wan-2-6', 'grok-imagine', 'kling-3-0'];
const imageModels = ['seedream-5-pro', 'seedream-5-lite', 'seedream-4-5', 'gpt-image-2-5', 'gpt-image-2', 'nano-banana-2', 'nano-banana-pro', 'nano-banana'];

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  return typeof value;
}

function assertCopy(copy: VideoToolCopy) {
  for (const item of config.media) assert.equal(typeof copy.media[item.id], 'string');
  for (const item of config.workflows) assert.equal(typeof copy.workflows[item.id], 'string');
  for (const item of config.vendors) assert.equal(typeof copy.vendors[item.id], 'string');
  for (const item of config.models) {
    assert.equal(typeof copy.models[item.id], 'string');
    for (const tag of item.tags) assert.equal(typeof copy.tags[tag.id], 'string');
    for (const [field, options] of Object.entries(item.options)) for (const option of options) assert.equal(typeof copy.options[field]?.[option], 'string');
  }
  for (const field of config.fields) assert.equal(typeof copy.fields[field.id], 'string');
  for (const item of config.references) assert.equal(typeof copy.references.candidates[item.id], 'string');
  for (const item of config.referenceKinds) assert.equal(typeof copy.references.limits[item.id], 'string');
  for (const tab of config.tabs) assert.equal(typeof copy.tabs[tab.id]?.label, 'string');
  for (const asset of config.assets) {
    assert.equal(typeof copy.assets[asset.id]?.title, 'string');
    for (const action of asset.actionIds ?? []) assert.equal(typeof copy.assets[asset.id]?.actions?.[action], 'string');
    for (const link of asset.links ?? []) assert.equal(typeof copy.assets[asset.id]?.links?.[link.id], 'string');
  }
}

test('locale tool keys and value types match', () => assert.deepEqual(shape(en.videoTool), shape(zh.videoTool)));

test('configured ids have copy in both locales', () => {
  assertCopy(en.videoTool);
  assertCopy(zh.videoTool);
});

test('catalog is grouped and the default video model matches the workbench', () => {
  assert.deepEqual(config.vendors.map(vendor => vendor.id), ['minimax', 'seedance', 'wan', 'grok', 'kling', 'seedream', 'openai', 'nano-banana']);
  assert.deepEqual(config.models.map(model => model.id), [...videoModels, ...imageModels]);
  assert.ok(config.models.every(model => config.vendors.some(vendor => vendor.id === model.vendorId)));
  assert.equal(modelForMedia(config, 'video')?.id, 'minimax-h3');
  assert.equal(modelForMedia(config, 'image')?.id, 'gpt-image-2');
  const imageDefault = modelForMedia(config, 'image');
  assert.ok(imageDefault);
  assert.deepEqual(visibleWorkflows(config, 'image', imageDefault).map(item => item.id), ['text-image', 'image-edit']);
  assert.deepEqual(reconcileFieldValues(config.fields, imageDefault, {}), { ratio: 'auto', size: '1k', format: 'jpeg' });
  const h3 = config.models.find(model => model.id === 'minimax-h3');
  assert.ok(h3);
  assert.deepEqual(visibleWorkflows(config, 'video', h3).map(item => item.id), ['multi-reference', 'text-video', 'image-video']);
  assert.deepEqual(visibleWorkflows(config, 'image', h3), []);
  const lite = config.models.find(model => model.id === 'minimax-h3-lite');
  assert.ok(lite);
  assert.deepEqual(visibleWorkflows(config, 'video', lite).map(item => item.id), ['multi-reference', 'text-video', 'image-video']);
  assert.equal(config.models.filter(model => model.workflowIds.includes('multi-reference') && model.vendorId === 'minimax').length, 3);
  assert.equal(config.models.filter(model => model.workflowIds.includes('multi-reference') && model.vendorId === 'seedance').length, 5);
  for (const mediaId of ['video', 'image']) {
    const cases = config.assets.filter(asset => asset.tabId === 'use-cases' && asset.mediaIds?.includes(mediaId));
    assert.equal(cases.length, mediaId === 'image' ? 57 : 3);
    assert.ok(cases.every(asset => asset.url.startsWith('/video-tool/') && existsSync(`public${asset.url}`)));
  }
  assert.deepEqual(config.referenceKinds.filter(kind => !kind.mediaIds || kind.mediaIds.includes('image')).map(kind => kind.id), ['image']);
  assert.deepEqual(config.references.map(item => item.id), ['lattice-pie-photo', 'fruit-tarts-photo', 'seeded-loaf-photo', 'layer-cake-photo', 'kitchen-video', 'kitchen-audio']);
  for (const item of config.references.filter(item => item.kind !== 'image')) {
    assert.ok(item.url.startsWith('/video-tool/') && existsSync(`public${item.url}`));
    assert.ok(item.thumbnail && existsSync(`public${item.thumbnail}`));
  }
  assert.deepEqual(config.workflows.find(item => item.id === 'text-video')?.referenceLimits, {});
  assert.deepEqual(config.workflows.find(item => item.id === 'image-video')?.referenceLimits, { image: 2 });
  assert.deepEqual(config.workflows.find(item => item.id === 'image-edit')?.referenceLimits, { image: 16 });
  assert.deepEqual(config.workflows.find(item => item.id === 'multi-image')?.referenceLimits, { image: 1 });
  assert.deepEqual(config.models.filter(model => model.workflowIds.includes('multi-image')).map(model => model.id), ['seedream-5-pro']);
  assert.equal(en.videoTool.prompt.titleByWorkflow?.['multi-image'], 'Decomposition instructions (optional)');
  assert.equal(zh.videoTool.prompt.titleByWorkflow?.['multi-image'], '拆解说明（可选）');
  assert.equal(config.galleryModes?.image, 'template-grid');
  assert.equal(config.defaultWorkflowIdsByMedia?.image, 'image-edit');
  assert.equal(config.defaultModelIdsByWorkflow?.['multi-image'], 'seedream-5-pro');
  assert.deepEqual(config.defaultFieldValuesByWorkflow?.['text-image'], { ratio: '16-9', size: '1k', format: 'jpeg' });
  for (const model of config.models.filter(item => item.stops?.duration)) {
    assert.deepEqual(Object.keys(model.costByDuration ?? {}).map(Number).sort((a, b) => a - b), [...(model.stops?.duration ?? [])].sort((a, b) => a - b));
  }
  assert.equal(config.assets.some(asset => asset.tabId === 'history'), false);
});

test('second site keeps the same structure without a promo', () => {
  assert.notEqual(second.models[0].id, config.models[0].id);
  assert.equal('promo' in second, false);
  assert.deepEqual(second.media.map(item => item.id), ['video', 'image']);
  assert.ok(second.models.every(model => second.vendors.some(vendor => vendor.id === model.vendorId)));
  assert.ok(second.assets.some(asset => asset.tabId === 'use-cases' && asset.url.startsWith('https://')));
  assert.equal(second.assets.some(asset => asset.tabId === 'history'), false);
  assert.ok(second.referenceKinds.length > 0);
  assert.equal(previewCost(second.models[0], { duration: 10 }, 2), 16);
});

test('numbers snap to legal model stops', () => {
  assert.equal(snapToStops(7, [4, 8, 12]), 8);
  assert.equal(snapToStops(7, [5, 10]), 5);
  assert.equal(snapToStops(7, []), undefined);
});

test('summary stays on option and number values and duration uses model stops', () => {
  const h3 = config.models.find(model => model.id === 'minimax-h3');
  const pro = config.models.find(model => model.id === 'seedance-1-5-pro');
  assert.ok(h3 && pro);
  assert.deepEqual(summaryFields(config.fields, h3).map(field => field.id), ['ratio', 'resolution', 'duration']);
  assert.deepEqual(reconcileFieldValues(config.fields, h3, {}), { ratio: '16-9', resolution: '720p', duration: 6 });
  assert.deepEqual(summaryFields(config.fields, pro).map(field => field.id), ['ratio', 'resolution', 'duration']);
  assert.deepEqual(reconcileFieldValues(config.fields, pro, { ratio: '1-1', duration: 6, seed: '42' }), { ratio: '16-9', resolution: '720p', duration: 4, seed: '42' });
  const still = config.models.find(model => model.id === 'seedream-5-lite');
  assert.ok(still);
  assert.deepEqual(summaryFields(config.fields, still).map(field => field.id), ['ratio', 'size']);
});

test('preview cost follows configured model duration and quantity without charging credits', () => {
  const h3 = config.models.find(item => item.id === 'minimax-h3');
  const image = config.models.find(item => item.id === 'seedream-5-pro');
  assert.ok(h3 && image);
  assert.equal(previewCost(h3, { duration: 6 }, 1), 42);
  assert.equal(previewCost(h3, { duration: 10 }, 2), 208);
  assert.equal(previewCost(image, { size: '2k' }, 2), 48);
});

test('create payload contains only enabled field values and selected references', () => {
  const model = config.models.find(item => item.id === 'minimax-h3');
  assert.ok(model);
  assert.deepEqual(buildCreatePayload(model, 'text-video', 'hello', 2, { ratio: '16-9', duration: 10, seed: 'x' }, ['lattice-pie-photo']), {
    modelId: 'minimax-h3', workflowId: 'text-video', prompt: 'hello', quantity: 2, values: { ratio: '16-9', duration: 10 }, referenceIds: ['lattice-pie-photo'],
  });
  assert.deepEqual(buildCreatePayload(model, 'image-video', '', 1, { duration: 6 }, ['fruit-tarts-photo', 'lattice-pie-photo'], { start: 'fruit-tarts-photo', end: 'lattice-pie-photo' }), {
    modelId: 'minimax-h3', workflowId: 'image-video', prompt: '', quantity: 1, values: { duration: 6 }, referenceIds: ['fruit-tarts-photo', 'lattice-pie-photo'], referenceFrames: { start: 'fruit-tarts-photo', end: 'lattice-pie-photo' },
  });
});
