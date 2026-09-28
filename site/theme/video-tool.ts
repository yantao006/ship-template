import type { ThemeConfig, VideoToolIconKeys } from '../../src/lib/site-config-types';

export default {
    light: {
      canvas: '#fafafa', panel: '#ffffff', inset: '#f4f4f6', control: '#f0f0f2', raised: '#e9e9ed', selected: '#ebe4f6', selectionText: '#6d28d9', text: '#18181b', secondary: '#3f4149', muted: '#5b606b', faint: '#686b75', border: '#dedee3', accent: '#6d28d9', accentSoft: '#eee7fa', accentText: '#5b21b6', focus: '#7c3aed', scrollbar: '#a1a1aa', disabled: '#e4e4e7', disabledText: '#555b66', promoBg: '#f6ead8', promoText: '#8a5a32', onMedia: '#ffffff', mediaScrim: '#000b', tabSelectedBg: '#18181b', tabSelectedText: '#ffffff', infoBg: '#e0f2fe', infoText: '#075985', successBg: '#dcfce7', successText: '#166534', crownBg: '#f6ead8', crownText: '#8a5a32', neutralBg: '#e4e4e7', neutralText: '#3f4149', shadow: '#11182738', rangeTrack: '#d4d4d8', iconMuted: '#69788e', iconImage: '#60a5fa', iconFilm: '#a78bfa', iconMusic: '#f472b6', iconLibrary: '#d97706',
    },
    dark: {
      canvas: '#0c0c0f', panel: '#1d1d20', inset: '#111113', control: '#141416', raised: '#29292b', selected: '#414145', selectionText: '#e7c56a', text: '#f4f4f5', secondary: '#d4d4d8', muted: '#a1a1aa', faint: '#aeb0ba', border: '#39393f', accent: '#c4b5fd', accentSoft: '#3b2f63', accentText: '#ddd6fe', focus: '#e4e4e7', scrollbar: '#797981', disabled: '#38383e', disabledText: '#d4d4d8', promoBg: '#f6ead8', promoText: '#8a5a32', onMedia: '#ffffff', mediaScrim: '#000b', tabSelectedBg: '#ffffff', tabSelectedText: '#18181b', infoBg: '#1e3a4c', infoText: '#bae6fd', successBg: '#c2f0ce', successText: '#245237', crownBg: '#f6ead8', crownText: '#8a5a32', neutralBg: '#33333a', neutralText: '#e4e4e7', shadow: '#00000088', rangeTrack: '#66666c', iconMuted: '#9aaac1', iconImage: '#7dd3fc', iconFilm: '#c4b5fd', iconMusic: '#f9a8d4', iconLibrary: '#fbbf24',
    },
  } satisfies ThemeConfig<VideoToolIconKeys>['videoTool'];
