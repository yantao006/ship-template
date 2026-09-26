import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
import { routePath } from '@/lib/routes';
export default function sitemap(): MetadataRoute.Sitemap { return site.locales.map(locale => ({ url: `${site.url}${routePath(locale, 'home')}`, lastModified: new Date(), alternates: { languages: Object.fromEntries(site.locales.map(code => [code, `${site.url}${routePath(code, 'home')}`])) } })); }
