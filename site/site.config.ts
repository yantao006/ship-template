export default {
  brand: 'Awesomejev Test Video',
  logo: undefined as { src: string; alt: string } | undefined,
  previewOnly: true,
  apex: 'awesomejev.link',
  url: 'https://awesomejev.link',
  locales: ['en', 'zh'] as const,
  defaultLocale: 'en',
  deploy: { worker: 'awesomejev-test', d1: 'awesomejev-db', r2: 'awesomejev-media', queue: 'awesomejev-jobs' },
  email: { provider: 'cloudflare' as 'cloudflare' | 'resend', from: 'noreply@awesomejev.link' },
  signupCredits: 30,
  plans: [
    { id: 'pack', billing: 'once' as const, credits: 100, amount: '9.90', currency: 'USD', description: 'Awesomejev credit pack' },
    { id: 'annual', billing: 'year' as const, credits: 80, amount: '79.00', currency: 'USD', description: 'Awesomejev annual plan' },
  ],
};
