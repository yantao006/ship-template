import type { VideoToolStructure } from '../src/components/video-tool/types';

const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`)}`;
const line = (body: string) => svg(`<g fill="none" stroke="#e4e4e7" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</g>`);
const badge = (color: string, body: string) => svg(`<rect width="24" height="24" rx="7" fill="${color}"/>${body}`);

const film = line('<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M8 6v12M16 6v12M3.5 10h4.5M3.5 14h4.5M16 10h4.5M16 14h4.5"/>');
const frame = line('<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.3" fill="#e4e4e7" stroke="none"/><path d="M4.5 16l4.2-3.6 2.8 2.6 2.3-2.1L19.5 16"/>');
const stacked = line('<rect x="3" y="7" width="12" height="12" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4H19a1.5 1.5 0 0 1 1.5 1.5V14a1.5 1.5 0 0 1-1.5 1.5H15"/>');
const pen = line('<path d="M4.5 19.5l2.2-6.4L16.2 3.6a1.7 1.7 0 0 1 2.4 0l1.8 1.8a1.7 1.7 0 0 1 0 2.4L10.9 17.3z"/><path d="M13.2 6.6l4.2 4.2"/>');
const note = line('<path d="M9 16.5V7.2l10-2v9"/><circle cx="7.2" cy="16.5" r="2.1"/><circle cx="17.2" cy="14.2" r="2.1"/>');
const play = svg('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7c5cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="24" height="24" rx="7" fill="url(#g)"/><path d="M9.2 7.4v9.2L17.8 12z" fill="#fff"/>');
const wave = badge('#0f766e', '<path d="M4.5 14.5c1.8-3.4 3.2-3.4 5 0s3.2 3.4 5 0 3.2-3.4 5-0" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>');
const bars = badge('#ea580c', '<path d="M7 16V8M12 16V6M17 16v-5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>');
const spark = badge('#18181b', '<path d="M12 4.5l1.3 4.7L18 10.5l-4.7 1.3L12 16.5l-1.3-4.7L6 10.5l4.7-1.3z" fill="#fff"/>');
const gem = badge('#2563eb', '<path d="M12 5.2l5.2 4.2L12 18.8 6.8 9.4z" fill="#fff"/>');
const bloom = badge('#db2777', '<circle cx="12" cy="12" r="4.2" fill="#fff"/>');
const ring = badge('#16a34a', '<circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" stroke-width="1.8"/>');
const sun = badge('#eab308', '<circle cx="12" cy="12" r="3.2" fill="#1c1917"/>');
const crown = svg('<path fill="#8a5a32" d="M4 16.5l1.8-8 4.2 4.4L12 6.2l1.9 6.7 4.3-4.4 1.8 8z"/><path d="M4.5 18.2h15" stroke="#8a5a32" stroke-width="1.6" stroke-linecap="round"/>');

const pie = 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?auto=format&fit=crop&w=1600&q=80';
const tarts = 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=1200&q=80';
const bread = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80';
const cake = 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80';

const wide = ['16-9', '9-16', '1-1'];
const clip = ['16-9', '9-16'];
const hd = ['720p', '1080p'];
const videoFlows = ['multi-reference', 'text-video', 'image-video'];
const clipFields = ['ratio', 'resolution', 'duration'];
const useLinks = [{ id: 'cases', href: '/{locale}/pricing' }, { id: 'prompts', href: '/{locale}/pricing' }];
const useActions = ['reference', 'edit'];

