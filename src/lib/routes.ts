import { messages, site } from './config';
import { navigationIds, routePath, routes } from './route-paths';
export { navigationIds, routePath, routes, sitePath } from './route-paths';
export type { NavigationId, RouteId } from './route-paths';

export function navigationLinks(locale: keyof typeof messages) {
  const copy = messages[locale].nav;
  return navigationIds.map(id => ({ id, href: routePath(locale, id), label: copy[routes[id].label], icon: routes[id].icon }));
}

export function localeFromPath(pathname: string) {
  const code = pathname.split('/')[1];
  return site.languages.find(language => language.code === code)?.code ?? site.defaultLocale;
}

export const requestLocaleHeader = 'x-site-route-locale';
