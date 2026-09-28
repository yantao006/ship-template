import theme from '../../site/theme.config';

type Palette = typeof theme.light;

function paletteRules(palette: Palette) {
  return `--bg:${palette.background};--surface:${palette.surface};--text:${palette.foreground};--muted:${palette.muted};--accent:${palette.accent};--line:${palette.border};`;
}

function chromeRules(mode: 'light' | 'dark') {
  const chrome = Object.entries(theme.chrome[mode]).map(([key, value]) => `--${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${value};`).join('');
  const tones = Object.entries(theme.rowTones[mode]).map(([name, value]) => `--account-tone-${name}:${value.text};--account-tone-${name}-box:${value.box};`).join('');
  const dialogs = Object.entries(theme.dialog[mode]).map(([key, value]) => `--dialog-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${value};`).join('');
  const authCard = Object.entries(theme.authCard[mode]).map(([key, value]) => `--auth-card-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${value};`).join('');
  const video = Object.entries(theme.videoTool[mode]).map(([key, value]) => `--video-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${value};`).join('');
  const pricing = Object.entries(theme.pricing[mode]).map(([key, value]) => `--pricing-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${value};`).join('');
  const purchase = Object.entries(theme.purchase[mode]).map(([key, value]) => `--purchase-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${value};`).join('');
  return chrome + tones + dialogs + authCard + video + pricing + purchase;
}

/** One token stylesheet per site; the root document selects the initial route default without a flash. */
export function themeTokenStylesheet() {
  const account = theme.account;
  const tones = theme.tones;
  return `html{font-family:${theme.font};--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--text-11:11px;--text-12:12px;--text-13:13px;--text-14:14px;--text-15:15px;--text-16:16px;--text-17:17px;--text-18:18px;--weight-medium:600;--weight-semibold:650;--weight-bold:700;--weight-heavy:800;--weight-black:900;--radius-control:7px;--radius-control-md:8px;--radius-control-lg:9px;--radius-card-sm:10px;--radius-card-md:12px;--radius-card:14px;--radius-card-xl:16px;--radius-card-lg:24px;--radius-dialog:28px;--radius-pill:999px;--shadow-dialog:0 20px 70px color-mix(in srgb,var(--text) 20%,transparent);--duration-fast:.15s;--duration-quick:.18s;--duration-enter:.2s;--duration-standard:.25s;--duration-stagger:.36s;--surface-raised:color-mix(in srgb,var(--surface) 90%,var(--text));--surface-sunken:color-mix(in srgb,var(--surface) 90%,var(--bg));--hover:color-mix(in srgb,var(--surface) 85%,var(--text));--scrim:color-mix(in srgb,var(--bg) 65%,transparent);--account-accent:${account.accent};--account-accent-end:${account.accentEnd};--account-accent-text:${account.accentText};--tone-pink:${tones.pink};--tone-info:${tones.info};--tone-success:${tones.success};--tone-warning:${tones.warning};--tone-danger:${tones.danger};}
html[data-mode="auto"],html[data-mode="light"]{${paletteRules(theme.light)}${chromeRules('light')}color-scheme:light;}
html[data-mode="dark"],html[data-mode="auto"][data-default-mode="dark"]{${paletteRules(theme.dark)}${chromeRules('dark')}color-scheme:dark;}`;
}
