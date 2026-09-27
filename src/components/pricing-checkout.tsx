'use client';

import { useState } from 'react';
import { Check, ChevronDown, Image as ImageIcon, ShieldCheck, Sparkles, Video, X } from 'lucide-react';
import { requestJson } from '@/lib/json-request';
import { PricingConfetti } from './pricing-confetti';

type Plan = { id: string; tier?: string; billing: 'month' | 'year' | 'once'; credits: number; amount: string; currency: string; name: string; checkoutEnabled: boolean };
type Mode = Plan['billing'];
type PlanFeature = string | { yearly: string };
type Model = { id: string; name: string; icon: string; kind: 'video' | 'image'; cost: number | null };
type Copy = {
  title: string; lead: string; monthly: string; yearly: string; packs: string; save: string;
  monthlyHint: string; yearlyHint: string; packHint: string; popular: string; off: string; perMonth: string; perCredit: string; billedYearly: string;
  creditsMonth: string; credits: string; oneTime: string; maxMultiplier: string; maxBase: string; maxTotal: string;
  videoModels: string; imageModels: string; modelCatalog: string; modelNote: string; fromCredits: string; previewOnly: string;
  paymentTitle: string; paymentNote: string; checkout: string; unavailable: string; unavailableNote: string;
  signInRequired: string; wait: string; failed: string;
  planFeatures: Record<string, PlanFeature[]>; packFeatures: string[];
};

const methods = ['mastercard', 'visa', 'amex', 'apple-pay', 'google-pay', 'discover', 'jcb'] as const;
const methodNames = ['Mastercard', 'Visa', 'American Express', 'Apple Pay', 'Google Pay', 'Discover', 'JCB'];
const money = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
const count = (value: number) => value.toLocaleString('en-US');

export function pricingFeatureLines(plan: Pick<Plan, 'id' | 'tier' | 'credits'>, mode: Mode, copy: Pick<Copy, 'planFeatures' | 'packFeatures'>) {
  if (mode === 'once') return copy.packFeatures.map(line => line.replace('{count}', count(plan.credits)));
  const features = copy.planFeatures[plan.tier ?? plan.id];
  if (!features) throw new Error(`Missing pricing features for ${plan.id}`);
  return features.flatMap(feature => typeof feature === 'string' ? [feature] : mode === 'year' ? [feature.yearly] : []);
}

function ModelDropdown({ title, models }: { title: string; models: Model[] }) {
  const [open, setOpen] = useState(false);
  return <div className="pricing-model-dropdown">
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{models[0]?.kind === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}<strong>{title}</strong><ChevronDown size={16} className={open ? 'open' : ''} /></button>
    {open && <div className="pricing-model-chips">{models.map(model => <span key={model.id}><img src={model.icon} alt="" width={18} height={18} />{model.name}</span>)}</div>}
  </div>;
}

