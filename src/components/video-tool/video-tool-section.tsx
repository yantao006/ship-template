'use client';

import { useState } from 'react';
import { messages, videoTool } from '@/lib/config';
import { bindToolSite } from './bind-copy';
import { VideoGenerationTool } from './video-generation-tool';
import type { CreatePayload, VideoToolCopy } from './types';

export function VideoToolSection({ locale }: { locale: keyof typeof messages }) {
  const copy: VideoToolCopy = messages[locale].videoTool;
  const [payload, setPayload] = useState<CreatePayload | null>(null);
  const { config, assets } = bindToolSite(videoTool, copy, locale);
  return <section className="vt-section" aria-labelledby="vt-title">
    <div className="vt-intro"><h2 id="vt-title">{copy.title}</h2><p>{copy.description}</p></div>
    <VideoGenerationTool config={config} copy={copy} assets={assets} status={{ state: 'idle' }} onCreate={setPayload} />
    {payload && <div className="vt-payload"><h3>{copy.previewHeading}</h3><pre>{JSON.stringify(payload, null, 2)}</pre></div>}
  </section>;
}
