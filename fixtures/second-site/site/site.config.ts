export default {
  brand: 'Second Video',
  apex: 'other.example',
  url: 'https://other.example',
  locales: ['en', 'zh'] as const,
  defaultLocale: 'en',
  deploy: { worker: 'second-video', d1: 'second-video-db', r2: 'second-video-media', queue: 'second-video-jobs' },
  email: { provider: 'resend' as 'cloudflare' | 'resend', from: 'noreply@other.example' },
  signupCredits: 30,
};
