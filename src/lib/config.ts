import site from '../../site/site.config';
import auth from '../../site/auth.config';
import theme from '../../site/theme.config';
import messages from '../../site/messages';
import database from '../../site/database.config';
import videoTool from '../../site/video-tool.config';

export { site, auth, theme, messages, database, videoTool };
export type SiteConfig = typeof site;
export function googleCallback(config: SiteConfig) { return `${config.url}${auth.basePath}/callback/google`; }
export function githubCallback(config: SiteConfig) { return `${config.url}${auth.basePath}/callback/github`; }
export function localeFor(value: string): keyof typeof messages { return value in messages ? value as keyof typeof messages : site.defaultLocale as keyof typeof messages; }
