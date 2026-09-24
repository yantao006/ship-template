export default {
  backend: 'better-auth' as const,
  basePath: '/api/auth',
  google: { enabled: true },
  turnstile: { onSignIn: false }, // Re-enable only with a real widget and TURNSTILE_SECRET.
};
