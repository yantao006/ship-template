// Site-facing choices are checked at compile time; runtime constraints are checked by site-check.
export const accountIconNames = ['sparkles', 'share', 'gift', 'mail', 'message'] as const;
export const shareNetworkNames = ['Facebook', 'X', 'WhatsApp', 'LinkedIn', 'Telegram', 'Reddit'] as const;
export type AccountIconName = typeof accountIconNames[number];
export type ShareNetworkName = typeof shareNetworkNames[number];
