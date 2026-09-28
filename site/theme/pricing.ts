import type { ThemeConfig } from '../../src/lib/site-config-types';

export default {
    light: {
      canvas: '#f8f7fa', panel: '#ffffff', inset: '#f0edf5', text: '#18181b', muted: '#57545f', border: '#ded8e7',
      accent: '#6d28d9', accentText: '#ffffff', success: '#166534', successSoft: '#dcfce7',
      banner: '#fff6df', bannerText: '#29212d', bannerAccent: '#9a3d08', featured: '#f7f0ff', button: '#18181b', buttonText: '#ffffff', paymentBadge: '#18181b',
    },
    dark: {
      canvas: '#111113', panel: '#222226', inset: '#19191d', text: '#f6f6f8', muted: '#b5b5bf', border: '#38383f',
      accent: '#a178ff', accentText: '#ffffff', success: '#83e2b9', successSoft: '#1b302a',
      banner: '#fff6df', bannerText: '#29212d', bannerAccent: '#9a3d08', featured: '#2b2635', button: '#f6f6f8', buttonText: '#18181b', paymentBadge: '#18181b',
    },
  } satisfies ThemeConfig['pricing'];
