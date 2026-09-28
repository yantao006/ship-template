// Browser authentication operations without presentation state or view-specific error copy.
import { authClient } from '@/lib/auth-client';
import { requestJson } from '@/lib/json-request';

export type SocialProvider = 'google' | 'github';

export async function socialSignIn(provider: SocialProvider, callbackURL: string) {
  const result = await authClient.signIn.social({ provider, callbackURL });
  return !result.error;
}

export async function validateSignupInvite(value: string) {
  const code = value.trim().toUpperCase();
  const response = await requestJson('/api/invites/validate', { code });
  return { code, valid: response.ok && (await response.json() as { valid: boolean }).valid };
}

export async function redeemSignupInvite(code: string) {
  return (await requestJson('/api/invites/redeem', { code })).ok;
}

export async function sendSignInCode(email: string) {
  const result = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: 'sign-in' });
  return !result.error;
}

export async function sendPasswordReset(email: string, redirectTo: string) {
  const result = await authClient.requestPasswordReset({ email: email.trim(), redirectTo });
  return !result.error;
}

export async function sendVerification(email: string, callbackURL: string) {
  const result = await authClient.sendVerificationEmail({ email: email.trim(), callbackURL });
  return !result.error;
}
