import site from '../../site/site.config';
import auth from '../../site/auth.config';
import theme from '../../site/theme.config';
import messages from '../../site/messages';
import database from '../../site/database.config';
import videoTool from '../../site/video-tool.config';
import { authBasePath } from './auth-path';

export { site, auth, theme, messages, database, videoTool };
export type SiteConfig = typeof site;
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
