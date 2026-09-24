export default {
  brand: 'Example Video',
  apex: 'awesomejev.link',
  url: 'https://awesomejev.link',
  locales: ['en', 'zh'] as const,
  defaultLocale: 'en',
  deploy: { worker: 'example-video', d1: 'example-video-db', r2: 'example-video-media', queue: 'example-video-jobs' },
  email: { provider: 'cloudflare' as 'cloudflare' | 'resend', from: 'noreply@awesomejev.link' },
  signupCredits: 30,
};
