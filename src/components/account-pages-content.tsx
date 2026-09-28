import { Suspense } from 'react';
import { headers } from 'next/headers';
import { CreditCard, FileText } from 'lucide-react';
import { accountSnapshot } from '@/lib/request-context';
import { messages, site } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { routePath } from '@/lib/route-paths';
import { ledgerSourceLabel, paidLedgerSources } from '@/lib/ledger';
import { creditMovements } from '@/lib/account-page-history';
import { Avatar } from './blocks/account-profile';
import { InviteGate } from './invite-gate';
import { browserNavCopy } from '@/lib/browser-nav-copy';
import { AccountActions, CreditRecords } from './account-pages-controls';

export type AccountSection = 'account' | 'subscription' | 'invoices' | 'creditCenter';

export function AccountSectionHeading({ locale, section }: { locale: keyof typeof messages; section: AccountSection }) {
  const labels = messages[locale].accountPages;
  const title = section === 'creditCenter' ? labels.credits : labels[section];
  const lead = section === 'creditCenter' ? labels.creditsLead : labels[`${section}Lead`];
  return <header className="account-pages-heading"><h1>{title}</h1><p>{lead}</p></header>;
}

async function AccountSectionBody({ locale, section }: { locale: keyof typeof messages; section: AccountSection }) {
  const copy = messages[locale];
  const labels = copy.accountPages;
  const env = workerEnv();
  const { session, invited, credits } = await accountSnapshot(env, await headers());
  const entries = session && invited && section !== 'account' ? await creditMovements(env.DB, session.user.id) : [];
  const paid = entries.filter(entry => entry.source && paidLedgerSources.includes(entry.source as typeof paidLedgerSources[number]));
  const records = section === 'subscription' ? paid.filter(entry => entry.source === 'subscription_month') : paid;
  const dateLocale = site.languages.find(language => language.code === locale)!.dateLocale;
  const date = (time: number) => new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeZone: 'UTC' }).format(time);
  const sourceLabels = Object.fromEntries(Object.keys(copy.credits.sources).map(source => [source, ledgerSourceLabel(locale, source)]));
  if (!session) return <div className="account-page-empty">{copy.dashboard.signInDescription}</div>;
  if (!invited) return <InviteGate copy={browserNavCopy(copy)} />;
  return <>
    {section === 'account' && <><div className="account-page-profile"><Avatar name={session.user.name} image={session.user.image} large /><div><strong>{session.user.name}</strong><span>{session.user.email}</span></div></div><AccountActions labels={labels} email={session.user.email} locale={locale} /></>}
    {section === 'subscription' && (records.length ? <><p className="account-page-note">{labels.subscriptionNote}</p><ul className="account-page-records">{records.map(entry => <li key={entry.id}><span className="account-page-record-icon positive"><CreditCard size={17}/></span><span className="account-page-record-detail"><strong>{copy.credits.sources.subscription_month}</strong><small>{date(entry.created_at)}</small><small className="account-page-reference">{labels.paymentReference}: <code>{entry.source_id}</code></small>{entry.expires_at && <small>{labels.expires.replace('{date}', date(entry.expires_at))}</small>}</span><strong className="account-page-positive">+{entry.amount} {labels.creditsUnit}</strong></li>)}</ul></> : <div className="account-page-empty">{labels.noSubscriptions}</div>)}
    {section === 'invoices' && (records.length ? <><p className="account-page-note">{labels.invoiceNote}</p><ul className="account-page-records">{records.map(entry => <li key={entry.id}><span className="account-page-record-icon"><FileText size={17}/></span><span className="account-page-record-detail"><strong>{entry.source === 'payment' ? labels.paidCredits : copy.credits.sources.subscription_month}</strong><small>{date(entry.created_at)}</small><small className="account-page-reference">{labels.paymentReference}: <code>{entry.source_id}</code></small></span><strong>+{entry.amount} {labels.creditsUnit}</strong></li>)}</ul><a className="account-page-request" href={`mailto:${site.account.contactEmail}?subject=${encodeURIComponent(labels.requestInvoice)}`}>{labels.requestInvoice}</a></> : <div className="account-page-empty account-page-empty-invoices"><FileText size={32} aria-hidden="true"/><span>{labels.noInvoices}</span></div>)}
    {section === 'creditCenter' && <><div className="account-page-balance"><div><span>{labels.balance}</span><p><strong>{credits ?? 0}</strong> {labels.creditsUnit}</p></div><a href={routePath(locale, 'pricing')}><CreditCard size={16} aria-hidden="true"/>{labels.getCredits}</a></div><CreditRecords entries={entries} labels={labels} locale={dateLocale} sourceLabels={sourceLabels}/></>}
  </>;
}

export function AccountSectionPage({ locale, section }: { locale: keyof typeof messages; section: AccountSection }) {
  return <><AccountSectionHeading locale={locale} section={section} /><Suspense fallback={null}><AccountSectionBody locale={locale} section={section} /></Suspense></>;
}
