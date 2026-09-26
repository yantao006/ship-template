import type { AuthConfig } from '../../../src/lib/config';

export default {
  backend: 'better-auth' as const,
  email: { enabled: true, requireVerification: false, passwordReset: false },
  google: { enabled: true, oneTapEnabled: false },
  github: { enabled: false },
  invite: { required: false, adminEmails: [] as string[] },
  desktop: { schemes: [] as string[] },
  turnstile: { onSignIn: true },
} satisfies AuthConfig;
