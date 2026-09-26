// Client-safe route primitives: no site configuration or localized messages.
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

export function sitePath(locale: string, suffix: string) {
  return `/${locale}${suffix}`;
}
