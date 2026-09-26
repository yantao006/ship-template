import { VideoToolSection as ExistingVideoToolSection } from '@/components/video-tool/video-tool-section';
import { messages, videoTool } from '@/lib/config';
import { bindToolSite } from '@/components/video-tool/bind-copy';

export function VideoToolSection({ locale }: { locale: keyof typeof messages }) {
  const copy = messages[locale].videoTool;
  const { config, assets } = bindToolSite(videoTool, copy, locale);
  return <section id="video-tool-section"><ExistingVideoToolSection copy={copy} config={config} assets={assets} /></section>;
}
