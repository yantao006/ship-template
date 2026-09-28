import type { DatabaseConfig } from '../src/lib/site-config-types';

export default { binding: 'DB', migrationsDir: 'migrations' } satisfies DatabaseConfig;
