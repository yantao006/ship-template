import type { ThemeConfig } from '../../src/lib/site-config-types';

export default {
    light: {
      canvas: '#ffffff', panel: '#f8f7fa', inset: '#f1eff5', elevated: '#edeaf2', text: '#18181b', muted: '#57545f', subtle: '#696575', border: '#ded8e7', accent: '#6d28d9', accentSoft: '#eee7fa', disabled: '#e4e4e7', disabledText: '#64616b', overlay: '#1118279c', shadow: '#11182738', grid: '#18181b0d', heroGlow: '#8b5cf61a', titleGlow: '#eee7fa', inviteStart: '#f7f2fc', inviteMiddle: '#f5effb', inviteEnd: '#fcf1fa', infoPanel: '#e0f2fe', infoValue: '#075985', accentValue: '#6d28d9', messageBg: '#dcfce7', messageText: '#166534', errorBg: '#fee2e2', errorText: '#991b1b', heroIconBg: '#ffffff23', heroMuted: '#57545f', socialBg: '#f1eff5', socialHover: '#e9e1f2', shareBg: '#f8f7fa',
    },
    dark: {
      canvas: '#101111', panel: '#191a1a', inset: '#111116', elevated: '#262627', text: '#ffffff', muted: '#aaa', subtle: '#888', border: '#ffffff1a', accent: '#c4b5fd', accentSoft: '#281b3a', disabled: '#ffffff1a', disabledText: '#ffffff66', overlay: '#000b', shadow: '#000b', grid: '#ffffff0a', heroGlow: '#a78bfa1c', titleGlow: '#45277899', inviteStart: '#1c1028', inviteMiddle: '#1c132e', inviteEnd: '#28102b', infoPanel: '#102031', infoValue: '#44d9f4', accentValue: '#e79afa', messageBg: '#14532d55', messageText: '#bbf7d0', errorBg: '#7f1d1d66', errorText: '#fecaca', heroIconBg: '#ffffff23', heroMuted: '#ffffff8c', socialBg: '#0004', socialHover: '#0008', shareBg: '#ffffff09',
    },
  } satisfies ThemeConfig['dialog'];
