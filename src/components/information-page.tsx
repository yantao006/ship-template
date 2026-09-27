import * as React from 'react';
import { messages, site } from '@/lib/config';
import type { InformationId } from '@/lib/route-paths';

export function InformationPage({ locale, id }: { locale: keyof typeof messages; id: InformationId }) {
  const copy = messages[locale].footer;
  const page = copy.pages[id];
  return <main className="information-page">
    <h1>{page.title}</h1>
    {page.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <p className="information-contact">{copy.questions} <a href={`mailto:${site.account.contactEmail}`}>{site.account.contactEmail}</a>.</p>
  </main>;
}
