import type { VideoToolStructure } from '../../../src/components/video-tool/types';

const still = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80';

export default {
  media: [{ id: 'video', icon: '▣' }, { id: 'image', icon: '◇' }],
  workflows: [
    { id: 'multi', icon: '▦', mediaId: 'video' },
    { id: 'text-video', icon: '✎', mediaId: 'video' },
    { id: 'image-video', icon: '▧', mediaId: 'video' },
    { id: 'text-image', icon: '◇', mediaId: 'image' },
  ],
  vendors: [{ id: 'clip-lab' }, { id: 'still-lab' }],
  models: [
    { id: 'bench-clip', vendorId: 'clip-lab', icon: '▶', workflowIds: ['multi', 'text-video', 'image-video'], fieldIds: ['ratio', 'duration'], options: { ratio: ['wide'] }, stops: { duration: [6, 10] }, tags: [{ id: 'short', tone: 'neutral' }], count: 4, costByDuration: { 6: 4, 10: 8 } },
    { id: 'bench-still', vendorId: 'still-lab', icon: '◻', workflowIds: ['text-image'], fieldIds: ['ratio'], options: { ratio: ['square'] }, tags: [], count: 2 },
  ],
  fields: [{ id: 'ratio', type: 'option' }, { id: 'duration', type: 'number', unit: 's' }],
  references: [{ id: 'loaf', kind: 'image', url: still }],
  referenceKinds: [{ id: 'image', icon: '◻' }],
  referenceLimits: { image: 2 },
  quantity: { min: 1, max: 2, default: 1 },
  tabs: [{ id: 'use-cases' }, { id: 'history' }],
  assets: [
    { id: 'loaf-case', type: 'image', url: still, tabId: 'use-cases', mediaIds: ['video'], actionIds: ['open'], links: [{ id: 'more', href: '/samples' }] },
    { id: 'still-case', type: 'image', url: still, tabId: 'use-cases', mediaIds: ['image'], actionIds: ['open'], links: [{ id: 'more', href: '/samples' }] },
  ],
} satisfies VideoToolStructure;
