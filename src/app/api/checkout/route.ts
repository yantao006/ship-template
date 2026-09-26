import { site, auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { hasInvite } from '@/lib/invites';
import { planById, startCheckout } from '@/lib/payments';
import { browserWriteAllowed, readJson, readSession } from '@/lib/request-context';

export async function POST(request: Request) {
  const env = workerEnv();
  if (!browserWriteAllowed(request, env)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const session = await readSession(env, request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.invite.required && !await hasInvite(env, session.user.id)) return Response.json({ error: 'Invite required' }, { status: 403 });
  const parsed = await readJson<{ planId?: string; coupon?: string; locale?: string }>(request);
  if (!parsed.ok) return Response.json({ error: 'Invalid request' }, { status: 400 });
  const body = parsed.body;
  const plan = planById(body.planId ?? '');
  const locale = body.locale && (site.locales as readonly string[]).includes(body.locale) ? body.locale : site.defaultLocale;
  const coupon = body.coupon?.trim();
  if (!plan) return Response.json({ error: 'Unknown plan' }, { status: 400 });
  if (coupon && !/^[A-Za-z0-9_-]{1,64}$/.test(coupon)) return Response.json({ error: 'Invalid coupon' }, { status: 400 });
  if (!session.user.email) return Response.json({ error: 'Email required' }, { status: 400 });
  const returnUrl = `${site.url}/${locale}/pricing`;
  try {
    const created = await startCheckout(env, {
      userId: session.user.id,
      userEmail: session.user.email,
      planId: plan.id,
      billing: plan.billing,
      description: plan.description,
      amount: plan.amount,
      currency: plan.currency,
      notifyUrl: `${site.url}/api/webhooks/payment`,
      successRedirectUrl: returnUrl,
      failedRedirectUrl: returnUrl,
      cancelRedirectUrl: returnUrl,
      coupon: coupon || undefined,
    });
    return Response.json({ paymentUrl: created.paymentUrl });
  } catch {
    return Response.json({ error: 'Checkout failed' }, { status: 502 });
  }
}
