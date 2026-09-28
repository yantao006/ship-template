'use client';

import { useEffect } from 'react';
import confetti, { type Options } from 'canvas-confetti';

const colors = ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB', '#FF69B4'];

/** Six staggered upward cannon bursts shared by the pricing page and buy-credits dialog. */
export function PricingConfetti() {
  useEffect(() => {
    const timers: number[] = [];
    const fire = (fraction: number, options: Options) => {
      void confetti({
        ...options,
        particleCount: Math.floor(200 * fraction),
        colors,
        zIndex: 9999,
        disableForReducedMotion: true,
      });
    };

    timers.push(window.setTimeout(() => {
      fire(0.5, { spread: 80, origin: { x: 0, y: 0.6 }, startVelocity: 55 });
      fire(0.5, { spread: 80, origin: { x: 1, y: 0.6 }, startVelocity: 55 });
      timers.push(window.setTimeout(() => {
        fire(0.6, { spread: 70, origin: { x: 0.15, y: 0.65 }, startVelocity: 50 });
        fire(0.6, { spread: 70, origin: { x: 0.85, y: 0.65 }, startVelocity: 50 });
        fire(0.4, { spread: 90, origin: { x: 0.5, y: 0.55 }, startVelocity: 55 });
      }, 150));
      timers.push(window.setTimeout(() => {
        fire(0.4, { spread: 100, origin: { x: 0.5, y: 0.7 }, startVelocity: 40 });
      }, 300));
    }, 300));

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return null;
}
