export default {
  backend: 'better-auth' as const,
  basePath: '/api/auth',
  email: { enabled: true },
  google: { enabled: true },
  github: { enabled: false },
  turnstile: { onSignIn: true },
};
