import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', ...(site.previewOnly ? { disallow: '/' } : { allow: '/' }) }, sitemap: `${site.url}/sitemap.xml` }; }
