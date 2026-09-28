import type { ThemeConfig } from '../../src/lib/site-config-types';

export default {
    light: {
      navBg: '#ffffff', navText: '#171717', navMuted: '#555555', navHover: '#f0f0f2', navLine: '#dedee3', languageDot: '#8b5cf6',
      popoverBg: '#ffffff', popoverEnd: '#f7f7fa', popoverMenuEnd: '#ecf3ff', popoverHeader: '#f4f0fa', popoverBorder: '#ded8e7', popoverLine: '#e4e4e7',
      languageBg: '#ffffff', rowHover: '#f0edf5', rowIcon: '#6d28d9', rowIconBg: '#f6f3fa', rowIconLine: '#e2ddea',
      pillBg: '#f0f0f2', pillHover: '#e7e7ea', pillLine: '#dedee3',
      buyBg: '#18181b', buyText: '#ffffff', buyHover: '#334155',
    },
    dark: {
      navBg: '#0b0b0c', navText: '#ffffff', navMuted: '#aaaaaa', navHover: '#202022', navLine: '#2b2b2e', languageDot: '#ffd600',
      popoverBg: '#0b0b0c', popoverEnd: '#1a1c23', popoverMenuEnd: '#253047', popoverHeader: '#17121f88', popoverBorder: '#3b3052', popoverLine: '#2c2c32',
      languageBg: '#1b1b1f', rowHover: '#ffffff12', rowIcon: '#c4b5fd', rowIconBg: '#ffffff0a', rowIconLine: '#34343a',
      pillBg: '#252527', pillHover: '#343439', pillLine: '#333338',
      buyBg: '#fafafa', buyText: '#111111', buyHover: '#dedee2',
    },
  } satisfies ThemeConfig['chrome'];
