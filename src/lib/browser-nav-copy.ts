import type { messages } from './config';

// Mail-only strings must never cross a Server Component -> Client Component prop.
export function browserNavCopy(nav: (typeof messages)['en']['nav']) {
  const { resetMailSubject, resetMailLead, resetMailAction, resetMailExpiry, ...browserCopy } = nav;
  return browserCopy;
}
