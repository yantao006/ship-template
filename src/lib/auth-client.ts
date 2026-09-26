import { createAuthClient } from 'better-auth/react';
import { oneTapClient, type GoogleOneTapOptions } from 'better-auth/client/plugins';
import { authBasePath } from './auth-path';

// The Google client ID is public but arrives at request time. The plugin keeps this
// options object by reference; set it before invoking the One Tap action.
const oneTapOptions: GoogleOneTapOptions = { clientId: '', autoSelect: false, cancelOnTapOutside: false, promptOptions: { maxAttempts: 1 } };
export const authClient = createAuthClient({ basePath: authBasePath, plugins: [oneTapClient(oneTapOptions)] });

export function promptGoogleOneTap(clientId: string, callbackURL: string) {
  oneTapOptions.clientId = clientId;
  return authClient.oneTap({ callbackURL });
}
