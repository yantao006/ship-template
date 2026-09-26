import type { VideoToolStructure } from '../../../src/components/video-tool/types';

export default {
  media: [{ id: 'still', icon: '◇' }],
  workflows: [{ id: 'sketch', icon: '◇', mediaId: 'still' }],
  vendors: [{ id: 'other-vendor' }],
  models: [{ id: 'other-model', vendorId: 'other-vendor', icon: '○', workflowIds: ['sketch'], fieldIds: ['format'], options: { format: ['square'] }, tags: [] }],
  fields: [{ id: 'format', type: 'option' }],
  references: [], referenceLimits: { image: 1 }, quantity: { min: 1, max: 2, default: 1 },
  tabs: [{ id: 'samples' }], assets: [],
} satisfies VideoToolStructure;
