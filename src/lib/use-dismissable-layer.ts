'use client';

import { useEffect, useRef, type RefObject } from 'react';

type Options = {
  active: boolean;
  area: RefObject<HTMLElement | null>;
  trigger?: RefObject<HTMLElement | null>;
  onClose: () => void;
  trapFocus?: boolean;
  // For overlays, only the backdrop itself counts as an outside click.
  backdrop?: RefObject<HTMLElement | null>;
  onPointer?: (event: PointerEvent) => void;
};

const focusable = 'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], summary, [tabindex]:not([tabindex="-1"])';

export function useDismissableLayer({ active, area, trigger, onClose, trapFocus = false, backdrop, onPointer }: Options) {
  const latest = useRef({ onClose, onPointer });
  latest.current = { onClose, onPointer };
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (trapFocus) area.current?.querySelector<HTMLElement>(focusable)?.focus();
    const pointer = (event: PointerEvent) => {
      latest.current.onPointer?.(event);
      if (backdrop ? event.target === backdrop.current : !area.current?.contains(event.target as Node)) latest.current.onClose();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); latest.current.onClose(); if (!trapFocus) trigger?.current?.focus(); return; }
      if (!trapFocus || event.key !== 'Tab') return;
      const items = [...(area.current?.querySelectorAll<HTMLElement>(focusable) ?? [])];
      if (!items.length) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', keydown);
      if (trapFocus) (trigger?.current ?? previous)?.focus();
    };
  }, [active, area, trigger, trapFocus, backdrop]);
}
