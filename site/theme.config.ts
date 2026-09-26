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
  chrome: {
    light: {
      navBg: '#ffffff', navText: '#171717', navMuted: '#555555', navHover: '#f0f0f2', navLine: '#dedee3', languageDot: '#8b5cf6',
      popoverBg: '#ffffff', popoverEnd: '#f7f7fa', popoverHeader: '#f4f0fa', popoverBorder: '#ded8e7', popoverLine: '#e4e4e7',
      languageBg: '#ffffff', rowHover: '#f0edf5', rowIcon: '#6d28d9', rowIconBg: '#f6f3fa', rowIconLine: '#e2ddea',
      pillBg: '#f0f0f2', pillHover: '#e7e7ea', pillLine: '#dedee3',
      buyBg: '#18181b', buyText: '#ffffff', buyHover: '#334155',
    },
    dark: {
      navBg: '#0b0b0c', navText: '#ffffff', navMuted: '#aaaaaa', navHover: '#202022', navLine: '#2b2b2e', languageDot: '#ffd600',
      popoverBg: '#0b0b0c', popoverEnd: '#1a1c23', popoverHeader: '#17121f88', popoverBorder: '#3b3052', popoverLine: '#2c2c32',
      languageBg: '#1b1b1f', rowHover: '#ffffff12', rowIcon: '#c4b5fd', rowIconBg: '#ffffff0a', rowIconLine: '#34343a',
      pillBg: '#252527', pillHover: '#343439', pillLine: '#333338',
      buyBg: '#fafafa', buyText: '#111111', buyHover: '#dedee2',
    },
  },
  rowTones: {
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
  },
};
