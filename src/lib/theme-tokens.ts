import theme from '../../site/theme.config';

type Palette = typeof theme.light;

function paletteRules(palette: Palette) {
  return `--bg:${palette.background};--surface:${palette.surface};--text:${palette.foreground};--muted:${palette.muted};--accent:${palette.accent};--line:${palette.border};`;
}

function chromeRules(mode: 'light' | 'dark') {
  const chrome = Object.entries(theme.chrome[mode]).map(([key, value]) => `--${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${value};`).join('');
  const tones = Object.entries(theme.rowTones[mode]).map(([name, value]) => `--account-tone-${name}:${value.text};--account-tone-${name}-box:${value.box};`).join('');
  return chrome + tones;
}

/** One token stylesheet per site; the homepage's data marker selects its default without client-side flash. */
export function themeTokenStylesheet() {
  const account = theme.account;
  const tones = theme.tones;
  return `html{font-family:${theme.font};--surface-raised:color-mix(in srgb,var(--surface) 90%,var(--text));--surface-sunken:color-mix(in srgb,var(--surface) 90%,var(--bg));--hover:color-mix(in srgb,var(--surface) 85%,var(--text));--scrim:color-mix(in srgb,var(--bg) 65%,transparent);--account-accent:${account.accent};--account-accent-end:${account.accentEnd};--account-accent-text:${account.accentText};--tone-pink:${tones.pink};--tone-info:${tones.info};--tone-success:${tones.success};--tone-warning:${tones.warning};--tone-danger:${tones.danger};}
html[data-mode="auto"],html[data-mode="light"]{${paletteRules(theme.light)}${chromeRules('light')}color-scheme:light;}
html[data-mode="dark"],html[data-mode="auto"][data-default-mode="dark"],html[data-mode="auto"]:has([data-default-mode="dark"]){${paletteRules(theme.dark)}${chromeRules('dark')}color-scheme:dark;}`;
}
