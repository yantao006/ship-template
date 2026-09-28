// Site-facing choices are checked at compile time; runtime constraints are checked by site-check.
export const accountIconNames = ['sparkles', 'share', 'gift', 'mail', 'message'] as const;
export const shareNetworkNames = ['Facebook', 'X', 'WhatsApp', 'LinkedIn', 'Telegram', 'Reddit'] as const;
export type AccountIconName = typeof accountIconNames[number];
export type ShareNetworkName = typeof shareNetworkNames[number];

export type SiteConfig = {
  brand: string;
  logo?: { src: string; alt: string };
  authMarketingImage?: string;
  previewOnly: boolean;
  apex: string;
  url: string;
  previewOrigin: string;
  languages: readonly { code: string; name: string; names?: Readonly<Record<string, string>>; flag: string; dateLocale: string }[];
  locales: readonly string[];
  defaultLocale: string;
  deploy: { worker: string; d1: string; r2: string; queue: string };
  email: { provider: 'cloudflare' | 'resend'; from: string; brand?: string };
  signupCredits: number;
  account: {
    checkIn: { enabled: boolean; credits: number };
    share: { enabled: boolean; credits: number; maxSubmissions: number };
    referral: { enabled: boolean; inviterCredits: number; friendCredits: number; claimWindowHours: number };
    leaderboardDemo?: { viewerEmail: string; entries: readonly { name: string; total: number }[] };
    contactEmail: string; feedbackEmail?: string; commercialUseHref: string;
    shareNetworks: readonly ShareNetworkName[];
    sharePostNetworks: readonly ShareNetworkName[];
    icons: Record<'checkin' | 'share' | 'invite' | 'contact' | 'feedback', AccountIconName>;
  };
  plans: readonly { id: string; tier?: string; billing: 'once' | 'month' | 'year'; credits: number; amount: string; currency: string; description: string }[];
};

export type AuthConfig = {
  backend: 'better-auth';
  email: { enabled: boolean; requireVerification: boolean; passwordReset: boolean };
  google: { enabled: boolean; oneTapEnabled: boolean };
  github: { enabled: boolean };
  invite: { required: boolean; adminEmails: readonly string[] };
  desktop: { schemes: readonly string[] };
  turnstile: { onSignIn: boolean };
};
export type DatabaseConfig = { binding: 'DB'; migrationsDir: string };
// Each site opts into any extra video-tool icon tokens for both modes together.
type PairedColors<K extends string> = Record<'light' | 'dark', Record<K, string>>;
export type VideoToolIconKeys = 'iconMuted' | 'iconImage' | 'iconFilm' | 'iconMusic' | 'iconLibrary';

export type ThemeConfig<ExtraVideoKeys extends VideoToolIconKeys = never> = {
  light: Record<'background' | 'surface' | 'foreground' | 'muted' | 'accent' | 'border', string>;
  dark: Record<'background' | 'surface' | 'foreground' | 'muted' | 'accent' | 'border', string>;
  defaultMode: { home: 'light' | 'dark'; other: 'light' | 'dark' };
  font: string;
  account: Record<'accent' | 'accentEnd' | 'accentText', string>;
  tones: Record<'pink' | 'info' | 'success' | 'warning' | 'danger', string>;
  chrome: PairedColors<'navBg' | 'navText' | 'navMuted' | 'navHover' | 'navLine' | 'languageDot' | 'popoverBg' | 'popoverEnd' | 'popoverMenuEnd' | 'popoverHeader' | 'popoverBorder' | 'popoverLine' | 'languageBg' | 'rowHover' | 'rowIcon' | 'rowIconBg' | 'rowIconLine' | 'pillBg' | 'pillHover' | 'pillLine' | 'buyBg' | 'buyText' | 'buyHover' | 'suggestionBg' | 'suggestionText' | 'suggestionMuted' | 'suggestionBorder' | 'suggestionButtonBg' | 'suggestionButtonText'>;
  dialog: PairedColors<'canvas' | 'panel' | 'inset' | 'elevated' | 'text' | 'muted' | 'subtle' | 'border' | 'accent' | 'accentSoft' | 'disabled' | 'disabledText' | 'overlay' | 'shadow' | 'grid' | 'heroGlow' | 'titleGlow' | 'inviteStart' | 'inviteMiddle' | 'inviteEnd' | 'infoPanel' | 'infoValue' | 'accentValue' | 'messageBg' | 'messageText' | 'errorBg' | 'errorText' | 'heroIconBg' | 'heroMuted' | 'socialBg' | 'socialHover' | 'shareBg'>;
  authCard: Record<'light' | 'dark', Record<'canvas' | 'panel' | 'text' | 'row' | 'line' | 'muted' | 'faint' | 'icon' | 'button' | 'buttonHover' | 'onButton' | 'focus' | 'media' | 'error', string>>;
  mail: Record<'canvas' | 'panel' | 'border' | 'text' | 'muted' | 'faint' | 'inset' | 'codeBorder' | 'code' | 'stripeStart' | 'stripeMiddle' | 'stripeEnd' | 'shadow', string>;
  videoTool: PairedColors<'canvas' | 'panel' | 'inset' | 'control' | 'raised' | 'selected' | 'selectionText' | 'text' | 'secondary' | 'muted' | 'faint' | 'border' | 'accent' | 'accentSoft' | 'accentText' | 'focus' | 'scrollbar' | 'disabled' | 'disabledText' | 'promoBg' | 'promoText' | 'onMedia' | 'mediaScrim' | 'tabSelectedBg' | 'tabSelectedText' | 'infoBg' | 'infoText' | 'successBg' | 'successText' | 'crownBg' | 'crownText' | 'neutralBg' | 'neutralText' | 'shadow' | 'rangeTrack' | ExtraVideoKeys>;
  pricing: PairedColors<'canvas' | 'panel' | 'inset' | 'text' | 'muted' | 'border' | 'accent' | 'accentText' | 'success' | 'successSoft' | 'banner' | 'bannerText' | 'bannerAccent' | 'featured' | 'button' | 'buttonText' | 'paymentBadge'>;
  purchase: PairedColors<'canvas' | 'panel' | 'line' | 'text' | 'muted' | 'accent' | 'success' | 'offer' | 'offerEnd' | 'offerBg' | 'offerText' | 'pink' | 'peach' | 'glow'>;
  rowTones: Record<'light' | 'dark', Record<'account' | 'pink' | 'info' | 'danger', { text: string; box: string }>>;
};
