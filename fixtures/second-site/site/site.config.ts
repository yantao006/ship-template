export default {
  brand: 'Second Video',
  previewOnly: true,
  apex: 'other.example',
  url: 'https://other.example',
  locales: ['en', 'zh'] as const,
  defaultLocale: 'en',
  deploy: { worker: 'second-video', d1: 'second-video-db', r2: 'second-video-media', queue: 'second-video-jobs' },
  email: { provider: 'resend' as 'cloudflare' | 'resend', from: 'noreply@other.example' },
  signupCredits: 30,
  plans: [
    { id: 'pack', billing: 'once' as const, credits: 100, amount: '9.90', currency: 'USD', description: 'Second credit pack' },
    { id: 'annual', billing: 'year' as const, credits: 80, amount: '79.00', currency: 'USD', description: 'Second annual plan' },
  ],
};
