import type { VideoToolStructure } from '../src/components/video-tool/types';
import { videoToolTemplates } from './video-tool-templates.config';

const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`)}`;
const line = (body: string) => svg(`<g fill="none" stroke="#e4e4e7" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</g>`);

const film = line('<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M8 6v12M16 6v12M3.5 10h4.5M3.5 14h4.5M16 10h4.5M16 14h4.5"/>');
const frame = line('<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.3" fill="#e4e4e7" stroke="none"/><path d="M4.5 16l4.2-3.6 2.8 2.6 2.3-2.1L19.5 16"/>');
const stacked = line('<rect x="3" y="7" width="12" height="12" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4H19a1.5 1.5 0 0 1 1.5 1.5V14a1.5 1.5 0 0 1-1.5 1.5H15"/>');
const pen = line('<path d="M4.5 19.5l2.2-6.4L16.2 3.6a1.7 1.7 0 0 1 2.4 0l1.8 1.8a1.7 1.7 0 0 1 0 2.4L10.9 17.3z"/><path d="M13.2 6.6l4.2 4.2"/>');
const note = line('<path d="M9 16.5V7.2l10-2v9"/><circle cx="7.2" cy="16.5" r="2.1"/><circle cx="17.2" cy="14.2" r="2.1"/>');
const minimaxLogo = '/video-tool/minimax-logo.png';
const seedanceLogo = '/video-tool/seedance-logo.svg';
const wanLogo = '/video-tool/wan-logo.svg';
const grokLogo = '/video-tool/grok-logo.svg';
const klingLogo = '/video-tool/kling-logo.svg';
const seedreamLogo = '/video-tool/seedream-logo.svg';
const openaiLogo = '/video-tool/openai-logo.svg';
const bananaLogo = '/video-tool/banana-logo.svg';
const premiumBadgeIcon = svg('<path fill="#8a5a32" d="M4 16.5l1.8-8 4.2 4.4L12 6.2l1.9 6.7 4.3-4.4 1.8 8z"/><path d="M4.5 18.2h15" stroke="#8a5a32" stroke-width="1.6" stroke-linecap="round"/>');

const latticePieImageUrl = 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?auto=format&fit=crop&w=1600&q=80';
const fruitTartsImageUrl = 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=1200&q=80';
const seededLoafImageUrl = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80';
const layerCakeImageUrl = 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80';

const aspectWideSet = ['16-9', '9-16', '1-1'];
const aspectLandscapePortraitSet = ['16-9', '9-16'];
const resolutionSet = ['720p', '1080p'];
const videoFlows = ['multi-reference', 'text-video', 'image-video'];
const videoFields = ['ratio', 'resolution', 'duration'];
const h3RatioSet = ['adaptive', '21-9', '16-9', '4-3', '1-1', '3-4', '9-16'];
const useLinks = [{ id: 'cases', href: '/{locale}/pricing' }, { id: 'prompts', href: '/{locale}/pricing' }];
const useActions = ['reference', 'edit'];

