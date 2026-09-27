import { messages, site } from './config';
import { informationIds, navigationIds, routePath, routes } from './route-paths';
export { informationIds, navigationIds, routePath, routes, sitePath } from './route-paths';
export type { InformationId, NavigationId, RouteId } from './route-paths';

export function navigationLinks(locale: keyof typeof messages) {
  const copy = messages[locale].nav;
  return navigationIds.map(id => ({ id, href: routePath(locale, id), label: copy[routes[id].label], icon: routes[id].icon }));
}

export function localeFromPath(pathname: string) {
  const code = pathname.split('/')[1];
  return site.languages.find(language => language.code === code)?.code ?? site.defaultLocale;
}

export const requestLocaleHeader = 'x-site-route-locale';
export const requestSiteShellHeader = 'x-site-shell';

/** The first document response uses the public shell's default; client navigation never recomputes it. */
export function isSiteShellPath(pathname: string) {
  return pathname === '/' || site.languages.some(language => [...navigationIds, ...informationIds].some(id => routePath(language.code, id) === pathname));
}
