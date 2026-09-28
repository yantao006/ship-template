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
    <div className="workspace-heading"><div><p className="workspace-breadcrumb">{copy.nav.workspace} / {copy[section].title}</p><h1>{copy[section].title}</h1></div></div>
    {!session ? <div className="workspace-empty"><h2>{copy.dashboard.signInTitle}</h2><p>{copy.dashboard.signInDescription}</p><Link href={routePath(locale, 'home')}>{copy.dashboard.backHome}</Link></div>
      : !invited ? <InviteGate copy={browserNavCopy(copy)} />
      : section === 'dashboard' ? <>
        <div className="workspace-summary"><div><span>{copy.hero.credits}</span><strong>{credits}</strong></div><p>{copy.dashboard.summary}</p></div>
        <div className="workspace-card"><h2>{copy.dashboard.nextTitle}</h2><p>{copy.dashboard.nextDescription}</p><Link href={routePath(locale, 'credits')}>{copy.dashboard.viewCredits}</Link> <Link href={routePath(locale, 'pricing')}>{copy.dashboard.viewPlans}</Link></div>
      </> : <section className="credits-card" aria-labelledby="credits-list-title">
        <div className="credits-card-head"><div><h2 id="credits-list-title">{copy.credits.listTitle}</h2><p>{copy.credits.description}</p></div><span className="credits-total">{copy.credits.balance}: <strong>{credits}</strong></span></div>
        {lots.length ? <div className="table-scroll"><table><thead><tr><th scope="col">{copy.credits.source}</th><th scope="col">{copy.credits.granted}</th><th scope="col">{copy.credits.remaining}</th><th scope="col">{copy.credits.expires}</th></tr></thead><tbody>
          {lots.map(lot => <tr key={lot.id}><td>{ledgerSourceLabel(locale, lot.source)}</td><td>{lot.granted}</td><td>{lot.remaining}</td><td>{lot.expires_at ? new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeZone: 'UTC' }).format(lot.expires_at) : copy.credits.noExpiry}</td></tr>)}
        </tbody></table></div> : <p className="credits-empty">{copy.credits.empty}</p>}
      </section>}
  </>;
}
