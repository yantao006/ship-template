import { site, messages, localeFor } from '@/lib/config';
export function generateStaticParams() { return site.locales.map(locale => ({ locale })); }
export default async function LocalizedHome({ params }: { params: Promise<{locale: string}> }) {
  const {locale} = await params;
  const translation = messages[localeFor(locale)];
  return <section style={{padding: '4rem'}}><h1>{site.brand}</h1>{site.previewOnly && <p role="status">TEST ONLY - Login, payments, and video generation are unavailable here.</p>}<p>{translation.title}</p><span>{translation.signIn}</span></section>;
}
