import { VideoToolSection as ExistingVideoToolSection } from '@/components/video-tool/video-tool-section';
import type { messages } from '@/lib/config';

export function VideoToolSection({ locale }: { locale: keyof typeof messages }) {
  return <section id="video-tool-section"><ExistingVideoToolSection locale={locale} /></section>;
}
