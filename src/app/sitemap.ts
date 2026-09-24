import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
export default function sitemap(): MetadataRoute.Sitemap { return site.locales.map(locale => ({ url: `${site.url}/${locale}`, lastModified: new Date(), alternates: { languages: Object.fromEntries(site.locales.map(code => [code, `${site.url}/${code}`])) } })); }
