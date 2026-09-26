import type { AuthConfig } from '../src/lib/config';

// OAuth credentials live only in Worker secrets, never in site config or D1.
// Enable GitHub only after configuring GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
// and registering https://awesomejev.link/api/auth/callback/github with GitHub.
export default {
  backend: 'better-auth' as const,
  email: { enabled: true as boolean, requireVerification: true as boolean, passwordReset: true as boolean },
  google: { enabled: true as boolean, oneTapEnabled: false as boolean },
  github: { enabled: false as boolean },
  invite: { required: false as boolean, adminEmails: [] as string[] },
  desktop: { schemes: [] as string[] },
  turnstile: { onSignIn: false as boolean }, // Re-enable only with a real widget and TURNSTILE_SECRET.
} satisfies AuthConfig;
