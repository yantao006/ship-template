'use client';

import { useState } from 'react';

type PlanCard = { id: string; billing: 'once' | 'year'; credits: number; amount: string; currency: string; name: string; detail: string };
type Copy = { checkout: string; signInRequired: string; wait: string; failed: string; coupon: string; once: string; year: string; credits: string };

export function PricingCheckout({ locale, plans, copy }: { locale: string; plans: PlanCard[]; copy: Copy }) {
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');

  async function checkout(planId: string) {
    setPending(planId);
    setError('');
    try {
      const result = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, coupon, locale }),
      });
      if (result.status === 401) setError(copy.signInRequired);
      else if (!result.ok) setError(copy.failed);
      else {
        const data = await result.json() as { paymentUrl?: string };
        if (!data.paymentUrl) setError(copy.failed);
        else window.location.assign(data.paymentUrl);
      }
    } catch {
      setError(copy.failed);
    } finally {
      setPending('');
    }
  }

  return <div className="pricing-panel">
    <label className="pricing-coupon">{copy.coupon}<input value={coupon} onChange={event => setCoupon(event.target.value)} autoComplete="off" maxLength={64} /></label>
    <div className="plan-grid">
      {plans.map(plan => <article className="plan-card" key={plan.id}>
        <p className="plan-billing">{plan.billing === 'year' ? copy.year : copy.once}</p>
        <h2>{plan.name}</h2>
        <p className="plan-price">{plan.currency} {plan.amount}</p>
        <p className="plan-credits">{plan.credits} {copy.credits}</p>
        <p>{plan.detail}</p>
        <button className="auth-button" type="button" disabled={pending !== ''} onClick={() => checkout(plan.id)}>{pending === plan.id ? copy.wait : copy.checkout}</button>
      </article>)}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