const config: VideoToolStructure = {
  media: [{ id: 'video', icon: film }, { id: 'image', icon: frame }],
  workflows: [
    { id: 'multi-reference', icon: stacked, mediaId: 'video' },
    { id: 'text-video', icon: pen, mediaId: 'video' },
    { id: 'image-video', icon: frame, mediaId: 'video' },
    { id: 'text-image', icon: pen, mediaId: 'image' },
    { id: 'image-edit', icon: frame, mediaId: 'image' },
    { id: 'multi-image', icon: stacked, mediaId: 'image' },
  ],
  vendors: [
    { id: 'minimax' }, { id: 'seedance' }, { id: 'wan' }, { id: 'grok' }, { id: 'kling' },
    { id: 'seedream' }, { id: 'openai' }, { id: 'nano' },
  ],
  models: [
    { id: 'minimax-h3-max', vendorId: 'minimax', icon: play, workflowIds: videoFlows, fieldIds: clipFields, options: { ratio: wide, resolution: hd }, stops: { duration: [6, 10] }, tags: [{ id: 'max', tone: 'accent' }], count: 68 },
    { id: 'minimax-h3', vendorId: 'minimax', icon: play, workflowIds: videoFlows, fieldIds: clipFields, options: { ratio: clip, resolution: hd }, stops: { duration: [6, 10] }, tags: [], count: 42 },
    { id: 'minimax-h3-lite', vendorId: 'minimax', icon: play, workflowIds: ['text-video', 'image-video'], fieldIds: clipFields, options: { ratio: ['16-9'], resolution: ['720p'] }, stops: { duration: [6] }, tags: [], count: 18 },
    { id: 'seedance-2-5', vendorId: 'seedance', icon: wave, workflowIds: videoFlows, fieldIds: clipFields, options: { ratio: wide, resolution: hd }, stops: { duration: [5, 10] }, tags: [], count: 55 },
    { id: 'seedance-2-0', vendorId: 'seedance', icon: wave, workflowIds: videoFlows, fieldIds: clipFields, options: { ratio: clip, resolution: hd }, stops: { duration: [5, 10] }, tags: [], count: 40 },
    { id: 'seedance-2-0-fast', vendorId: 'seedance', icon: wave, workflowIds: ['text-video', 'image-video'], fieldIds: clipFields, options: { ratio: ['16-9'], resolution: ['720p'] }, stops: { duration: [5] }, tags: [{ id: 'fast', tone: 'info' }], count: 16 },
    { id: 'seedance-2-0-mini', vendorId: 'seedance', icon: wave, workflowIds: ['text-video'], fieldIds: clipFields, options: { ratio: ['16-9'], resolution: ['720p'] }, stops: { duration: [5] }, tags: [], count: 12 },
    { id: 'seedance-1-5-pro', vendorId: 'seedance', icon: wave, workflowIds: ['text-video', 'image-video'], fieldIds: [...clipFields, 'seed'], options: { ratio: clip, resolution: hd }, stops: { duration: [4, 8, 12] }, tags: [], count: 36 },
    { id: 'wan-3-0', vendorId: 'wan', icon: bars, workflowIds: videoFlows, fieldIds: clipFields, options: { ratio: wide, resolution: hd }, stops: { duration: [5, 10] }, tags: [], count: 48 },
    { id: 'wan-2-7', vendorId: 'wan', icon: bars, workflowIds: ['text-video', 'image-video'], fieldIds: clipFields, options: { ratio: clip, resolution: ['720p'] }, stops: { duration: [5, 10] }, tags: [], count: 28 },
    { id: 'wan-2-6', vendorId: 'wan', icon: bars, workflowIds: ['text-video'], fieldIds: ['ratio', 'duration'], options: { ratio: ['16-9'] }, stops: { duration: [5] }, tags: [], count: 14 },
    { id: 'grok-imagine', vendorId: 'grok', icon: spark, workflowIds: ['text-video', 'image-video'], fieldIds: ['ratio', 'duration'], options: { ratio: clip }, stops: { duration: [6, 10] }, tags: [], count: 30 },
    { id: 'kling-3-0', vendorId: 'kling', icon: gem, workflowIds: videoFlows, fieldIds: clipFields, options: { ratio: wide, resolution: hd }, stops: { duration: [5, 10] }, tags: [], count: 45 },
    { id: 'seedream-5-pro', vendorId: 'seedream', icon: bloom, workflowIds: ['text-image', 'image-edit', 'multi-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4', '16-9'], size: ['2k', '4k'] }, tags: [{ id: 'pro', tone: 'accent' }], count: 24 },
    { id: 'seedream-5-lite', vendorId: 'seedream', icon: bloom, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4'], size: ['1k', '2k'] }, tags: [], count: 10 },
    { id: 'seedream-4-5', vendorId: 'seedream', icon: bloom, workflowIds: ['text-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '16-9'], size: ['1k'] }, tags: [], count: 8 },
    { id: 'gpt-image-2-5', vendorId: 'openai', icon: ring, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4', '16-9'], size: ['2k'] }, tags: [], count: 32 },
    { id: 'gpt-image-2', vendorId: 'openai', icon: ring, workflowIds: ['text-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '16-9'], size: ['1k', '2k'] }, tags: [], count: 18 },
    { id: 'nano-banana-2', vendorId: 'nano', icon: sun, workflowIds: ['text-image', 'image-edit', 'multi-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4', '16-9'], size: ['2k', '4k'] }, tags: [], count: 20 },
    { id: 'nano-banana-pro', vendorId: 'nano', icon: sun, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '16-9'], size: ['2k'] }, tags: [{ id: 'pro', tone: 'accent' }], count: 16 },
    { id: 'nano-banana', vendorId: 'nano', icon: sun, workflowIds: ['text-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1'], size: ['1k'] }, tags: [], count: 8 },
  ],
  fields: [
    { id: 'ratio', type: 'option' },
    { id: 'resolution', type: 'option' },
    { id: 'duration', type: 'number', unit: 's' },
    { id: 'seed', type: 'text', summary: false },
    { id: 'size', type: 'option' },
  ],
  references: [
    { id: 'pie', kind: 'image', url: pie },
    { id: 'tarts', kind: 'image', url: tarts },
    { id: 'bread', kind: 'image', url: bread },
    { id: 'cake', kind: 'image', url: cake },
    { id: 'clip', kind: 'video', url: pie },
    { id: 'score', kind: 'audio', url: bread },
  ],
  referenceKinds: [{ id: 'image', icon: frame }, { id: 'video', icon: film }, { id: 'audio', icon: note }],
  referenceLimits: { image: 9, video: 3, audio: 3 },
  quantity: { min: 1, max: 4, default: 1 },
  tabs: [{ id: 'use-cases' }, { id: 'history' }, { id: 'break' }],
  assets: [
    { id: 'lattice-pie', type: 'image', url: pie, tabId: 'use-cases', actionIds: useActions, links: useLinks },
    { id: 'fruit-tarts', type: 'image', url: tarts, tabId: 'use-cases', actionIds: useActions, links: useLinks },
    { id: 'seeded-loaf', type: 'image', url: bread, tabId: 'use-cases', actionIds: useActions, links: useLinks },
  ],
  defaultModelId: 'minimax-h3',
  promo: { icon: crown, href: '/{locale}/pricing' },
};

export default config;
