import type { messages } from '@/lib/config';
import { Header } from './Header';
import { VideoHero } from './VideoHero';
import { VideoToolSection } from './VideoToolSection';
import { VideoShowcase } from './VideoShowcase';
import { VideoFeatures } from './VideoFeatures';
import { VideoPricing } from './VideoPricing';
import { VideoFAQ } from './VideoFAQ';
import { Footer } from './Footer';

export function HomePage({ locale }: { locale: keyof typeof messages }) {
  return <main>
    <Header />
    <VideoHero />
    <VideoToolSection locale={locale} />
    <VideoShowcase />
    <VideoFeatures />
    <VideoPricing />
    <VideoFAQ />
    <Footer />
  </main>;
}
