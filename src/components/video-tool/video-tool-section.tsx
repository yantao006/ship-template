'use client';

import { useState } from 'react';
import { VideoGenerationTool } from './video-generation-tool';
import type { CreatePayload, VideoToolCopy, VideoToolStructure, ToolAsset } from './types';
import './video-tool.css';

export function VideoToolSection({ copy, config, assets }: { copy: VideoToolCopy; config: VideoToolStructure; assets: ToolAsset[] }) {
  const [payload, setPayload] = useState<CreatePayload | null>(null);
  return <section className="vt-section" aria-labelledby="vt-title">
    <div className="vt-intro"><h2 id="vt-title">{copy.title}</h2><p>{copy.description}</p></div>
    <VideoGenerationTool config={config} copy={copy} assets={assets} status={{ state: 'idle' }} onCreate={setPayload} />
    {payload && <div className="vt-payload"><h3>{copy.previewHeading}</h3><pre>{JSON.stringify(payload, null, 2)}</pre></div>}
  </section>;
}
