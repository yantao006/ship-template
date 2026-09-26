export default {
  backend: 'better-auth' as const,
  email: { enabled: true, requireVerification: false, passwordReset: false },
  google: { enabled: true },
  github: { enabled: false },
  turnstile: { onSignIn: true },
};
