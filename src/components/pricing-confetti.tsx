import type { CSSProperties } from 'react';

// A brief decorative entrance, not a countdown or a limited-time offer.
export function PricingConfetti() {
  return <div className="pricing-confetti" aria-hidden="true">
    {Array.from({ length: 24 }, (_, index) => <i key={index} style={{
      left: `${index % 2 ? 96 - (index % 12) * 2.5 : (index % 12) * 2.5}%`,
      animationDelay: `${(index % 6) * 70}ms`,
      '--drift': `${(index % 2 ? -1 : 1) * (45 + (index % 7) * 23)}px`,
    } as CSSProperties} />)}
  </div>;
}
