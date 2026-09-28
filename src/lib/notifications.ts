import type { EmailProvider } from './email';
import { messages, theme, localeFor, type SiteConfig } from './config';

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

export function notifySignInCode(provider: EmailProvider, site: SiteConfig, to: string, code: string, locale = '') {
  const copy = messages[localeFor(locale)].mail;
  const brand = site.email.brand ?? site.brand;
  const fields = { brand, code };
  const subject = fill(copy.signInCodeSubject, fields);
  const title = fill(copy.signInCodeTitle, fields);
  const lead = fill(copy.signInCodeLead, fields);
  const footnote = copy.signInCodeExpiry;
  const text = [title, lead, code, footnote].join('\n\n');
  const color = theme.mail;
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${color.canvas};font-family:Arial,Helvetica,sans-serif;color:${color.text}"><tr><td align="center" style="padding:48px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${color.panel};border:1px solid ${color.border};border-radius:18px;box-shadow:0 16px 32px ${color.shadow}"><tr><td style="padding:32px">
      <div style="height:6px;border-radius:6px;background:${color.stripeStart};background:linear-gradient(90deg,${color.stripeStart},${color.stripeMiddle},${color.stripeEnd})"></div>
      <h1 style="margin:28px 0 12px;font-size:26px;line-height:1.2;font-weight:700;color:${color.text}">${escapeHtml(title)}</h1>
      <p style="margin:0;font-size:16px;line-height:1.6;color:${color.muted}">${escapeHtml(lead)}</p>
      <div style="margin:30px 0;padding:20px 12px;border:1px dashed ${color.codeBorder};border-radius:14px;background:${color.inset};text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:38px;line-height:1.2;font-weight:700;letter-spacing:.25em;color:${color.code}">${escapeHtml(code)}</div>
      <p style="margin:0;color:${color.faint};font-size:13px;line-height:1.5">${escapeHtml(footnote)}</p>
    </td></tr></table>
  </td></tr></table>`;
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
