'use client';

import React, { type CSSProperties } from 'react';
import { SolidButton } from '@/components/ui/controls';
import { LockKeyhole } from 'lucide-react';
import type { messages } from '@/lib/config';
import { routePath } from '@/lib/route-paths';

export function CommercialLicense({ copy, brand, locale }: { copy: (typeof messages)[keyof typeof messages]['accountPages']; brand: string; locale: string }) {
  return <div className="commercial-license-page bg-[var(--bg)] px-6 pt-[103px] pb-[110px] text-[var(--text)] [--license-start:color-mix(in_srgb,var(--purchase-pink)_9%,var(--surface))] [--license-end:color-mix(in_srgb,var(--account-accent)_8%,var(--surface))] dark:[--license-start:color-mix(in_srgb,var(--purchase-pink)_12%,var(--surface))] dark:[--license-end:color-mix(in_srgb,var(--account-tone-info-box)_10%,var(--surface))] max-[600px]:px-4 max-[600px]:pt-14 max-[600px]:pb-20">
    <header className="mx-auto mt-0 mb-6 text-center"><h1 className="mt-0 mb-1 text-[36px] font-[var(--weight-heavy)] tracking-[-.035em] text-[var(--account-accent)] max-[600px]:text-[30px]">{copy.licenseTitle}</h1><p className="m-0 text-[length:var(--text-16)] text-[var(--muted)]">{copy.licenseLead}</p></header>
    <section className="mx-auto flex min-h-[382px] max-w-[1184px] flex-col items-center justify-center gap-[25px] rounded-[var(--radius-card)] bg-[linear-gradient(120deg,var(--license-start),var(--license-end))] px-6 py-12 text-center max-[600px]:min-h-[350px]" aria-labelledby="license-upgrade">
      <LockKeyhole className="text-[var(--muted)]" size={48} strokeWidth={2.2} aria-hidden="true" />
      <p className="mt-0 mb-[14px] max-w-[430px] text-[length:var(--text-18)] font-[var(--weight-medium)] leading-[1.5] text-[var(--muted)] max-[600px]:text-[length:var(--text-16)]" id="license-upgrade">{copy.licenseUpgrade.replace('{brand}', brand)}</p>
      <SolidButton type="button" className="min-h-[49px] px-12 py-[11px] text-[24px] [--control-border-width:0px] [--control-radius:var(--radius-control-md)] [--control-text:var(--purchase-text)] [--control-weight:var(--weight-heavy)] [--control-focus:var(--account-accent)]" style={{ '--control-bg': 'linear-gradient(100deg,var(--account-tone-info-box),var(--account-accent))' } as CSSProperties} onClick={() => { if (document.querySelector('.account-controls')) window.dispatchEvent(new Event('open-buy-credits')); else window.location.assign(routePath(locale, 'pricing')); }}>{copy.licenseViewPlans}</SolidButton>
    </section>
  </div>;
}
