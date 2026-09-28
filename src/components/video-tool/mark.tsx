import React, { type CSSProperties } from 'react';
import { Crown, Film, Image, Music, PenLine, Video, type LucideIcon } from 'lucide-react';

const lucideMarks: Record<string, LucideIcon> = {
  video: Video, film: Film, image: Image, music: Music, 'pen-line': PenLine, crown: Crown,
};

export function Mark({ icon }: { icon: string }) {
  if (icon.startsWith('lucide:')) {
    const name = icon.slice('lucide:'.length);
    const Icon = lucideMarks[name];
    if (Icon) return <span className="vt-mark"><Icon aria-hidden="true" size={16} strokeWidth={2} fill={name === 'crown' ? 'currentColor' : 'none'} /></span>;
  }
  // Data-URI SVGs cannot inherit currentColor from an <img>; masking paints them in the surrounding tone.
  if (icon.startsWith('data:image/svg+xml,')) {
    return <span className="vt-mark"><span className="vt-icon" style={{ '--vt-icon': `url("${icon}")` } as CSSProperties} aria-hidden="true" /></span>;
  }
  const image = icon.startsWith('data:') || icon.startsWith('http:') || icon.startsWith('https:') || icon.startsWith('/');
  return <span className="vt-mark">{image ? <img src={icon} alt="" /> : <span aria-hidden="true">{icon}</span>}</span>;
}
