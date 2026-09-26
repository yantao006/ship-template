import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
import theme from '../site/theme.config';
import { themeTokenStylesheet } from '../src/lib/theme-tokens';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const colors = (source: string) => new Set((source.match(/#[\da-fA-F]{3,8}\b/g) ?? []).map(value => value.toLowerCase()));

// Historical pre-migration baseline. The three CSS files jointly held 224 unique literals.
// Keep them listed by file until their respective slices migrate to tokens.
const legacyColors: Record<string, string> = {
  'src/app/globals.css': `#00000066 #00000088 #000b #0c0c0f #111113 #11182738 #1118279c #141416 #151517 #18181a #18181b #1b1b1e #1b1b1f #1c1c1f #1d1d20 #1e293b1e #1e3a4c #242428 #245237 #252525 #252528 #29292a #29292b #2a2a30 #303036 #323238 #33333a #334155 #34343a #36313f #36363a #38383e #39393f #3a3a40 #3b2f63 #3c3c40 #3f3f46 #414145 #414754 #454548 #525258 #52525b #64748b #66666c #76767e #797981 #8a5a32 #92929c #9f1239 #a1a1aa #a9a9b2 #aa83ec #aab0bb #abb3c1 #adb2bf #ae89ed #aeb0ba #b996f0 #b9b9c1 #bae6fd #c2f0ce #c4b5fd #c9a8ff #cbd5e1 #d4d4d8 #dbe3e9 #ddd6fe #dedee2 #e2e8f0 #e4e4e7 #e7c56a #e8edf2 #edf0f4 #f1f3f6 #f4f4f5 #f4f6f8 #f6ead8 #f8fafc #fecdd3 #fff #fff1f2`,
  'src/components/blocks/replica-navigation.css': `#000b #0b0b0c #101014 #111113 #151519 #161616 #171717 #17171c #18181b #1b1b1f #202022 #202024 #21242b #292632 #29292e #292933 #2b2b2e #2b2b30 #2d2d31 #303036 #34343a #38383f #555 #5b606b #a178ff #a1a1aa #aaa #b5b5bf #ddd #dedee3 #e4e4e7 #e7c56a #f0f0f2 #f5f5f5 #f6f6f8 #fafafa #ff8588 #ffd600 #fff`,
  'src/components/blocks/account-popovers.css': `#0003 #0004 #0008 #000b #000c #09090f #0b0b0c #100c1a #101111 #102031 #111 #111116 #111212 #121217 #13141f #14141a #14532d55 #15151b #17121f88 #191a1a #1a1722 #1a1c23 #1c1028 #1c132e #20112b #21212a #2196f3 #24212a #25232d #252527 #25d366 #262626 #262627 #27242e #28102b #281b3a #2c2c30 #2c2c32 #2ca5e0 #312d38 #322b40 #333338 #34313d #343439 #34343a #353049 #35313e #38303f #383540 #391a41 #3a2757 #3b3052 #444052 #44d9f4 #45277899 #45404e #45414c #484052 #484352 #51495a #5473ff #60a5fa40 #656565 #6b21a844 #7956e8 #7f1d1d66 #888 #8b5cf644 #8c56d7 #999 #a69eaf #a78bfa #a78bfa1c #a78bfa3d #a78bfa40 #a98ef7 #aa91d9 #aaa #aaa5b3 #ac95fa #b5adc1 #b5b5bf #bb33e9 #bbb #bbf7d0 #beadf0 #c3bfcd #c4b0ec #c4b5fd #c5a8ff #cab3ff #ccc #cfb5fa #d36df8 #d537ed #d9b9ff #ddd #dedee2 #e6dfec #e79afa #e7c56a #e967bc #f5f5f5 #f6f5fb #f7f7f7 #fafafa #fecaca #ff6b4a #fff #ffffff09 #ffffff0a #ffffff0f #ffffff12 #ffffff16 #ffffff19 #ffffff1a #ffffff23 #ffffff25 #ffffff26 #ffffff2b #ffffff30 #ffffff40 #ffffff66 #ffffff80 #ffffff8c #ffffffb3`,
};

const literalAllowlist = new Set([
  'site/theme.config.ts',
  'site/video-tool.config.ts', // Unmigrated configured icons.
  ...Object.keys(legacyColors),
  'src/components/blocks/account-popovers.tsx', // Unmigrated row colors.
  'public/brand/logo.svg',
  'public/video-tool/grok-logo.svg',
  'public/video-tool/openai-logo.svg',
  'public/video-tool/seedance-logo.svg', // Third-party brand marks.
]);

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.(?:css|svg|tsx?|js)$/.test(entry.name)) yield path;
  }
}

