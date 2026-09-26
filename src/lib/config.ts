import site from '../../site/site.config';
import auth from '../../site/auth.config';
import theme from '../../site/theme.config';
import messages from '../../site/messages';
import database from '../../site/database.config';
import videoTool from '../../site/video-tool.config';
import { authBasePath } from './auth-path';
import type { AccountIconName, ShareNetworkName } from './site-config-types';

export type SiteConfig = {
  brand: string;
  logo?: { src: string; alt: string };
  previewOnly: boolean;
  apex: string;
  url: string;
  previewOrigin: string;
  languages: readonly { code: string; name: string; dateLocale: string }[];
  locales: readonly string[];
  defaultLocale: string;
  deploy: { worker: string; d1: string; r2: string; queue: string };
  email: { provider: 'cloudflare' | 'resend'; from: string };
  signupCredits: number;
  account: {
    checkIn: { enabled: boolean; credits: number };
    share: { enabled: boolean; credits: number; maxSubmissions: number };
    referral: { enabled: boolean; inviterCredits: number; friendCredits: number; claimWindowHours: number };
    contactEmail: string; feedbackEmail: string; commercialUseHref: string;
    shareNetworks: readonly ShareNetworkName[];
    sharePostNetworks: readonly ShareNetworkName[];
    icons: Record<'checkin' | 'share' | 'invite' | 'contact' | 'feedback', AccountIconName>;
  };
  plans: readonly { id: string; billing: 'once' | 'year'; credits: number; amount: string; currency: string; description: string }[];
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
export type ThemeConfig = {
  light: Record<'background' | 'surface' | 'foreground' | 'muted' | 'accent' | 'border', string>;
  dark: Record<'background' | 'surface' | 'foreground' | 'muted' | 'accent' | 'border', string>;
  defaultMode: { home: 'light' | 'dark'; other: 'light' | 'dark' };
  font: string;
  account: Record<'accent' | 'accentEnd' | 'accentText', string>;
  tones: Record<'pink' | 'info' | 'success' | 'warning' | 'danger', string>;
  chrome: Record<'light' | 'dark', Record<string, string>>;
  dialog: Record<'light' | 'dark', Record<string, string>>;
  videoTool: Record<'light' | 'dark', Record<string, string>>;
  rowTones: Record<'light' | 'dark', Record<'account' | 'pink' | 'info' | 'danger', { text: string; box: string }>>;
};

export { site, auth, theme, messages, database, videoTool };
export function allowedBrowserOrigins(config: SiteConfig = site) {
  return [config.url, `https://www.${config.apex}`, config.previewOrigin];
}
export function isAllowedBrowserOrigin(origin: string | null, config: SiteConfig = site) {
  return origin !== null && allowedBrowserOrigins(config).includes(origin);
}
export function googleCallback(config: SiteConfig) { return `${config.url}${authBasePath}/callback/google`; }
export function githubCallback(config: SiteConfig) { return `${config.url}${authBasePath}/callback/github`; }
export function languageFor(value: string) { return site.languages.find(language => language.code === value) ?? site.languages.find(language => language.code === site.defaultLocale)!; }
export function localeFor(value: string): keyof typeof messages { return languageFor(value).code; }
