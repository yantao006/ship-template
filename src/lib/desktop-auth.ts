import { auth } from './config';

// Never permit web URLs or executable schemes, even if accidentally allow-listed.
const unsafe = new Set(['http', 'https', 'javascript', 'data', 'file', 'blob', 'vbscript']);
export function allowedDesktopTarget(input: string | null, schemes: readonly string[] = auth.desktop.schemes): string | null {
  if (!input || input.length > 2048 || /[\u0000-\u0020\\]/.test(input)) return null;
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]+)(?:[/?#]|$)/i.exec(input);
  if (!match || unsafe.has(match[1].toLowerCase()) || !schemes.some(s => s.toLowerCase() === match[1].toLowerCase())) return null;
  try { return new URL(input).protocol.toLowerCase() === `${match[1].toLowerCase()}:` ? input : null; }
  catch { return null; }
}

export function handoffURL(target: string, token: string): string {
  const url = new URL(target);
  url.searchParams.set('token', token);
  return url.toString();
}
