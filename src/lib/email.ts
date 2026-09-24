import type { Env } from './env';
import type { SiteConfig } from './config';

export type Message = { to: string; from: string; subject: string; html: string; text: string };
export interface EmailProvider { sendEmail(message: Message): Promise<{ id: string }> }
export class FakeEmail implements EmailProvider {
  readonly sent: Message[] = [];
  async sendEmail(message: Message) { this.sent.push(message); return { id: `fake-${this.sent.length}` }; }
}
export function createEmailProvider(site: SiteConfig, env: Env, fetcher: typeof fetch = fetch): EmailProvider {
  if (site.email.provider === 'cloudflare') {
    if (!env.EMAIL) throw new Error('EMAIL binding missing');
    return { async sendEmail(message) {
      const response = await env.EMAIL!.send(message) as { messageId?: string };
      return { id: response?.messageId ?? '' };
    } };
  }
  if (site.email.provider === 'resend') {
    if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
    return { async sendEmail(message) {
      const response = await fetcher('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
      if (!response.ok) throw new Error(`Resend failed: ${response.status}`);
      const data = await response.json() as {id: string};
      return { id: data.id };
    } };
  }
  throw new Error('Unknown email provider');
}
