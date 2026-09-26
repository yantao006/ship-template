import type { CSSProperties } from 'react';

export function Mark({ icon }: { icon: string }) {
  // Data-URI SVGs cannot inherit currentColor from an <img>; masking paints them in the surrounding tone.
  if (icon.startsWith('data:image/svg+xml,')) {
    return <span className="vt-mark"><span className="vt-icon" style={{ '--vt-icon': `url("${icon}")` } as CSSProperties} aria-hidden="true" /></span>;
  }
  const image = icon.startsWith('data:') || icon.startsWith('http:') || icon.startsWith('https:') || icon.startsWith('/');
  return <span className="vt-mark">{image ? <img src={icon} alt="" /> : <span aria-hidden="true">{icon}</span>}</span>;
}
