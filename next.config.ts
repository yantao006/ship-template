import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev(process.env.NEXT_DEV_WRANGLER_CONFIG
    ? { configPath: process.env.NEXT_DEV_WRANGLER_CONFIG }
    : undefined);
}

const config: NextConfig = { outputFileTracingRoot: process.cwd() };
export default config;