const config: VideoToolStructure = {
  media: [{ id: 'video', icon: film }, { id: 'image', icon: frame }],
  workflows: [
    { id: 'multi-reference', icon: stacked, mediaId: 'video', referenceLimits: { image: 9, video: 3, audio: 3 } },
    { id: 'text-video', icon: pen, mediaId: 'video', referenceLimits: {} },
    { id: 'image-video', icon: frame, mediaId: 'video', referenceLimits: { image: 2 }, referencePresentation: 'frame-pair' },
    { id: 'text-image', icon: pen, mediaId: 'image', referenceLimits: {} },
    { id: 'image-edit', icon: frame, mediaId: 'image', referenceLimits: { image: 16 } },
    { id: 'multi-image', icon: stacked, mediaId: 'image', referenceLimits: { image: 1 } },
  ],
  vendors: [
    { id: 'minimax', icon: minimaxLogo }, { id: 'seedance', icon: seedanceLogo }, { id: 'wan', icon: wanLogo }, { id: 'grok', icon: grokLogo }, { id: 'kling', icon: klingLogo },
    { id: 'seedream', icon: seedreamLogo }, { id: 'openai', icon: openaiLogo }, { id: 'nano-banana', icon: bananaLogo },
  ],
  models: [
    { id: 'minimax-h3-max', vendorId: 'minimax', icon: minimaxLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: aspectWideSet, resolution: resolutionSet }, stops: { duration: [6, 10] }, tags: [{ id: 'max', tone: 'crown', icon: premiumBadgeIcon }], count: 68, costByDuration: { 6: 68, 10: 148 } },
    { id: 'minimax-h3', vendorId: 'minimax', icon: minimaxLogo, workflowIds: videoFlows, fieldIds: [...videoFields, 'generateAudio'], options: { ratio: h3RatioSet, resolution: ['720p', '2k'] }, stops: { duration: [4, 5, 6, 8, 10, 15] }, defaults: { ratio: '16-9', duration: 6, generateAudio: true }, tags: [], count: 42, costByDuration: { 4: 28, 5: 35, 6: 42, 8: 72, 10: 104, 15: 156 } },
    { id: 'minimax-h3-lite', vendorId: 'minimax', icon: minimaxLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: ['16-9'], resolution: ['720p'] }, stops: { duration: [6] }, tags: [{ id: 'free', tone: 'success' }], count: 18, costByDuration: { 6: 18 } },
    { id: 'seedance-2-5', vendorId: 'seedance', icon: seedanceLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: aspectWideSet, resolution: resolutionSet }, stops: { duration: [5, 10] }, tags: [], count: 55, costByDuration: { 5: 55, 10: 110 } },
    { id: 'seedance-2-0', vendorId: 'seedance', icon: seedanceLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: aspectLandscapePortraitSet, resolution: resolutionSet }, stops: { duration: [5, 10] }, tags: [], count: 40, costByDuration: { 5: 40, 10: 80 } },
    { id: 'seedance-2-0-fast', vendorId: 'seedance', icon: seedanceLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: ['16-9'], resolution: ['720p'] }, stops: { duration: [5] }, tags: [{ id: 'fast', tone: 'info' }], count: 16, costByDuration: { 5: 16 } },
    { id: 'seedance-2-0-mini', vendorId: 'seedance', icon: seedanceLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: ['16-9'], resolution: ['720p'] }, stops: { duration: [5] }, tags: [], count: 12, costByDuration: { 5: 12 } },
    { id: 'seedance-1-5-pro', vendorId: 'seedance', icon: seedanceLogo, workflowIds: videoFlows, fieldIds: [...videoFields, 'seed'], options: { ratio: aspectLandscapePortraitSet, resolution: resolutionSet }, stops: { duration: [4, 8, 12] }, tags: [], count: 36, costByDuration: { 4: 36, 8: 72, 12: 108 } },
    { id: 'wan-3-0', vendorId: 'wan', icon: wanLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: aspectWideSet, resolution: resolutionSet }, stops: { duration: [5, 10] }, tags: [], count: 48, costByDuration: { 5: 48, 10: 96 } },
    { id: 'wan-2-7', vendorId: 'wan', icon: wanLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: aspectLandscapePortraitSet, resolution: ['720p'] }, stops: { duration: [5, 10] }, tags: [], count: 28, costByDuration: { 5: 28, 10: 56 } },
    { id: 'wan-2-6', vendorId: 'wan', icon: wanLogo, workflowIds: videoFlows, fieldIds: ['ratio', 'duration'], options: { ratio: ['16-9'] }, stops: { duration: [5] }, tags: [], count: 14, costByDuration: { 5: 14 } },
    { id: 'grok-imagine', vendorId: 'grok', icon: grokLogo, workflowIds: videoFlows, fieldIds: ['ratio', 'duration'], options: { ratio: aspectLandscapePortraitSet }, stops: { duration: [6, 10] }, tags: [], count: 30, costByDuration: { 6: 30, 10: 60 } },
    { id: 'kling-3-0', vendorId: 'kling', icon: klingLogo, workflowIds: videoFlows, fieldIds: videoFields, options: { ratio: aspectWideSet, resolution: resolutionSet }, stops: { duration: [5, 10] }, tags: [], count: 45, costByDuration: { 5: 45, 10: 90 } },
    { id: 'seedream-5-pro', vendorId: 'seedream', icon: seedreamLogo, workflowIds: ['text-image', 'image-edit', 'multi-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4', '16-9'], size: ['2k', '4k'] }, tags: [{ id: 'pro', tone: 'accent' }], count: 24 },
    { id: 'seedream-5-lite', vendorId: 'seedream', icon: seedreamLogo, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4'], size: ['1k', '2k'] }, tags: [], count: 10 },
    { id: 'seedream-4-5', vendorId: 'seedream', icon: seedreamLogo, workflowIds: ['text-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '16-9'], size: ['1k'] }, tags: [], count: 8 },
    { id: 'gpt-image-2-5', vendorId: 'openai', icon: openaiLogo, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4', '16-9'], size: ['2k'] }, tags: [], count: 32 },
    { id: 'gpt-image-2', vendorId: 'openai', icon: openaiLogo, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size', 'format'], options: { ratio: ['auto', '1-1', '16-9', '9-16', '4-3'], size: ['1k', '2k', '4k'], format: ['jpeg', 'png'] }, tags: [{ id: 'free', tone: 'success' }, { id: 'quality', tone: 'crown', icon: premiumBadgeIcon }], count: 4 },
    { id: 'nano-banana-2', vendorId: 'nano-banana', icon: bananaLogo, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '3-4', '16-9'], size: ['2k', '4k'] }, tags: [], count: 20 },
    { id: 'nano-banana-pro', vendorId: 'nano-banana', icon: bananaLogo, workflowIds: ['text-image', 'image-edit'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1', '16-9'], size: ['2k'] }, tags: [{ id: 'pro', tone: 'accent' }], count: 16 },
    { id: 'nano-banana', vendorId: 'nano-banana', icon: bananaLogo, workflowIds: ['text-image'], fieldIds: ['ratio', 'size'], options: { ratio: ['1-1'], size: ['1k'] }, tags: [], count: 8 },
  ],
  fields: [
    { id: 'ratio', type: 'option', presentation: 'ratio', order: 3 },
    { id: 'resolution', type: 'option', presentation: 'segmented', order: 1 },
    { id: 'duration', type: 'number', unit: 's', order: 2 },
    { id: 'generateAudio', type: 'switch', summary: false, order: 4 },
    { id: 'seed', type: 'text', summary: false },
    { id: 'size', type: 'option', presentation: 'segmented' },
    { id: 'format', type: 'option', presentation: 'segmented' },
  ],
  references: [
    { id: 'lattice-pie-photo', kind: 'image', url: latticePieImageUrl },
    { id: 'fruit-tarts-photo', kind: 'image', url: fruitTartsImageUrl },
    { id: 'seeded-loaf-photo', kind: 'image', url: seededLoafImageUrl },
    { id: 'layer-cake-photo', kind: 'image', url: layerCakeImageUrl },
    { id: 'kitchen-video', kind: 'video', url: '/video-tool/video-case.mp4', thumbnail: '/video-tool/video-poster.jpg' },
    { id: 'kitchen-audio', kind: 'audio', url: '/video-tool/kitchen-audio.mp3', thumbnail: '/video-tool/video-poster.jpg' },
  ],
  referenceKinds: [{ id: 'image', icon: frame }, { id: 'video', icon: film, mediaIds: ['video'] }, { id: 'audio', icon: note, mediaIds: ['video'] }],
  referenceLimits: { image: 9, video: 3, audio: 3 },
  quantity: { min: 1, max: 4, default: 1 },
  tabs: [{ id: 'use-cases' }, { id: 'history' }, { id: 'break' }],
  assets: [
    { id: 'lattice-pie', type: 'video', url: '/video-tool/video-case.mp4', poster: '/video-tool/video-poster.jpg', thumbnail: '/video-tool/video-thumb-1.webp', tabId: 'use-cases', mediaIds: ['video'], actionIds: useActions, links: useLinks },
    { id: 'fruit-tarts', type: 'image', url: '/video-tool/video-thumb-2.webp', tabId: 'use-cases', mediaIds: ['video'], actionIds: useActions, links: useLinks },
    { id: 'seeded-loaf', type: 'image', url: '/video-tool/video-thumb-3.webp', tabId: 'use-cases', mediaIds: ['video'], actionIds: useActions, links: useLinks },
    ...videoToolTemplates.map(item => ({ id: item.id, type: 'image' as const, url: item.url, tabId: 'use-cases', mediaIds: ['image'] })),
  ],
  galleryModes: { image: 'template-grid' },
  defaultModelIdsByMedia: { image: 'gpt-image-2' },
  defaultModelIdsByWorkflow: { 'text-image': 'gpt-image-2', 'image-edit': 'gpt-image-2', 'multi-image': 'seedream-5-pro' },
  defaultFieldValuesByWorkflow: { 'text-image': { ratio: '16-9', size: '1k', format: 'jpeg' } },
  defaultWorkflowIdsByMedia: { image: 'image-edit' },
  defaultModelId: 'minimax-h3',
  promo: { icon: premiumBadgeIcon, href: '/{locale}/pricing' },
};

export default config;
