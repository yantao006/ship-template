export default {
  brand: 'Awesomejev Test Video',
  previewOnly: true,
  apex: 'awesomejev.link',
  url: 'https://awesomejev.link',
  locales: ['en', 'zh'] as const,
  defaultLocale: 'en',
  deploy: { worker: 'awesomejev-test', d1: 'awesomejev-db', r2: 'awesomejev-media', queue: 'awesomejev-jobs' },
  email: { provider: 'cloudflare' as 'cloudflare' | 'resend', from: 'noreply@awesomejev.link' },
  signupCredits: 30,
};
