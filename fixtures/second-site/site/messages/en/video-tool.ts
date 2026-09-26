import { videoTemplatesEn } from '../video-templates-en';

export default {
    title: 'Shape a clip', description: 'Preview the request. Nothing is generated or charged yet.',
    media: { video: 'Videos', image: 'Images' },
    workflows: { 'multi-reference': 'Multi Reference', 'text-video': 'Text to Video', 'image-video': 'Image to Video', 'text-image': 'Text to Image', 'image-edit': 'Image to Image', 'multi-image': 'Layer Decomposition' },
    vendors: { minimax: 'MiniMax', seedance: 'Seedance', wan: 'Wan', grok: 'Grok', kling: 'Kling', seedream: 'Seedream', openai: 'GPT Image', 'nano-banana': 'Nano Banana' },
    modelSubtitles: { 'seedream-5-pro': 'More Freedom', 'seedream-5-lite': 'More Freedom' }, galleryHeadings: { image: 'Popular' },
    models: {
      'minimax-h3-max': 'MiniMax H3 Max', 'minimax-h3': 'MiniMax H3', 'minimax-h3-lite': 'MiniMax H3 Lite',
      'seedance-2-5': 'Seedance 2.5', 'seedance-2-0': 'Seedance 2.0', 'seedance-2-0-fast': 'Seedance 2.0 Fast', 'seedance-2-0-mini': 'Seedance 2.0 Mini', 'seedance-1-5-pro': 'Seedance 1.5 Pro',
      'wan-3-0': 'Wan 3.0', 'wan-2-7': 'Wan 2.7', 'wan-2-6': 'Wan 2.6', 'grok-imagine': 'Grok Imagine', 'kling-3-0': 'Kling 3.0',
      'seedream-5-pro': 'Seedream 5.0 Pro', 'seedream-5-lite': 'Seedream 5 Lite', 'seedream-4-5': 'Seedream 4.5',
      'gpt-image-2-5': 'GPT Image 2.5', 'gpt-image-2': 'GPT Image 2',
      'nano-banana-2': 'Nano Banana 2', 'nano-banana-pro': 'Nano Banana Pro', 'nano-banana': 'Nano Banana',
    },
    tags: { max: 'Max', fast: 'Fast', pro: 'Pro', free: 'Free every day', quality: 'Best Quality' },
    fields: { ratio: 'Aspect Ratio', resolution: 'Resolution', duration: 'Duration', generateAudio: 'Generate Audio', seed: 'Seed', size: 'Size', format: 'Output Format' },
    switchStates: { on: 'On', off: 'Off' },
    options: {
      ratio: { 'auto': 'auto', 'adaptive': 'adaptive', '21-9': '21:9', '16-9': '16:9', '9-16': '9:16', '1-1': '1:1', '3-4': '3:4', '4-3': '4:3' },
      resolution: { '720p': '720P', '1080p': '1080P', '2k': '2K' },
      size: { '1k': '1K', '2k': '2K', '4k': '4K' },
      format: { jpeg: 'JPEG', png: 'PNG' },
    },
    references: {
      title: 'Reference Assets', titleByWorkflow: { 'image-video': 'Image', 'image-edit': 'Input Images', 'multi-image': 'Input Images' }, uploadHint: 'Click or drag to upload images, videos, or audio', uploadHintByMedia: { image: 'Click or drag to upload reference images' }, hintsByWorkflow: { 'image-video': 'Add a first or last frame', 'image-edit': 'Click to upload (16 max)', 'multi-image': 'Click to upload (1 max)' }, startFrame: 'Start Frame', endFrame: 'End Frame', library: 'Use Asset Library', closeLibrary: 'Close library',
      limits: { image: 'Images', video: 'Videos', audio: 'Audio' },
      candidates: { 'lattice-pie-photo': 'Lattice pie', 'fruit-tarts-photo': 'Fruit tarts', 'seeded-loaf-photo': 'Seeded loaf', 'layer-cake-photo': 'Layer cake', 'kitchen-video': 'Kitchen video', 'kitchen-audio': 'Kitchen audio' },
    },
    prompt: { title: 'Prompt', titleByWorkflow: { 'multi-image': 'Decomposition instructions (optional)' }, placeholder: 'Describe what you want. Use @1, @2... to reference uploaded assets', placeholderByMedia: { image: 'Describe the image you want to generate...' }, placeholderByWorkflow: { 'multi-image': 'Leave blank for automatic decomposition, or specify the elements to separate...' }, maxLength: 7000, maxLengthByMedia: { image: 20000 }, assist: 'Generate with AI', suggestion: 'First-person kitchen baking vlog, slight wide lens, only hands and forearms in frame.' },
    model: 'Model', workflowLabel: 'Workflow', parameters: 'Parameters', expand: 'Show parameters', collapse: 'Hide parameters', quantity: 'Quantity', quantityPrefix: 'x', create: 'Create',
    promo: 'Annual plan: only 30 credits, save 30% →', promoDismiss: 'Dismiss annual plan offer',
    tabs: {
      'use-cases': { label: 'Use Cases', empty: 'No use cases yet.', labelByMedia: { image: 'Templates' } },
      history: { label: 'History', empty: 'No generations yet.' },
      break: { label: 'Take a break 🌴', empty: 'Take a minute. Your use cases stay on the other tab.' },
    },
    assets: {
      ...videoTemplatesEn,
      'lattice-pie': { title: 'Lattice pie', description: 'First-person kitchen baking vlog with a slight wide-angle lens and an immersive handheld feel. No face appears throughout - only hands and forearms are visible. @ Image 1', actions: { reference: 'Reference Generation', edit: 'Video Editing' }, links: { cases: 'Explore more use cases →', prompts: 'Explore 6000+ prompts →' } },
      'fruit-tarts': { title: 'Fruit tarts', description: 'Overhead pass across a tray of fruit tarts in soft daylight. No faces. @ Image 1', actions: { reference: 'Reference Generation', edit: 'Video Editing' }, links: { cases: 'Explore more use cases →', prompts: 'Explore 6000+ prompts →' } },
      'seeded-loaf': { title: 'Seeded loaf', description: 'Close handheld move over flour-dusted loaves on a dark board. @ Image 1', actions: { reference: 'Reference Generation', edit: 'Video Editing' }, links: { cases: 'Explore more use cases →', prompts: 'Explore 6000+ prompts →' } },
    },
    status: { idle: 'Preview mode. Nothing will be generated or charged.', running: 'Generation in progress', done: 'Generation complete', failed: 'Generation failed' }, previewHeading: 'Request preview',
  };
