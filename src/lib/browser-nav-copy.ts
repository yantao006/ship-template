import type { messages } from './config';

// Mail lives in a separate namespace and never crosses the client navigation boundary.
export function browserNavCopy(copy: (typeof messages)[keyof typeof messages]) {
  return { ...copy.nav, ...copy.signIn, ...copy.invites, ...copy.handoff };
}
