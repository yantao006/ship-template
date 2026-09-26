'use client';

import { Composer } from './composer';
import { Stage } from './stage';
import { useVideoToolState } from './use-video-tool-state';
import type { VideoGenerationToolProps } from './types';

export function VideoGenerationTool(props: VideoGenerationToolProps) {
  const { composer, stage } = useVideoToolState(props);
  return <div className="video-tool"><Composer {...composer} /><Stage {...stage} /></div>;
}
