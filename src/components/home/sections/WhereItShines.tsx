import React from 'react';
import { Clapperboard, Gamepad2, Palette, ShoppingBag } from 'lucide-react';
import { messages, site } from '@/lib/config';

const icons = [Gamepad2, Palette, ShoppingBag, Clapperboard];

export function WhereItShines({ locale }: { locale: keyof typeof messages }) {
  const copy = messages[locale].shines;

  return <div className="video-shines">
    <div className="video-shines__intro">
      <h2>{copy.title.replace('{brand}', site.brand)}</h2>
      <p>{copy.intro}</p>
    </div>
    <div className="video-shines__grid">
      {copy.items.map((item, index) => {
        const Icon = icons[index];
        return <article className="video-shines__card" key={item.title}>
          <span className="video-shines__icon" aria-hidden="true"><Icon /></span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="video-shines__tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </article>;
      })}
    </div>
  </div>;
}
