import { headers } from 'next/headers';
import { accountSnapshot } from '@/lib/request-context';
import { messages, site } from '@/lib/config';
import { browserNavCopy } from '@/lib/browser-nav-copy';
import { routePath } from '@/lib/routes';
import { ledgerSourceLabel } from '@/lib/ledger';
import { workerEnv } from '@/lib/env';
import { creditHistory, type CreditLot } from '@/lib/credit-history';
import { InviteGate } from '../invites/invite-gate';
import Link from 'next/link';

export async function WorkspaceContent({ locale, section }: { locale: keyof typeof messages; section: 'dashboard' | 'credits' }) {
  const copy = messages[locale];
  const env = workerEnv();
  const requestHeaders = await headers();
  const { session, invited, credits: accountCredits } = await accountSnapshot(env, requestHeaders);
  const credits = accountCredits ?? 0;
  let lots: CreditLot[] = [];
  if (session && invited) {
    if (section === 'credits') {
      lots = await creditHistory(env.DB, session.user.id);
    }
  }
  const dateLocale = site.languages.find(language => language.code === locale)!.dateLocale;
  return <>
    <div className="mb-8 flex items-center justify-between gap-4"><div><p className="mt-0 mb-2 text-[length:var(--text-12)] text-[var(--muted)]">{copy.nav.workspace} / {copy[section].title}</p><h1 className="m-0 text-[clamp(28px,3vw,36px)] tracking-[-.035em]">{copy[section].title}</h1></div></div>
    {!session ? <div className="border border-[var(--line)] bg-[var(--surface)] px-[30px] py-[60px] text-center [border-radius:var(--radius-card-sm)]"><h2 className="mt-0 mb-3 text-[22px]">{copy.dashboard.signInTitle}</h2><p className="text-[var(--muted)]">{copy.dashboard.signInDescription}</p><Link className="text-[length:var(--text-14)] font-[650] underline-offset-4" href={routePath(locale, 'home')}>{copy.dashboard.backHome}</Link></div>
      : !invited ? <InviteGate copy={browserNavCopy(copy)} />
      : section === 'dashboard' ? <>
        <div className="flex flex-wrap items-center justify-between gap-[25px] border border-[var(--line)] bg-[var(--surface)] p-[30px] [border-radius:var(--radius-card-sm)]"><div className="grid gap-2"><span className="text-[length:var(--text-14)] leading-[1.6] text-[var(--muted)]">{copy.hero.credits}</span><strong className="text-[42px] tracking-[-.04em]">{credits}</strong></div><p className="m-0 max-w-[36ch] text-[length:var(--text-14)] leading-[1.6] text-[var(--muted)]">{copy.dashboard.summary}</p></div>
        <div className="mt-[22px] border border-[var(--line)] bg-[var(--surface)] p-[30px] [border-radius:var(--radius-card-sm)]"><h2 className="mt-0 mb-[10px] text-[19px]">{copy.dashboard.nextTitle}</h2><p className="mt-0 mb-[22px] text-[length:var(--text-14)] leading-[1.6] text-[var(--muted)]">{copy.dashboard.nextDescription}</p><Link className="text-[length:var(--text-14)] font-[650] underline-offset-4" href={routePath(locale, 'credits')}>{copy.dashboard.viewCredits}</Link> <Link className="text-[length:var(--text-14)] font-[650] underline-offset-4" href={routePath(locale, 'pricing')}>{copy.dashboard.viewPlans}</Link></div>
      </> : <section className="overflow-hidden border border-[var(--line)] bg-[var(--surface)] [border-radius:var(--radius-card-sm)]" aria-labelledby="credits-list-title">
        <div className="flex items-center justify-between gap-5 px-7 py-[25px] max-[640px]:flex-col max-[640px]:items-start max-[640px]:p-5"><div><h2 id="credits-list-title" className="mt-0 mb-[5px] text-[19px]">{copy.credits.listTitle}</h2><p className="m-0 text-[length:var(--text-13)] leading-[1.5] text-[var(--muted)]">{copy.credits.description}</p></div><span className="whitespace-nowrap text-[length:var(--text-13)] text-[var(--muted)]">{copy.credits.balance}: <strong className="text-[length:var(--text-18)] text-[var(--text)]">{credits}</strong></span></div>
        {lots.length ? <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-[length:var(--text-14)]"><thead><tr>{[copy.credits.source, copy.credits.granted, copy.credits.remaining, copy.credits.expires].map(label => <th className="whitespace-nowrap border-y border-[var(--line)] bg-[var(--bg)] px-7 py-[13px] font-[600] text-[var(--muted)] max-[640px]:px-5" scope="col" key={label}>{label}</th>)}</tr></thead><tbody>
          {lots.map(lot => <tr key={lot.id}>{[ledgerSourceLabel(locale, lot.source), lot.granted, lot.remaining, lot.expires_at ? new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeZone: 'UTC' }).format(lot.expires_at) : copy.credits.noExpiry].map((value, index) => <td className="whitespace-nowrap border-b border-[var(--line)] px-7 py-[17px] [tr:last-child_&]:border-b-0 max-[640px]:px-5" key={index}>{value}</td>)}</tr>)}
        </tbody></table></div> : <p className="m-0 border-t border-[var(--line)] px-7 py-10 text-center text-[length:var(--text-14)] text-[var(--muted)] max-[640px]:px-5">{copy.credits.empty}</p>}
      </section>}
  </>;
}
