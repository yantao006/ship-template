'use client';

import { useState } from 'react';
import { messages, videoTool } from '@/lib/config';
import { VideoGenerationTool } from './video-generation-tool';
import type { CreatePayload, VideoToolCopy } from './types';

export function VideoToolSection({ locale }: { locale: keyof typeof messages }) {
  const copy: VideoToolCopy = messages[locale].videoTool;
  const [payload, setPayload] = useState<CreatePayload | null>(null);
  const config = { ...videoTool, promo: videoTool.promo && { ...videoTool.promo, href: videoTool.promo.href.replace('{locale}', locale) } };
  const assets = videoTool.assets.map(asset => {
    const text = copy.assets[asset.id];
    return {
      id: asset.id, type: asset.type, url: asset.url, poster: asset.poster, thumbnail: asset.thumbnail, tabId: asset.tabId,
      title: text.title, description: text.description, badge: text.badge,
      secondaryActions: asset.actionIds?.map(id => ({ id, label: text.actions?.[id] ?? '' })),
      links: asset.links?.map(link => ({ id: link.id, label: text.links?.[link.id] ?? '', href: link.href.replace('{locale}', locale) })).filter(link => link.label),
    };
  });
  return <section className="vt-section" aria-labelledby="vt-title">
    <div className="vt-intro"><h2 id="vt-title">{copy.title}</h2><p>{copy.description}</p></div>
    <VideoGenerationTool config={config} copy={copy} assets={assets} status={{ state: 'idle' }} onCreate={setPayload} />
    {payload && <div className="vt-payload"><h3>{copy.previewHeading}</h3><pre>{JSON.stringify(payload, null, 2)}</pre></div>}
  </section>;
}
