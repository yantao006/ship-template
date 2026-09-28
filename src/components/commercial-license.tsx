'use client';

import React from 'react';
import { LockKeyhole } from 'lucide-react';
import type { messages } from '@/lib/config';
import { routePath } from '@/lib/route-paths';

export function CommercialLicense({ copy, brand, locale }: { copy: (typeof messages)[keyof typeof messages]['accountPages']; brand: string; locale: string }) {
  return <main className="commercial-license-page">
    <header><h1>{copy.licenseTitle}</h1><p>{copy.licenseLead}</p></header>
    <section className="commercial-license-panel" aria-labelledby="license-upgrade">
      <LockKeyhole size={48} strokeWidth={2.2} aria-hidden="true" />
      <p id="license-upgrade">{copy.licenseUpgrade.replace('{brand}', brand)}</p>
      <button type="button" onClick={() => { if (document.querySelector('.account-controls')) window.dispatchEvent(new Event('open-buy-credits')); else window.location.assign(routePath(locale, 'pricing')); }}>{copy.licenseViewPlans}</button>
    </section>
  </main>;
}
