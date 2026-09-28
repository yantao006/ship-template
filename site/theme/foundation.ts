import type { ThemeConfig } from '../../src/lib/site-config-types';

export const light = {
  background: '#fafafa',
  surface: '#ffffff',
  foreground: '#18181b',
  muted: '#5b606b',
  accent: '#334155',
  border: '#e4e4e7',
};

export const dark: typeof light = {
  background: '#111113',
  surface: '#202024',
  foreground: '#f6f6f8',
  muted: '#b5b5bf',
  accent: '#a178ff',
  border: '#38383f',
};

export const defaultMode = { home: 'dark', other: 'light' } as const satisfies ThemeConfig['defaultMode'];

export const font = 'Arial, Helvetica, sans-serif' satisfies ThemeConfig['font'];

export const account = { accent: '#8b5cf6', accentEnd: '#b163db', accentText: '#c4b5fd' } satisfies ThemeConfig['account'];

export const tones = { pink: '#e967bc', info: '#60a5fa', success: '#bbf7d0', warning: '#e7c56a', danger: '#f87171' } satisfies ThemeConfig['tones'];

export const rowTones = {
    light: {
      account: { text: '#6d28d9', box: '#8b5cf6' },
      pink: { text: '#a21caf', box: '#ba4add' },
      info: { text: '#1d4ed8', box: '#3b82f6' },
      danger: { text: '#b91c1c', box: '#b91c1c' },
    },
    dark: {
      account: { text: '#d6c6ff', box: '#8b5cf6' },
      pink: { text: '#eeb7f5', box: '#ba4add' },
      info: { text: '#a6ceff', box: '#3b82f6' },
      danger: { text: '#f87171', box: '#f87171' },
    },
  } satisfies ThemeConfig['rowTones'];
