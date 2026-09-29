import type { messages } from '@/lib/config';
import { VideoHero } from './VideoHero';
import { VideoToolSection } from './VideoToolSection';
import { VideoShowcase } from './VideoShowcase';
import { VideoFeatures } from './VideoFeatures';
import { VideoPricing } from './VideoPricing';
import { VideoFAQ } from './VideoFAQ';

export function HomePage({ locale }: { locale: keyof typeof messages }) {
  return <div>
    <VideoHero />
    <VideoToolSection locale={locale} />
    <VideoShowcase />
    <VideoFeatures locale={locale} />
    <VideoPricing />
    <VideoFAQ />
  </div>;
}
