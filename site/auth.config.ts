// OAuth credentials live only in Worker secrets, never in site config or D1.
// Enable GitHub only after configuring GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
// and registering https://awesomejev.link/api/auth/callback/github with GitHub.
export default {
  backend: 'better-auth' as const,
  basePath: '/api/auth',
  email: { enabled: true, requireVerification: true },
  google: { enabled: true, oneTapEnabled: false },
  github: { enabled: false },
  invite: { required: false, adminEmails: [] as string[] },
  desktop: { schemes: [] as string[] },
  turnstile: { onSignIn: false }, // Re-enable only with a real widget and TURNSTILE_SECRET.
};
