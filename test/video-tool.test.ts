import { test } from 'node:test';
import assert from 'node:assert/strict';
import en from '../site/messages/en';
import zh from '../site/messages/zh';
import config from '../site/video-tool.config';
import second from '../fixtures/second-site/site/video-tool.config';
import { buildCreatePayload, reconcileFieldValues, snapToStops, visibleWorkflows } from '../src/components/video-tool/state';

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  return typeof value;
}

test('locale tool keys and value types match', () => assert.deepEqual(shape(en.videoTool), shape(zh.videoTool)));

test('workflows are filtered by media and model', () => {
  assert.deepEqual(visibleWorkflows(config, 'image', config.models[0]), []);
  assert.deepEqual(visibleWorkflows(config, 'video', config.models[0]).map(item => item.id), ['text-video', 'image-video']);
  assert.deepEqual(visibleWorkflows(config, 'image', config.models[1]).map(item => item.id), ['text-image']);
  assert.notEqual(second.models[0].id, config.models[0].id);
  assert.equal('promo' in second, false);
});

test('numbers snap to legal model stops', () => {
  assert.equal(snapToStops(7, [4, 8, 12]), 8);
  assert.equal(snapToStops(7, [5, 10]), 5);
  assert.equal(snapToStops(7, []), undefined);
});

test('model change drops unsupported and invalid options and fills defaults', () => {
  assert.deepEqual(reconcileFieldValues(config.fields, config.models[1], { ratio: 'portrait', duration: 8, seed: '42', steady: true, mood: 'bold' }), { ratio: 'square', duration: 5, mood: 'bold', guide: '' });
  assert.deepEqual(reconcileFieldValues(config.fields, config.models[0], { ratio: 'wide', duration: 12 }), { ratio: 'wide', duration: 12, seed: '', steady: false });
});

test('create payload contains only enabled field values and selected references', () => {
  const model = config.models[0];
  assert.deepEqual(buildCreatePayload(model, 'text-video', 'hello', 2, { ratio: 'wide', duration: 8, mood: 'soft' }, ['orbit']), {
    modelId: model.id, workflowId: 'text-video', prompt: 'hello', quantity: 2, values: { ratio: 'wide', duration: 8 }, referenceIds: ['orbit'],
  });
});
