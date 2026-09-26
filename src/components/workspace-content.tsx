import { headers } from 'next/headers';
import { createAuth, ensureSignupCredits } from '@/lib/auth';
import { messages, site } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { hasInvite } from '@/lib/invites';
import { balance } from '@/lib/ledger';
import { workspaceData, pageNumber, dateLabel, type WorkspaceSection } from '@/lib/workspace';
import { InviteGate } from './invite-gate';
import { WorkspaceShell } from './workspace-shell';
import { WorkspaceAction } from './workspace-actions';

export async function WorkspaceContent({ locale, section, query = {} }: { locale: keyof typeof messages; section: WorkspaceSection; query?: { q?: string; page?: string; unread?: string } }) {
  const copy = messages[locale], w = copy.workspace, base = `/${locale}`;
  const env = workerEnv();
  const requestHeaders = await headers();
  const session = await createAuth(env, requestHeaders.get('host')?.split(':')[0]).api.getSession({ headers: requestHeaders });
  const invited = session ? await hasInvite(env, session.user.id) : false;
  if (session && invited) await ensureSignupCredits(env, session.user.id);
  const userId = session?.user.id;
  const date = (ms: number | null) => dateLabel(ms, locale);
  const state = (value: string) => w.states[value as keyof typeof w.states] ?? value;
  const action = (name: string, label: string, id?: string) => <WorkspaceAction action={name} label={label} id={id} errorLabel={w.error} />;
  let content: React.ReactNode;
  if (!userId) content = <div className="workspace-empty"><h2>{copy.dashboard.signInTitle}</h2><p>{copy.dashboard.signInDescription}</p><a href={base}>{copy.dashboard.backHome}</a></div>;
  else if (!invited) content = <InviteGate copy={copy.nav} />;
  else if (section === 'dashboard') {
    const data = await workspaceData(env.DB, userId, 'dashboard');
    const credits = await balance(env.DB, userId);
    const plan = site.plans.find(p => p.id === (data.subscription?.plan_id ?? data.payment?.plan_id));
    content = <><div className="workspace-metrics">
      <a href={`${base}/subscription`}><span>{w.currentPlan}</span><strong>{plan?.description ?? w.noPlan}</strong></a>
      <a href={`${base}/credits`}><span>{w.available}</span><strong>{credits}</strong></a>
      <a href={`${base}/keys`}><span>{w.keyCount}</span><strong>{data.keys}</strong></a>
      <a href={`${base}/subscription`}><span>{w.currentSubscription}</span><strong>{data.subscription ? state(data.subscription.status as string) : w.noSubscription}</strong></a>
    </div><div className="workspace-card"><h2>{copy.dashboard.nextTitle}</h2><p>{w.previewNote}</p><a href={`${base}/pricing`}>{w.purchase}</a></div></>;
  } else if (section === 'create') {
    const data = await workspaceData(env.DB,userId,'create');
    content = <section className="credits-card"><div className="credits-card-head"><div><h2>{w.task}</h2><p>{w.previewNote}</p></div></div>
      {data.rows.length ? <div className="table-scroll"><table><thead><tr><th>{w.task}</th><th>{w.cost}</th><th>{w.status}</th></tr></thead><tbody>{data.rows.map(row => <tr key={row.id}><td><code>{row.id}</code></td><td>{row.cost}</td><td>{state(row.status)}</td></tr>)}</tbody></table></div> : <p className="credits-empty">{w.empty}</p>}</section>;
  } else if (section === 'subscription') {
    const data = await workspaceData(env.DB,userId,'subscription');
    content = <><div className="workspace-stack">{data.rows.map(row => <section className="workspace-card" key={row.id}><h2>{site.plans.find(p => p.id === row.plan_id)?.description ?? row.plan_id}</h2><dl className="workspace-details"><div><dt>{w.status}</dt><dd>{state(row.status)}</dd></div><div><dt>{w.period}</dt><dd>{date(row.period_start)} - {date(row.period_end)}</dd></div><div><dt>{w.details}</dt><dd><code>{row.id}</code></dd></div></dl>{row.status === 'active' && action('subscription.cancel',w.cancel,row.id)}</section>)}
      {!data.rows.length && <div className="workspace-empty">{w.noSubscription}</div>}</div><p className="workspace-help">{w.change} · <a href={`${base}/pricing`}>{w.purchase}</a></p></>;
  } else if (section === 'payments') {
    const data = await workspaceData(env.DB,userId,'payments');
    content = <section className="credits-card">{data.rows.length ? <div className="table-scroll"><table><thead><tr><th>{w.date}</th><th>{w.plan}</th><th>{w.period}</th><th>{w.amount}</th><th>{w.status}</th><th>{w.invoice}</th></tr></thead><tbody>{data.rows.map(row => <tr key={row.id}><td>{date(row.created_at)}</td><td>{site.plans.find(p => p.id === row.plan_id)?.description ?? row.plan_id}</td><td>{row.billing === 'year' ? copy.pricing.year : copy.pricing.once}</td><td>{row.currency} {row.amount}</td><td>{state(row.status)}</td><td>{row.invoice_url?.startsWith('https://') ? <a href={row.invoice_url} target="_blank" rel="noopener noreferrer">{w.invoice}</a> : '-'}</td></tr>)}</tbody></table></div> : <p className="credits-empty">{w.empty}</p>}</section>;
  } else if (section === 'credits') {
    const page = pageNumber(query.page), search = query.q ?? '';
    const data = await workspaceData(env.DB,userId,'credits',search,page);
    const credits = await balance(env.DB,userId);
    const link = (p: number) => `${base}/credits?${new URLSearchParams({q:search,page:String(p)})}`;
    content = <><section className="credits-card"><div className="credits-card-head"><div><h2>{w.transactions}</h2><p>{w.historyDescription}</p></div><span className="credits-total">{copy.credits.balance}: <strong>{credits}</strong></span></div>
      <form className="workspace-filter" action={`${base}/credits`}><input name="q" defaultValue={search} placeholder={w.search} aria-label={w.search} /><button>{w.find}</button></form>
      {data.rows.length ? <div className="table-scroll"><table><thead><tr><th>{w.date}</th><th>{w.kind}</th><th>{w.amount}</th><th>{w.reference}</th></tr></thead><tbody>{data.rows.slice(0,20).map(row => <tr key={row.id}><td>{date(row.created_at)}</td><td>{state(row.kind)}</td><td>{row.amount > 0 ? '+' : ''}{row.amount}</td><td>{row.ref_id ?? '-'}</td></tr>)}</tbody></table></div> : <p className="credits-empty">{w.empty}</p>}
      <div className="workspace-pagination">{page > 1 && <a href={link(page-1)}>{w.previous}</a>}{data.rows.length > 20 && <a href={link(page+1)}>{w.next}</a>}</div></section>
      <section className="credits-card workspace-grants"><div className="credits-card-head"><h2>{w.grants}</h2></div>{data.lots.length ? <div className="table-scroll"><table><thead><tr><th>{copy.credits.source}</th><th>{copy.credits.granted}</th><th>{copy.credits.remaining}</th><th>{copy.credits.expires}</th></tr></thead><tbody>{data.lots.map(lot => <tr key={lot.id}><td>{lot.source === 'signup' ? copy.credits.signup : lot.source === 'payment' ? copy.credits.payment : lot.source === 'subscription_month' ? copy.credits.subscription : lot.source}</td><td>{lot.granted}</td><td>{lot.remaining}</td><td>{lot.expires_at ? date(lot.expires_at) : copy.credits.noExpiry}</td></tr>)}</tbody></table></div> : <p className="credits-empty">{copy.credits.empty}</p>}</section></>;
  } else if (section === 'keys') {
    const data = await workspaceData(env.DB,userId,'keys');
    content = <><div className="workspace-card workspace-card-first"><h2>{w.createKey}</h2><WorkspaceAction action="key.create" label={w.createKey} onCreated copyLabel={w.copy} secretHint={w.secretHint} errorLabel={w.error}><label>{w.keyName}<input name="name" maxLength={80} required /></label></WorkspaceAction></div>
      <section className="credits-card workspace-grants">{data.rows.length ? <div className="table-scroll"><table><thead><tr><th>{w.keyName}</th><th>{w.details}</th><th>{w.date}</th><th></th></tr></thead><tbody>{data.rows.map(row => <tr key={row.id}><td>{row.name}</td><td><code>{row.prefix}…</code></td><td>{date(row.created_at)}</td><td>{action('key.delete',w.deleteKey,row.id)}</td></tr>)}</tbody></table></div> : <p className="credits-empty">{w.empty}</p>}</section></>;
  } else if (section === 'notifications') {
    const unread = query.unread === '1';
    const data = await workspaceData(env.DB,userId,'notifications','',1,unread);
    content = <><div className="workspace-tabs"><a aria-current={!unread ? 'page' : undefined} href={`${base}/notifications`}>{w.all}</a><a aria-current={unread ? 'page' : undefined} href={`${base}/notifications?unread=1`}>{w.unread}</a></div><div className="workspace-stack">{data.rows.map(row => <article className="workspace-card" key={row.id}><h2>{row.title}</h2><p>{row.body}</p><small>{date(row.created_at)}</small>{!row.read_at && action('notification.read',w.markRead,row.id)}</article>)}{!data.rows.length && <p className="workspace-empty">{w.empty}</p>}</div></>;
  } else if (section === 'tickets') {
    const data = await workspaceData(env.DB,userId,'tickets');
    const tickets = new Map<string, typeof data.rows>();
    for (const row of data.rows) tickets.set(row.id,[...(tickets.get(row.id) ?? []),row]);
    content = <><section className="workspace-card workspace-card-first"><h2>{w.createTicket}</h2><WorkspaceAction action="ticket.create" label={w.createTicket} onCreated errorLabel={w.error}><label>{w.subject}<input name="subject" maxLength={150} required /></label><label>{w.message}<textarea name="body" maxLength={4000} required /></label><label>{w.image}<input type="file" name="image" accept="image/png,image/jpeg,image/webp" /></label></WorkspaceAction></section>
      <div className="workspace-stack workspace-grants">{[...tickets.entries()].map(([id,rows]) => <article className="workspace-card" key={id}><h2>{rows[0].subject} <small>{state(rows[0].status)}</small></h2>{rows.map((row,index) => <div className="workspace-message" key={`${id}-${index}`}><p>{row.body}</p>{row.attachment_key && <a href={`/api/workspace/media?key=${encodeURIComponent(row.attachment_key)}`} target="_blank" rel="noopener noreferrer">{w.image}</a>}<small>{date(row.created_at)}</small></div>)}{rows[0].status !== 'closed' && <WorkspaceAction action="ticket.reply" id={id} label={w.reply} onCreated errorLabel={w.error}><label>{w.message}<textarea name="body" maxLength={4000} required /></label><label>{w.image}<input type="file" name="image" accept="image/png,image/jpeg,image/webp" /></label></WorkspaceAction>}{rows[0].status !== 'closed' && action('ticket.close',w.closeTicket,id)}</article>)}{!tickets.size && <p className="workspace-empty">{w.empty}</p>}</div></>;
  } else {
    const data = await workspaceData(env.DB,userId,'profile');
    content = <section className="workspace-card workspace-card-first"><h2>{w.sections.profile}</h2>{data.user?.image && <img className="workspace-avatar" src={data.user.image} alt={w.avatar} />}<WorkspaceAction action="profile.update" label={w.save} errorLabel={w.error}><label>{w.name}<input name="name" defaultValue={data.user?.name ?? ''} required maxLength={100} /></label><label>{w.email}<input type="email" value={data.user?.email ?? ''} readOnly /></label><label>{w.avatar}<input type="file" name="image" accept="image/png,image/jpeg,image/webp" /></label></WorkspaceAction></section>;
  }
  return <WorkspaceShell locale={locale} userName={session?.user.name} section={section}>{content}</WorkspaceShell>;
}
