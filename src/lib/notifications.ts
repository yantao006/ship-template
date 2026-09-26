import type { EmailProvider } from './email';
import { messages, localeFor, type SiteConfig } from './config';

// The sole mail HTML encoder covers copy, user-supplied values, and link attributes.
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const fill = (value: string, fields: Record<string, string>) => value.replace(/\{(\w+)\}/g, (match, key: string) => fields[key] ?? match);

function mailLocale(url: string) {
  try {
    const callback = new URL(url).searchParams.get('callbackURL') ?? '';
    const path = callback.startsWith('http') ? new URL(callback).pathname : callback;
    return localeFor(path.split('/').filter(Boolean)[0] ?? '');
  } catch {
    return localeFor('');
  }
}

async function send(provider: EmailProvider, site: SiteConfig, to: string, subject: string, lead: string, link?: string, action?: string, expiry?: string) {
  const text = [lead, link, expiry].filter(Boolean).join('\n\n');
  const html = [
    `<p>${escapeHtml(lead)}</p>`,
    link ? `<p><a href="${escapeHtml(link)}">${escapeHtml(action ?? link)}</a></p>` : '',
    expiry ? `<p>${escapeHtml(expiry)}</p>` : '',
  ].join('');
  return provider.sendEmail({ from: site.email.from, to, subject, text, html });
}

export function notifyVerification(provider: EmailProvider, site: SiteConfig, to: string, url: string) {
  const copy = messages[mailLocale(url)].mail;
  return send(provider, site, to, fill(copy.verifySubject, { brand: site.brand }), copy.verifyLead, url, copy.verifyAction, copy.verifyExpiry);
}

export function notifyPasswordReset(provider: EmailProvider, site: SiteConfig, to: string, url: string) {
  const copy = messages[mailLocale(url)].mail;
  return send(provider, site, to, copy.resetMailSubject, copy.resetMailLead, url, copy.resetMailAction, copy.resetMailExpiry);
}

export function notifyGenerationComplete(provider: EmailProvider, site: SiteConfig, to: string, locale = '') {
  const copy = messages[localeFor(locale)].mail;
  return send(provider, site, to, `${site.brand}: ${copy.generationSubject}`, fill(copy.generationBody, { url: site.url }));
}
export function notifyCreditsExpiring(provider: EmailProvider, site: SiteConfig, to: string, credits: number, date: string, locale = '') {
  const copy = messages[localeFor(locale)].mail;
  return send(provider, site, to, `${site.brand}: ${copy.creditsSubject}`, fill(copy.creditsBody, { credits: String(credits), date }));
}
export function notifyRenewalFailed(provider: EmailProvider, site: SiteConfig, to: string, locale = '') {
  const copy = messages[localeFor(locale)].mail;
  return send(provider, site, to, `${site.brand}: ${copy.renewalSubject}`, fill(copy.renewalBody, { url: site.url }));
}
