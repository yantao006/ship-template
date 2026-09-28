'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, Image as ImageIcon, Sparkles, Video } from 'lucide-react';
import { requestJson } from '@/lib/json-request';
import type en from '@site/messages/en';
import type { Plan, AccountCopy } from './account-dialogs';
import { count, money, planDisplay, pricingFeatureLines, hasAnnualOffer } from '../pricing/plan-display';

export type PricingCopy = (typeof en)['pricing'];
type Period = Plan['billing'];

export function defaultPurchaseSelection(plans: Plan[]): Record<Period, string> {
  const packs = plans.filter(plan => plan.billing === 'once');
  return {
    month: plans.find(plan => plan.billing === 'month' && plan.tier === 'standard')?.id ?? plans.find(plan => plan.billing === 'month')?.id ?? '',
    year: plans.find(plan => plan.billing === 'year' && plan.tier === 'standard')?.id ?? plans.find(plan => plan.billing === 'year')?.id ?? '',
    once: packs[Math.floor(packs.length / 2)]?.id ?? '',
  };
}

export function BuyCreditsContent({ plans, copy, pricing, brand, locale }: { plans: Plan[]; copy: AccountCopy; pricing: PricingCopy; brand: string; locale: string }) {
  const [period, setPeriod] = useState<Period>('year');
  const [selectedByPeriod, setSelectedByPeriod] = useState<Record<Period, string>>(() => defaultPurchaseSelection(plans));
  const setSelected = (id: string) => setSelectedByPeriod(previous => ({ ...previous, [period]: id }));
  const [multiple, setMultiple] = useState(1);
  const [expanded, setExpanded] = useState<'video' | 'image' | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const visible = plans.filter(plan => plan.billing === period);
  const picked = visible.find(plan => plan.id === selectedByPeriod[period]) ?? visible[0];
  const annual = hasAnnualOffer(plans);
  const features = picked ? pricingFeatureLines(picked, period, pricing) : [];

  function changePeriod(value: Period) {
    setPeriod(value); setError('');
  }
  async function checkout() {
    if (!picked) return;
    if (!planDisplay(picked, plans, multiple).canCheckout) { setError(pricing.unavailableNote); return; }
    setPending(true); setError('');
    try {
      const response = await requestJson('/api/checkout', { planId: picked.id, locale });
      if (!response.ok) throw new Error(pricing.failed);
      const result = await response.json() as { paymentUrl?: string };
      if (!result.paymentUrl) throw new Error(pricing.failed);
      window.location.assign(result.paymentUrl);
    } catch { setError(pricing.failed); }
    finally { setPending(false); }
  }

  return <div className={`buy-credits-content${period === 'once' ? ' packs' : ''}`}>
    {annual && <div className="buy-credits-offer"><span><Sparkles size={16}/>{brand} · {pricing.save}</span><strong>50% OFF</strong><small>{pricing.yearlyHint}</small></div>}
    <div className="buy-credits-tabs" role="group" aria-label={copy.plansTitle}>{(['month', 'year', 'once'] as const).map(value => <button key={value} type="button" aria-pressed={period === value} className={period === value ? 'selected' : ''} onClick={() => changePeriod(value)}>{value === 'month' ? pricing.monthly : value === 'year' ? pricing.yearly : pricing.packs}{value === 'year' && annual && <small>-50%</small>}</button>)}</div>
    {period !== 'once' && <p className="buy-credits-cancel"><Check size={16}/>{copy.cancelAnytime}</p>}
    <div className="buy-credits-columns">
      <section className="buy-credits-included" aria-labelledby="buy-credits-included-heading"><h3 id="buy-credits-included-heading">{copy.whatsIncluded}</h3>
        {picked && period !== 'once' && <div className="buy-credits-amount"><Sparkles size={20}/><strong>{count(planDisplay(picked, plans, multiple).credits)} {pricing.creditsMonth}</strong></div>}
        <div className="buy-credits-models">{(['video', 'image'] as const).map(kind => <div key={kind}><button type="button" aria-expanded={expanded === kind} onClick={() => setExpanded(expanded === kind ? null : kind)}>{kind === 'video' ? <Video size={17}/> : <ImageIcon size={17}/>}<span>{kind === 'video' ? pricing.videoModels : pricing.imageModels}</span><ChevronDown size={16}/></button>{expanded === kind && <p>{pricing.modelNote}</p>}</div>)}</div>
        <ul>{features.map(line => <li key={line}><Check size={17}/>{line}</li>)}</ul>
      </section>
      <section className="buy-credits-options" aria-label={copy.plansTitle}>
        <div className="buy-credits-cards">{visible.map(plan => { const isPicked = picked?.id === plan.id; const { price, total, previousPrice, discount } = planDisplay(plan, plans, multiple);
          return <div key={plan.id} className={`buy-credits-card${isPicked ? ' selected' : ''}`}><button type="button" className="buy-credits-plan-choice" aria-pressed={isPicked} onClick={() => { setSelected(plan.id); setError(''); }}><span><b>{plan.name}</b>{period === 'year' && <small>{money(total)} {pricing.billedYearly}</small>}</span><span>{period === 'year' && previousPrice && <del>{money(previousPrice)}</del>}<strong>{money(price)}</strong>{period !== 'once' && <small>{pricing.perMonth}</small>}</span></button>{discount > 0 && <span className="buy-credits-discount">{discount}% OFF</span>}{plan.tier === 'standard' && <span className="buy-credits-popular"><Sparkles size={12}/>{pricing.popular}</span>}
            {plan.tier === 'max' && <div className="buy-credits-multiplier"><input type="range" min="1" max="5" value={multiple} aria-label={pricing.maxMultiplier} onChange={event => { setMultiple(Number(event.target.value)); setSelected(plan.id); setError(''); }} /><div>{[1,2,3,4,5].map(n => <button type="button" key={n} className={multiple === n ? 'selected' : ''} onClick={() => { setMultiple(n); setSelected(plan.id); setError(''); }}>{n}x</button>)}</div></div>}
          </div> })}</div>
        <button type="button" className="buy-credits-start" disabled={pending || !picked} onClick={() => void checkout()}>{pending ? pricing.wait : copy.getStarted}</button>
        {error && <p className="buy-credits-error" role="alert">{error}</p>}
        {picked && !picked.checkoutEnabled && <p className="buy-credits-unavailable">{pricing.unavailableNote}</p>}
      </section>
    </div>
  </div>;
}
