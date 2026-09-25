export default {
  backend: 'better-auth' as const,
  basePath: '/api/auth',
  email: { enabled: true, requireVerification: false, passwordReset: false },
  google: { enabled: true },
  github: { enabled: false },
  turnstile: { onSignIn: true },
};