export function PricingCheckout({ locale, plans, models, brand, copy }: { locale: string; plans: Plan[]; models: Model[]; brand: string; copy: Copy }) {
  const [mode, setMode] = useState<Mode>('year');
  const [banner, setBanner] = useState(true);
  const [multiple, setMultiple] = useState(1);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');
  const video = models.filter(model => model.kind === 'video');
  const image = models.filter(model => model.kind === 'image');
  const visible = plans.filter(plan => plan.billing === mode);
  const actionable = visible.some(plan => plan.checkoutEnabled && (!plan.tier || plan.tier !== 'max' || multiple === 1));

  async function checkout(plan: Plan) {
    if (!plan.checkoutEnabled || (plan.tier === 'max' && multiple !== 1)) return;
    setPending(plan.id);
    setError('');
    try {
      const result = await requestJson('/api/checkout', { planId: plan.id, locale });
      if (result.status === 401) setError(copy.signInRequired);
      else if (!result.ok) setError(copy.failed);
      else {
        const data = await result.json() as { paymentUrl?: string };
        if (!data.paymentUrl) setError(copy.failed);
        else window.location.assign(data.paymentUrl);
      }
    } catch { setError(copy.failed); }
    finally { setPending(''); }
  }

  return <>
    <PricingConfetti />
    {banner && <div className="pricing-banner"><Sparkles size={18} /><span>{brand} · {copy.save}</span><button type="button" onClick={() => { setMode('year'); document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' }); }}>{copy.yearly}</button><button type="button" className="pricing-banner-close" aria-label="Close" onClick={() => setBanner(false)}><X size={16} /></button></div>}
    <main className="pricing-page">
      <div className="pricing-inner">
        <div className="pricing-launch"><strong>{copy.save}</strong><span>{brand} · {copy.yearlyHint}</span></div>
        <h1 id="pricing-title">{copy.title}</h1><p className="pricing-lead">{copy.lead}</p>
        <div id="pricing-plans" className="pricing-tabs-wrap"><div className="pricing-tabs" role="group" aria-label={copy.title}>
          {(['month', 'year', 'once'] as const).map(option => <button type="button" aria-pressed={mode === option} className={mode === option ? 'selected' : ''} key={option} onClick={() => { setMode(option); setError(''); }}>{option === 'month' ? copy.monthly : option === 'year' ? copy.yearly : copy.packs}{option === 'year' && <small>{copy.save}</small>}</button>)}
        </div><p><Check size={16} />{mode === 'year' ? copy.yearlyHint : mode === 'month' ? copy.monthlyHint : copy.packHint}</p></div>
        {!actionable && <p className="pricing-availability" role="status">{copy.unavailableNote}</p>}
        <div className={`pricing-card-grid ${mode === 'once' ? 'packs' : 'plans'}`} key={mode}>
          {visible.map(plan => {
            const isMax = plan.tier === 'max';
            const factor = isMax ? multiple : 1;
            const yearly = mode === 'year';
            const price = Number(plan.amount) * factor / (yearly ? 12 : 1);
            const monthlyPlan = plans.find(item => item.tier === plan.tier && item.billing === 'month');
            const savings = yearly && monthlyPlan ? 1 - price / (Number(monthlyPlan.amount) * factor) : 0;
            const canPay = plan.checkoutEnabled && factor === 1;
            return <article className={`pricing-card ${plan.tier === 'standard' ? 'featured' : ''}`} key={plan.id}>
              {plan.tier === 'standard' && <span className="pricing-popular"><Sparkles size={13} />{copy.popular}</span>}
              <div className="pricing-card-title"><h2>{plan.name}</h2>{yearly && <span className="pricing-discount">{Math.round(savings * 100)}% {copy.off}</span>}</div>
              <p className="pricing-rate">{money(price / (plan.credits * factor))} {copy.perCredit}</p>
              <div className="pricing-amount">{yearly && monthlyPlan && <del>{money(Number(monthlyPlan.amount) * factor)}</del>}<strong>{money(price)}</strong>{mode !== 'once' && <span>{copy.perMonth}</span>}</div>
              {yearly && <p className="pricing-billed">{money(Number(plan.amount) * factor)} {copy.billedYearly}</p>}
              {mode === 'once' && <p className="pricing-billed">{copy.oneTime}</p>}
              {isMax && <div className="pricing-multiplier"><label htmlFor="pricing-max-range">{copy.maxMultiplier} <b>{multiple}×</b></label><input id="pricing-max-range" type="range" min="1" max="5" step="1" value={multiple} onChange={event => setMultiple(Number(event.target.value))} /><div className="pricing-multiplier-labels">{[1, 2, 3, 4, 5].map(value => <button type="button" aria-pressed={multiple === value} key={value} onClick={() => setMultiple(value)}>{value}×</button>)}</div><p>{copy.maxBase}: {count(plan.credits)} · {copy.maxTotal}: {count(plan.credits * multiple)} {copy.creditsMonth}</p></div>}
              <button type="button" className="pricing-pay" disabled={!canPay || !!pending} onClick={() => checkout(plan)}>{pending === plan.id ? copy.wait : canPay ? copy.checkout : copy.unavailable}</button>
              <div className="pricing-credits"><Sparkles size={18} /><strong>{count(plan.credits * factor)} {mode === 'once' ? copy.credits : copy.creditsMonth}</strong></div>
              {mode !== 'once' && <div className="pricing-models"><ModelDropdown title={copy.videoModels} models={video} /><ModelDropdown title={copy.imageModels} models={image} /></div>}
              <ul className="pricing-features">{pricingFeatureLines(plan, mode, copy).map(line => <li key={line}><Check size={16} />{line}</li>)}</ul>
            </article>;
          })}
        </div>
        <section className="pricing-catalog" aria-labelledby="pricing-catalog-heading"><h2 id="pricing-catalog-heading">{copy.modelCatalog}</h2><div className="pricing-catalog-grid">{([['video', video, copy.videoModels], ['image', image, copy.imageModels]] as const).map(([kind, entries, title]) => <div key={kind}><h3>{kind === 'video' ? <Video size={19} /> : <ImageIcon size={19} />}{title}</h3><div className="pricing-catalog-list">{entries.map(model => <div className="pricing-catalog-row" key={model.id}><span><img src={model.icon} alt="" width={22} height={22} />{model.name}</span><span>{model.cost === null ? copy.previewOnly : copy.fromCredits.replace('{count}', String(model.cost))}</span></div>)}</div></div>)}</div><p>{copy.modelNote}</p></section>
        <section className="pricing-payment" aria-labelledby="pricing-payment-heading"><h2 id="pricing-payment-heading"><ShieldCheck size={22} />{copy.paymentTitle}</h2><ul>{methods.map((method, index) => <li key={method}><img src={`/pricing/${method}.svg`} alt={methodNames[index]} width={68} height={38} /></li>)}<li className="pricing-link-mark">Link</li></ul><p>{copy.paymentNote}</p></section>
        {error && <p className="pricing-error" role="alert">{error}</p>}
      </div>
    </main>
  </>;
}
