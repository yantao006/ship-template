export type ThemeMode = 'light' | 'dark';

type ThemeRoot = Pick<HTMLElement, 'dataset' | 'classList'>;

// The document attribute is the single source of truth across App Router page remounts.
export function setThemeMode(root: ThemeRoot, mode: ThemeMode): ThemeMode {
  const changed = root.dataset.mode !== mode;
  root.dataset.mode = mode;
  root.classList.toggle('replica-light', mode === 'light');
  if (changed && 'dispatchEvent' in root && typeof root.dispatchEvent === 'function') root.dispatchEvent(new Event('site-theme-change'));
  return mode;
}

export function ensureThemeMode(root: ThemeRoot, defaultMode: ThemeMode): ThemeMode {
  const mode = root.dataset.mode;
  return setThemeMode(root, mode === 'light' || mode === 'dark' ? mode : defaultMode);
}

export function toggleThemeMode(root: ThemeRoot, defaultMode: ThemeMode): ThemeMode {
  const mode = root.dataset.mode;
  return setThemeMode(root, (mode === 'light' || (mode === 'auto' && defaultMode === 'light')) ? 'dark' : 'light');
}
