import type { SiteConfig } from '../../../src/lib/config';

const languages = [
  { code: 'en', name: 'English', dateLocale: 'en-US' },
  { code: 'zh', name: '中文', dateLocale: 'zh-CN' },
] as const;

export default {
  brand: 'Second Video',
  previewOnly: true,
  apex: 'other.example',
  url: 'https://other.example',
  previewOrigin: 'https://second-video-preview.workers.dev',
  languages,
  locales: languages.map(language => language.code),
  defaultLocale: 'en',
  deploy: { worker: 'second-video', d1: 'second-video-db', r2: 'second-video-media', queue: 'second-video-jobs' },
  email: { provider: 'resend', from: 'noreply@other.example' },
  signupCredits: 30,
  account: {
    checkIn: { enabled: true, credits: 2 },
    share: { enabled: false, credits: 20, maxSubmissions: 3 },
    referral: { enabled: true, inviterCredits: 5, friendCredits: 3, claimWindowHours: 24 },
    contactEmail: 'support@other.example', feedbackEmail: 'support@other.example', commercialUseHref: '/pricing',
    shareNetworks: ['Facebook', 'X', 'WhatsApp', 'LinkedIn', 'Telegram'] as const,
    sharePostNetworks: ['Reddit', 'X', 'Facebook', 'LinkedIn'] as const,
    icons: { checkin: 'sparkles', share: 'share', invite: 'gift', contact: 'mail', feedback: 'message' },
  },
  plans: [
    { id: 'pack', billing: 'once' as const, credits: 100, amount: '9.90', currency: 'USD', description: 'Second credit pack' },
    { id: 'annual', billing: 'year' as const, credits: 80, amount: '79.00', currency: 'USD', description: 'Second annual plan' },
  ],
} satisfies SiteConfig;
