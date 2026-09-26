import type { D1Database } from '@cloudflare/workers-types';

export type WorkspaceSection = 'dashboard' | 'create' | 'subscription' | 'payments' | 'credits' | 'keys' | 'notifications' | 'tickets' | 'profile';
export const sections: WorkspaceSection[] = ['dashboard', 'create', 'subscription', 'payments', 'credits', 'keys', 'notifications', 'tickets', 'profile'];
export function pageNumber(value: string | undefined) { const n = Number(value); return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 10000) : 1; }
export function dateLabel(ms: number | null, locale: string) { return ms ? new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(ms) : '-'; }
type Results = {
  dashboard: { keys: number; subscription: { plan_id: string; status: string; period_start: number | null; period_end: number | null } | null; payment: { plan_id: string } | null };
  create: { rows: { id: string; cost: number; status: string }[] };
  subscription: { rows: { id: string; plan_id: string; status: string; period_start: number | null; period_end: number | null }[] };
  payments: { rows: { id: string; plan_id: string; billing: string; amount: string; currency: string; status: string; invoice_url: string | null; created_at: number }[] };
  credits: { rows: { id: string; kind: string; amount: number; created_at: number; ref_id: string | null }[]; lots: { id: string; source: string; granted: number; remaining: number; expires_at: number | null }[] };
  keys: { rows: { id: string; name: string; prefix: string; created_at: number }[] };
  notifications: { rows: { id: string; title: string; body: string; read_at: number | null; created_at: number }[] };
  tickets: { rows: { id: string; subject: string; status: string; created_at: number; body: string; attachment_key: string | null }[] };
  profile: { user: { name: string; email: string; image: string | null } | null };
};
export function workspaceData<S extends WorkspaceSection>(db: Pick<D1Database, 'prepare'>, userId: string, section: S, search?: string, page?: number, unread?: boolean): Promise<Results[S]>;
export async function workspaceData(db: Pick<D1Database, 'prepare'>, userId: string, section: WorkspaceSection, search = '', page = 1, unread = false) {
  const term = `%${search.slice(0, 100).replace(/[\\%_]/g, '\\$&')}%`;
  const offset = (pageNumber(String(page)) - 1) * 20;
  const list = async <T>(sql: string, ...args: (string | number)[]) => (await db.prepare(sql).bind(...args).all<T>()).results;
  switch (section) {
    case 'dashboard': return {
      keys: (await db.prepare('SELECT count(*) AS n FROM user_api_key WHERE user_id=?').bind(userId).first<{n:number}>())?.n ?? 0,
      subscription: await db.prepare('SELECT plan_id,status,period_start,period_end FROM user_subscription WHERE user_id=? ORDER BY updated_at DESC LIMIT 1').bind(userId).first<{plan_id:string;status:string;period_start:number|null;period_end:number|null}>(),
      payment: await db.prepare('SELECT plan_id FROM payment_record WHERE user_id=? ORDER BY created_at DESC LIMIT 1').bind(userId).first<{plan_id:string}>(),
    };
    case 'create': return { rows: await list<{id:string;cost:number;status:string}>( 'SELECT id,cost,status FROM video_task WHERE user_id=? ORDER BY rowid DESC LIMIT 100', userId) };
    case 'subscription': return { rows: await list<{id:string;plan_id:string;status:string;period_start:number|null;period_end:number|null}>('SELECT id,plan_id,status,period_start,period_end FROM user_subscription WHERE user_id=? ORDER BY updated_at DESC LIMIT 100', userId) };
    case 'payments': return { rows: await list<{id:string;plan_id:string;billing:string;amount:string;currency:string;status:string;invoice_url:string|null;created_at:number}>('SELECT id,plan_id,billing,amount,currency,status,invoice_url,created_at FROM payment_record WHERE user_id=? ORDER BY created_at DESC LIMIT 100', userId) };
    case 'credits': return {
      rows: await list<{id:string;kind:string;amount:number;created_at:number;ref_id:string|null}>("SELECT id,kind,amount,created_at,ref_id FROM credit_entry WHERE user_id=? AND (kind LIKE ? ESCAPE '\\' OR COALESCE(ref_id,'') LIKE ? ESCAPE '\\') ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET ?", userId, term, term, offset),
      lots: await list<{id:string;source:string;granted:number;remaining:number;expires_at:number|null}>('SELECT id,source,granted,remaining,expires_at FROM credit_lot WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT 100', userId),
    };
    case 'keys': return { rows: await list<{id:string;name:string;prefix:string;created_at:number}>('SELECT id,name,prefix,created_at FROM user_api_key WHERE user_id=? ORDER BY created_at DESC', userId) };
    case 'notifications': return { rows: await list<{id:string;title:string;body:string;read_at:number|null;created_at:number}>('SELECT id,title,body,read_at,created_at FROM user_notification WHERE user_id=? AND (?=0 OR read_at IS NULL) ORDER BY created_at DESC LIMIT 100', userId, unread ? 1 : 0) };
    case 'tickets': return { rows: await list<{id:string;subject:string;status:string;created_at:number;body:string;attachment_key:string|null}>(`SELECT t.id,t.subject,t.status,t.created_at,m.body,m.attachment_key FROM support_ticket t JOIN ticket_message m ON m.ticket_id=t.id WHERE t.user_id=? ORDER BY t.updated_at DESC,m.created_at ASC LIMIT 200`, userId) };
    case 'profile': return { user: await db.prepare('SELECT name,email,image FROM user WHERE id=?').bind(userId).first<{name:string;email:string;image:string|null}>() };
  }
}
