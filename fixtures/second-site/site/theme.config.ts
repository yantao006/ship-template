import type { ThemeConfig } from '../../../src/lib/config';

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
  account: { accent: '#0d9488', accentEnd: '#14b8a6', accentText: '#99f6e4' },
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
  dialog: {
    light: {
      canvas: '#ffffff', panel: '#f8f7fa', inset: '#f1eff5', elevated: '#edeaf2', text: '#18181b', muted: '#57545f', subtle: '#696575', border: '#ded8e7', accent: '#6d28d9', accentSoft: '#eee7fa', disabled: '#e4e4e7', disabledText: '#64616b', overlay: '#1118279c', shadow: '#11182738', grid: '#18181b0d', heroGlow: '#8b5cf61a', titleGlow: '#eee7fa', inviteStart: '#f7f2fc', inviteMiddle: '#f5effb', inviteEnd: '#fcf1fa', infoPanel: '#e0f2fe', infoValue: '#075985', accentValue: '#6d28d9', messageBg: '#dcfce7', messageText: '#166534', errorBg: '#fee2e2', errorText: '#991b1b', heroIconBg: '#ffffff23', heroMuted: '#57545f', socialBg: '#f1eff5', socialHover: '#e9e1f2', shareBg: '#f8f7fa',
    },
    dark: {
      canvas: '#101111', panel: '#191a1a', inset: '#111116', elevated: '#262627', text: '#ffffff', muted: '#aaa', subtle: '#888', border: '#ffffff1a', accent: '#c4b5fd', accentSoft: '#281b3a', disabled: '#ffffff1a', disabledText: '#ffffff66', overlay: '#000b', shadow: '#000b', grid: '#ffffff0a', heroGlow: '#a78bfa1c', titleGlow: '#45277899', inviteStart: '#1c1028', inviteMiddle: '#1c132e', inviteEnd: '#28102b', infoPanel: '#102031', infoValue: '#44d9f4', accentValue: '#e79afa', messageBg: '#14532d55', messageText: '#bbf7d0', errorBg: '#7f1d1d66', errorText: '#fecaca', heroIconBg: '#ffffff23', heroMuted: '#ffffff8c', socialBg: '#0004', socialHover: '#0008', shareBg: '#ffffff09',
    },
  },
  videoTool: {
    light: {
      canvas: '#fafafa', panel: '#ffffff', inset: '#f4f4f6', control: '#f0f0f2', raised: '#e9e9ed', selected: '#ebe4f6', selectionText: '#6d28d9', text: '#18181b', secondary: '#3f4149', muted: '#5b606b', faint: '#686b75', border: '#dedee3', accent: '#6d28d9', accentSoft: '#eee7fa', accentText: '#5b21b6', focus: '#7c3aed', scrollbar: '#a1a1aa', disabled: '#e4e4e7', disabledText: '#555b66', promoBg: '#f6ead8', promoText: '#8a5a32', onMedia: '#ffffff', mediaScrim: '#000b', tabSelectedBg: '#18181b', tabSelectedText: '#ffffff', infoBg: '#e0f2fe', infoText: '#075985', successBg: '#dcfce7', successText: '#166534', crownBg: '#f6ead8', crownText: '#8a5a32', neutralBg: '#e4e4e7', neutralText: '#3f4149', shadow: '#11182738', rangeTrack: '#d4d4d8',
    },
    dark: {
      canvas: '#0c0c0f', panel: '#1d1d20', inset: '#111113', control: '#141416', raised: '#29292b', selected: '#414145', selectionText: '#e7c56a', text: '#f4f4f5', secondary: '#d4d4d8', muted: '#a1a1aa', faint: '#aeb0ba', border: '#39393f', accent: '#c4b5fd', accentSoft: '#3b2f63', accentText: '#ddd6fe', focus: '#e4e4e7', scrollbar: '#797981', disabled: '#38383e', disabledText: '#d4d4d8', promoBg: '#f6ead8', promoText: '#8a5a32', onMedia: '#ffffff', mediaScrim: '#000b', tabSelectedBg: '#ffffff', tabSelectedText: '#18181b', infoBg: '#1e3a4c', infoText: '#bae6fd', successBg: '#c2f0ce', successText: '#245237', crownBg: '#f6ead8', crownText: '#8a5a32', neutralBg: '#33333a', neutralText: '#e4e4e7', shadow: '#00000088', rangeTrack: '#66666c',
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
} satisfies ThemeConfig;
