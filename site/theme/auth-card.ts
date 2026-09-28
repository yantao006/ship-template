import type { ThemeConfig } from '../../src/lib/site-config-types';

export default {
    light: { canvas: '#f4f2ee', panel: '#ffffff', text: '#0a0a0a', row: '#ece8e0', line: '#e8e5df', muted: '#6b7280', faint: '#9ca3af', icon: '#0a0a0a', button: '#0a0a0a', buttonHover: '#000000', onButton: '#ffffff', focus: '#7a5bff', media: '#333333', error: '#b91c1c' },
    dark: { canvas: '#111113', panel: '#202024', text: '#fafafa', row: '#19191d', line: '#323238', muted: '#a1a1aa', faint: '#71717a', icon: '#a78bfa', button: '#7a5bff', buttonHover: '#000000', onButton: '#ffffff', focus: '#7a5bff', media: '#333333', error: '#fca5a5' },
  } satisfies ThemeConfig['authCard'];
