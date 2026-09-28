'use client';

import { useEffect } from 'react';
import { ensureThemeMode, type ThemeMode } from '@/lib/theme-mode';

/** Freeze the first page's server-rendered auto mode before client navigation. */
export function ThemeModeInitializer({ defaultMode }: { defaultMode: ThemeMode }) {
  useEffect(() => {
    ensureThemeMode(document.documentElement, defaultMode);
  }, [defaultMode]);

  return null;
}
