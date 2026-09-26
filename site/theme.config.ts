const light = {
  background: '#fafafa',
  surface: '#ffffff',
  foreground: '#18181b',
  muted: '#5b606b',
  accent: '#334155',
  border: '#e4e4e7',
};

const dark: typeof light = {
  background: '#111113',
  surface: '#202024',
  foreground: '#f6f6f8',
  muted: '#b5b5bf',
  accent: '#a178ff',
  border: '#38383f',
};

export default {
  light,
  dark,
  defaultMode: { home: 'dark', other: 'light' } as const,
  font: 'Arial, Helvetica, sans-serif',
  account: { accent: '#8b5cf6', accentEnd: '#b163db', accentText: '#c4b5fd' },
  tones: { pink: '#e967bc', info: '#60a5fa', success: '#bbf7d0', warning: '#e7c56a', danger: '#f87171' },
};
