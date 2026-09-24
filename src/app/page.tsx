import { site, messages } from '@/lib/config';
export default function Home() { return <section style={{padding: '4rem'}}><h1>{site.brand}</h1><p>{messages[site.defaultLocale as keyof typeof messages].title}</p><a href={`/${site.defaultLocale}`}>Explore</a></section>; }
