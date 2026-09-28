import type { SiteConfig } from '../src/lib/config';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', dateLocale: 'en-US' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dateLocale: 'zh-CN' },
] as const;

export default {
  brand: 'Awesomejev Test Video',
  logo: { src: '/brand/logo.svg', alt: 'Awesomejev logo' },
  previewOnly: true,
  apex: 'awesomejev.link',
  url: 'https://awesomejev.link',
  previewOrigin: 'https://popovers-awesomejev-test.yantao006.workers.dev',
  languages,
  locales: languages.map(language => language.code),
  defaultLocale: 'en',
  deploy: { worker: 'awesomejev-test', d1: 'awesomejev-db', r2: 'awesomejev-media', queue: 'awesomejev-jobs' },
  email: { provider: 'cloudflare', from: 'noreply@awesomejev.link', brand: 'Awesomejev' },
  signupCredits: 30,
  account: {
    checkIn: { enabled: true, credits: 1 },
    share: { enabled: true, credits: 40, maxSubmissions: 3 },
    referral: { enabled: true, inviterCredits: 6, friendCredits: 4, claimWindowHours: 24 },
    // An illustrative leaderboard for this preview account only; it never enters D1 or rewards.
    leaderboardDemo: { viewerEmail: 'yantao006@gmail.com', entries: [
      { name: 'al***x', total: 47 }, { name: 'li***n', total: 28 }, { name: 'su***a', total: 23 },
    ] },
    contactEmail: 'support@awesomejev.link',
    feedbackEmail: 'support@awesomejev.link',
    commercialUseHref: '/commercial-license',
    shareNetworks: ['Facebook', 'X', 'WhatsApp', 'LinkedIn', 'Telegram'] as const,
    sharePostNetworks: ['Reddit', 'X', 'Facebook', 'LinkedIn'] as const,
    icons: { checkin: 'sparkles', share: 'share', invite: 'gift', contact: 'mail', feedback: 'message' },
  },
  // Product IDs and verified prices are supplied separately by WAFFO_PRODUCTS on this site's Worker.
  plans: [
    { id: 'lite-month', tier: 'lite', billing: 'month', credits: 600, amount: '29.90', currency: 'USD', description: 'Lite monthly' },
    { id: 'lite-year', tier: 'lite', billing: 'year', credits: 600, amount: '178.80', currency: 'USD', description: 'Lite annual' },
    { id: 'standard-month', tier: 'standard', billing: 'month', credits: 1500, amount: '49.90', currency: 'USD', description: 'Standard monthly' },
    { id: 'standard-year', tier: 'standard', billing: 'year', credits: 1500, amount: '298.80', currency: 'USD', description: 'Standard annual' },
    { id: 'pro-month', tier: 'pro', billing: 'month', credits: 3600, amount: '99.90', currency: 'USD', description: 'Pro monthly' },
    { id: 'pro-year', tier: 'pro', billing: 'year', credits: 3600, amount: '598.80', currency: 'USD', description: 'Pro annual' },
    { id: 'max-month', tier: 'max', billing: 'month', credits: 8000, amount: '199.90', currency: 'USD', description: 'Max monthly' },
    { id: 'max-year', tier: 'max', billing: 'year', credits: 8000, amount: '1198.80', currency: 'USD', description: 'Max annual' },
    { id: 'starter', billing: 'once', credits: 800, amount: '39.90', currency: 'USD', description: 'Starter credit pack' },
    { id: 'value', billing: 'once', credits: 2000, amount: '79.90', currency: 'USD', description: 'Value credit pack' },
    { id: 'pro-pack', billing: 'once', credits: 7500, amount: '199.90', currency: 'USD', description: 'Pro credit pack' },
    { id: 'bulk', billing: 'once', credits: 50000, amount: '999.90', currency: 'USD', description: 'Bulk credit pack' },
    { id: 'mega', billing: 'once', credits: 160000, amount: '2599.00', currency: 'USD', description: 'Mega credit pack' },
  ],
} satisfies SiteConfig;
