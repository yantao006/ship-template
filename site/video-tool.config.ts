import type { VideoToolStructure } from '../src/components/video-tool/types';

const artwork = (background: string, foreground: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="${background}"/><circle cx="710" cy="210" r="180" fill="${foreground}" opacity=".18"/><path d="${shape}" fill="${foreground}" opacity=".78"/><path d="M0 520 Q480 350 960 540 V640 H0" fill="${foreground}" opacity=".25"/></svg>`)}`;

const horizon = artwork('#e9edf2', '#526a83', 'M260 430 L460 140 L730 450 Z');
const orbit = artwork('#dde6e4', '#4e746f', 'M420 160 A170 170 0 1 0 420 500 A170 170 0 1 0 420 160 Z');
const poster = artwork('#eae4dd', '#91785e', 'M240 470 L410 170 L560 360 L680 240 L850 500 Z');

const config: VideoToolStructure = {
  media: [{ id: 'video', icon: '▣' }, { id: 'image', icon: '◇' }],
  workflows: [{ id: 'text-video', icon: '✦', mediaId: 'video' }, { id: 'image-video', icon: '▧', mediaId: 'video' }, { id: 'text-image', icon: '◇', mediaId: 'image' }],
  vendors: [{ id: 'north' }, { id: 'arc' }],
  models: [
    { id: 'north-motion', vendorId: 'north', icon: '◈', workflowIds: ['text-video', 'image-video'], fieldIds: ['ratio', 'duration', 'seed', 'steady'], options: { ratio: ['wide', 'portrait'] }, stops: { duration: [4, 8, 12] }, tags: [{ id: 'featured', tone: 'accent' }], count: 12 },
    { id: 'arc-studio', vendorId: 'arc', icon: '◎', workflowIds: ['text-video', 'text-image'], fieldIds: ['ratio', 'duration', 'mood', 'guide'], options: { ratio: ['square', 'wide'], mood: ['soft', 'bold'] }, stops: { duration: [5, 10] }, tags: [{ id: 'flexible', tone: 'neutral' }], count: 8 },
  ],
  fields: [{ id: 'ratio', type: 'option' }, { id: 'duration', type: 'number' }, { id: 'seed', type: 'text' }, { id: 'steady', type: 'switch' }, { id: 'mood', type: 'option' }, { id: 'guide', type: 'upload' }],
  references: [{ id: 'horizon', kind: 'image', url: horizon }, { id: 'orbit', kind: 'image', url: orbit }, { id: 'scene', kind: 'video', url: poster }],
  referenceLimits: { image: 2, video: 1 },
  quantity: { min: 1, max: 4, default: 1 },
  tabs: [{ id: 'examples' }, { id: 'templates' }, { id: 'history' }],
  assets: [
    { id: 'first-frame', type: 'image', url: horizon, tabId: 'examples', badgeId: 'sample', actionIds: ['use'], footerHref: '/{locale}/pricing' },
    { id: 'motion-study', type: 'video', url: 'data:video/mp4;base64,', poster, tabId: 'examples', actionIds: ['use'] },
    { id: 'orbit-study', type: 'image', url: orbit, tabId: 'templates', badgeId: 'template', actionIds: ['use'] },
  ],
  promo: { icon: '✦', href: '/{locale}/pricing' },
};

export default config;
