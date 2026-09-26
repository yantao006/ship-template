import type { messages } from '@/lib/config';
import { Header } from './Header';
import { VideoHero } from './VideoHero';
import { VideoToolSection } from './VideoToolSection';
import { VideoShowcase } from './VideoShowcase';
import { VideoFeatures } from './VideoFeatures';
import { VideoPricing } from './VideoPricing';
import { VideoFAQ } from './VideoFAQ';
import { Footer } from './Footer';

export function HomePage({ locale, userName, userEmail, credits }: { locale: keyof typeof messages; userName?: string; userEmail?: string; credits?: number }) {
  return <main>
    <Header locale={locale} userName={userName} userEmail={userEmail} credits={credits} />
    <VideoHero />
    <VideoToolSection locale={locale} />
    <VideoShowcase />
    <VideoFeatures />
    <VideoPricing />
    <VideoFAQ />
    <Footer />
  </main>;
}