test('light and dark palettes have the same six semantic keys', () => {
  const keys = ['accent', 'background', 'border', 'foreground', 'muted', 'surface'];
  assert.deepEqual(Object.keys(theme.light).sort(), keys);
  assert.deepEqual(Object.keys(theme.dark).sort(), keys);
  assert.equal(theme.defaultMode.home, 'dark');
  assert.equal(theme.defaultMode.other, 'light');
  assert.notEqual(theme.light.background, theme.dark.background);
  assert.notEqual(theme.light.foreground, theme.dark.foreground);
  const sheet = themeTokenStylesheet();
  assert.match(sheet, /html\[data-mode="dark"\]/);
  assert.match(sheet, /html\[data-mode="auto"\]:has\(\[data-default-mode="dark"\]\)/);
  for (const name of ['bg', 'surface', 'text', 'muted', 'accent', 'line', 'surface-raised', 'surface-sunken', 'hover', 'scrim', 'account-accent', 'account-accent-end', 'account-accent-text', 'tone-pink', 'tone-info', 'tone-success', 'tone-warning', 'tone-danger']) {
    assert.match(sheet, new RegExp(`--${name}:`));
  }
  const layout = read('src/app/layout.tsx');
  assert.match(layout, /data-mode="auto" data-default-mode=\{theme\.defaultMode\.other\}/);
  assert.match(layout, /themeTokenStylesheet\(\)/);
  assert.doesNotMatch(layout, /<body style=/);
  const navigation = read('src/components/blocks/replica-navigation.tsx');
  assert.match(navigation, /data-default-mode=\{defaultMode\}/);
  assert.match(navigation, /document\.documentElement\.dataset\.mode = light \? 'light' : 'dark'/);
  const authPanel = read('src/app/globals.css').match(/\.auth-panel\s*\{([^}]+)\}/)?.[1];
  assert.ok(authPanel);
  assert.match(authPanel, /background:\s*var\(--surface\)/);
  assert.match(authPanel, /color:\s*var\(--text\)/);
  const css = read('src/app/globals.css');
  assert.match(css, /html:is\(\[data-mode="dark"\],[^}]+\.auth-panel \.auth-button \{ color: var\(--bg\); \}/);
  assert.match(css, /body \{[^}]*background: var\(--bg\); color: var\(--text\)/);
});

test('navigation, menu, credit pill and account cards use paired theme colors and one shared shell', () => {
  const sheet = themeTokenStylesheet();
  assert.notEqual(theme.chrome.light.navBg, theme.chrome.dark.navBg);
  assert.notEqual(theme.chrome.light.popoverBg, theme.chrome.dark.popoverBg);
  for (const name of ['nav-bg', 'nav-muted', 'nav-hover', 'nav-line', 'popover-bg', 'popover-end', 'popover-header', 'popover-border', 'popover-line', 'pill-bg', 'pill-hover', 'pill-line', 'row-hover', 'row-icon', 'buy-bg', 'buy-text', 'account-tone-account', 'account-tone-pink', 'account-tone-info', 'account-tone-danger']) {
    assert.match(sheet, new RegExp(`--${name}:`));
  }
  const navigation = read('src/components/blocks/replica-navigation.css');
  const cards = read('src/components/blocks/account-popovers.css');
  assert.match(navigation, /\.account-popover,\s*\.replica-popover\s*\{/);
  assert.match(navigation, /\.replica-language-menu button/);
  assert.match(cards, /\.account-row-label\{[^}]*white-space:nowrap/);
  assert.match(cards, /\.account-row-badge\.boxed\{[^}]*var\(--row-box-tone/);
  assert.doesNotMatch(cards, /\.account-popover\{position:absolute/);
  assert.doesNotMatch(navigation, /\.replica-popover\s*\{position:absolute/);
});

test('literal colors remain confined to the documented 224-color baseline and allowlist', () => {
  const original = new Set<string>();
  for (const [path, list] of Object.entries(legacyColors)) {
    const allowed = new Set(list.split(' '));
    assert.equal(allowed.size, { 'src/app/globals.css': 81, 'src/components/blocks/replica-navigation.css': 39, 'src/components/blocks/account-popovers.css': 126 }[path]);
    for (const value of allowed) original.add(value);
    for (const value of colors(read(path))) assert.ok(allowed.has(value), `${path}: unexpected literal ${value}`);
  }
  assert.equal(original.size, 224);
  for (const dir of ['site', 'src', 'public']) {
    for (const path of sourceFiles(dir)) {
      if (!literalAllowlist.has(path)) assert.equal(colors(read(path)).size, 0, `${path} introduces literal colors`);
    }
  }
  const configured = colors(read('site/theme.config.ts'));
  for (const value of colors(themeTokenStylesheet())) assert.ok(configured.has(value), `generated stylesheet has unconfigured color ${value}`);
});

test('new stylesheets do not repeat selectors; unmigrated CSS is exempt', () => {
  const legacyCss = new Set(Object.keys(legacyColors));
  const stylesheets = [themeTokenStylesheet(), ...[...sourceFiles('src')].filter(path => path.endsWith('.css') && !legacyCss.has(path)).map(read)];
  for (const source of stylesheets) {
    const seen = new Set<string>();
    for (const match of source.matchAll(/(?:^|})\s*([^{}]+)\{/g)) {
      const selector = match[1].trim();
      if (selector.startsWith('@')) continue;
      assert.ok(!seen.has(selector), `duplicate selector: ${selector}`);
      seen.add(selector);
    }
  }
});
