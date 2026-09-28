import type { ThemeConfig } from '../../src/lib/site-config-types';

export default {
    light: { canvas: '#111113', panel: '#222226', line: '#38383f', text: '#ffffff', muted: '#aaaab3', accent: '#a280f8', success: '#00c99a', offer: '#ff560a', offerEnd: '#ff9b21', offerBg: '#fff8e8', offerText: '#101827', pink: '#ed63ae', peach: '#ff9b83', glow: '#7349d83d' },
    dark: { canvas: '#101012', panel: '#222226', line: '#39393f', text: '#ffffff', muted: '#aaaab3', accent: '#a280f8', success: '#00c99a', offer: '#ff560a', offerEnd: '#ff9b21', offerBg: '#fff8e8', offerText: '#101827', pink: '#ed63ae', peach: '#ff9b83', glow: '#7349d83d' },
  } satisfies ThemeConfig['purchase'];
