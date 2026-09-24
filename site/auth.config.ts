export default {
  backend: 'better-auth' as const,
  basePath: '/api/auth',
  google: { enabled: true },
  turnstile: { onSignIn: true },
};
