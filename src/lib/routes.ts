import { messages, site } from './config';

// All localized page paths and the ordered primary navigation live here.
export const routes = {
  home: { suffix: '', label: 'home', icon: 'home' },
  pricing: { suffix: '/pricing', label: 'pricing', icon: 'pricing' },
  dashboard: { suffix: '/dashboard', label: 'workspace', icon: 'dashboard' },
  credits: { suffix: '/credits', label: 'credits', icon: 'credits' },
  verifyEmail: { suffix: '/verify-email' },
  resetPassword: { suffix: '/reset-password' },
} as const;

export type RouteId = keyof typeof routes;
export type NavigationId = 'home' | 'pricing' | 'dashboard' | 'credits';
export const navigationIds: readonly NavigationId[] = ['home', 'pricing', 'dashboard', 'credits'];

export function routePath(locale: string, id: RouteId) {
  return `/${locale}${routes[id].suffix}`;
}

// Site-defined destinations (for example, a commercial-use page) retain their configured suffix.
export function sitePath(locale: string, suffix: string) {
  return `/${locale}${suffix}`;
}

export function navigationLinks(locale: keyof typeof messages) {
  const copy = messages[locale].nav;
  return navigationIds.map(id => ({ id, href: routePath(locale, id), label: copy[routes[id].label], icon: routes[id].icon }));
}

export function localeFromPath(pathname: string) {
  const code = pathname.split('/')[1];
  return site.languages.find(language => language.code === code)?.code ?? site.defaultLocale;
}

export const requestLocaleHeader = 'x-site-route-locale';
