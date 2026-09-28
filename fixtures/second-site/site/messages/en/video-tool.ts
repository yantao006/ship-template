export default {
  title: 'Shape a clip', description: 'Preview the request. Nothing is generated or charged yet.',
  media: { video: 'Videos', image: 'Images' },
  workflows: { multi: 'Multi Reference', 'text-video': 'Text to Video', 'image-video': 'Image to Video', 'text-image': 'Text to Image' },
  vendors: { 'clip-lab': 'Clip Lab', 'still-lab': 'Still Lab' },
  models: { 'bench-clip': 'Bench Clip', 'bench-still': 'Bench Still' },
  tags: { short: 'Short' }, fields: { ratio: 'Aspect Ratio', duration: 'Duration' },
  options: { ratio: { wide: 'Wide', square: 'Square' } }, switchStates: { on: 'On', off: 'Off' },
  references: {
    title: 'Reference Assets', titleByWorkflow: { 'image-video': 'Image' }, uploadHint: 'Click or drag to upload images',
    hintsByWorkflow: { 'image-video': 'Add a first or last frame' }, startFrame: 'Start Frame', endFrame: 'End Frame',
    library: 'Use Asset Library', closeLibrary: 'Close library', limits: { image: 'Images' }, candidates: { loaf: 'Loaf' },
  },
  prompt: { title: 'Prompt', placeholder: 'Describe what you want to create', placeholderByMedia: { image: 'Describe the image you want...' }, assist: 'Generate with AI', suggestion: 'A loaf on the counter.' },
  model: 'Model', workflowLabel: 'Workflow', parameters: 'Parameters', expand: 'Show parameters', collapse: 'Hide parameters', quantity: 'Quantity', quantityPrefix: 'x', create: 'Create',
  tabs: { 'use-cases': { label: 'Use Cases', empty: 'No use cases yet.' }, history: { label: 'History', empty: 'No generations yet.' } },
  assets: {
    'loaf-case': { title: 'Loaf clip', description: 'A loaf on the counter.', actions: { open: 'Open' }, links: { more: 'More samples' } },
    'still-case': { title: 'Loaf still', description: 'A loaf on the counter.', actions: { open: 'Open' }, links: { more: 'More samples' } },
  },
  status: { idle: 'Preview mode. Nothing will be generated or charged.', running: 'Generation in progress', done: 'Generation complete', failed: 'Generation failed' }, previewHeading: 'Request preview',
};
