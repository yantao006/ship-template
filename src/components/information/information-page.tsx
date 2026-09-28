import * as React from 'react';
import { messages, site } from '@/lib/config';
import type { InformationId } from '@/lib/route-paths';

export function InformationPage({ locale, id }: { locale: keyof typeof messages; id: InformationId }) {
  const copy = messages[locale].footer;
  const page = copy.pages[id];
  return <div className="mx-auto w-full max-w-[780px] px-6 pt-14 pb-[100px]">
    <h1 className="mt-0 mb-8 text-[clamp(32px,4vw,48px)] tracking-[-.035em]">{page.title}</h1>
    {page.paragraphs.map(paragraph => <p className="mt-0 mb-[22px] max-w-[70ch] text-[length:var(--text-16)] leading-[1.75] text-[var(--muted)]" key={paragraph}>{paragraph}</p>)}
    <p className="mt-9 mb-[22px] max-w-[70ch] text-[length:var(--text-16)] leading-[1.75] text-[var(--muted)]">{copy.questions} <a className="break-words text-[var(--text)] underline-offset-4" href={`mailto:${site.account.contactEmail}`}>{site.account.contactEmail}</a>.</p>
  </div>;
}
