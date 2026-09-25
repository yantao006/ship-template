import { headers } from 'next/headers';
import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { messages } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { hasInvite } from '@/lib/invites';
import { balance } from '@/lib/ledger';
import { creditHistory, type CreditLot } from '@/lib/credit-history';
import { InviteGate } from './invite-gate';
import { WorkspaceShell } from './workspace-shell';

export async function WorkspaceContent({ locale, section }: { locale: keyof typeof messages; section: 'dashboard' | 'credits' }) {
  const copy = messages[locale];
  const env = workerEnv();
  const requestHeaders = await headers();
  const session = await createAuth(env, requestHeaders.get('host')?.split(':')[0]).api.getSession({ headers: requestHeaders });
  const invited = session ? await hasInvite(env, session.user.id) : false;
  let credits = 0;
  let lots: CreditLot[] = [];
  if (session && invited) {
    await ensureSignupCredits(env, session.user.id);
    credits = await balance(env.DB, session.user.id);
    if (section === 'credits') {
      lots = await creditHistory(env.DB, session.user.id);
    }
  }
  return <WorkspaceShell locale={locale} userName={session?.user.name} title={copy[section].title}>
    {!session ? <div className="workspace-empty"><h2>{copy.dashboard.signInTitle}</h2><p>{copy.dashboard.signInDescription}</p><a href={`/${locale}`}>{copy.dashboard.backHome}</a></div>
      : !invited ? <InviteGate copy={copy.nav} />
      : section === 'dashboard' ? <>
        <div className="workspace-summary"><div><span>{copy.hero.credits}</span><strong>{credits}</strong></div><p>{copy.dashboard.summary}</p></div>
        <div className="workspace-card"><h2>{copy.dashboard.nextTitle}</h2><p>{copy.dashboard.nextDescription}</p><a href={`/${locale}/credits`}>{copy.dashboard.viewCredits}</a> <a href={`/${locale}/pricing`}>{copy.dashboard.viewPlans}</a></div>
      </> : <section className="credits-card" aria-labelledby="credits-list-title">
        <div className="credits-card-head"><div><h2 id="credits-list-title">{copy.credits.listTitle}</h2><p>{copy.credits.description}</p></div><span className="credits-total">{copy.credits.balance}: <strong>{credits}</strong></span></div>
        {lots.length ? <div className="table-scroll"><table><thead><tr><th scope="col">{copy.credits.source}</th><th scope="col">{copy.credits.granted}</th><th scope="col">{copy.credits.remaining}</th><th scope="col">{copy.credits.expires}</th></tr></thead><tbody>
          {lots.map(lot => <tr key={lot.id}><td>{lot.source === 'signup' ? copy.credits.signup : lot.source === 'payment' ? copy.credits.payment : lot.source === 'subscription_month' ? copy.credits.subscription : lot.source}</td><td>{lot.granted}</td><td>{lot.remaining}</td><td>{lot.expires_at ? new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(lot.expires_at) : copy.credits.noExpiry}</td></tr>)}
        </tbody></table></div> : <p className="credits-empty">{copy.credits.empty}</p>}
      </section>}
  </WorkspaceShell>;
}
