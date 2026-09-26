import { messages } from './config';

export function planCopy(locale: keyof typeof messages, id: string) {
  const copy: Record<string, { name: string; detail: string }> = messages[locale].planCopy;
  if (!copy[id]) throw new Error(`Missing plan copy for ${id} (${locale})`);
  return copy[id];
}
