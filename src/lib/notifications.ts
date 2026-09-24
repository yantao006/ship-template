import type { EmailProvider } from './email';
import type { SiteConfig } from './config';

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
async function send(provider: EmailProvider, site: SiteConfig, to: string, subject: string, body: string) {
  return provider.sendEmail({ from: site.email.from, to, subject: `${site.brand}: ${subject}`, text: body, html: `<p>${escape(body)}</p>` });
}
export function notifyGenerationComplete(provider: EmailProvider, site: SiteConfig, to: string) {
  return send(provider, site, to, 'Generation complete', `Your video is ready. View it at ${site.url}/history`);
}
export function notifyCreditsExpiring(provider: EmailProvider, site: SiteConfig, to: string, credits: number, date: string) {
  return send(provider, site, to, 'Credits expiring soon', `${credits} credits will expire on ${date}.`);
}
export function notifyRenewalFailed(provider: EmailProvider, site: SiteConfig, to: string) {
  return send(provider, site, to, 'Renewal failed', `Your subscription renewal failed. Review your account at ${site.url}/settings`);
}
