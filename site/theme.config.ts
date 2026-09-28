import type { ThemeConfig, VideoToolIconKeys } from '../src/lib/site-config-types';
import { light, dark, defaultMode, font, account, tones, rowTones } from './theme/foundation';
import chrome from './theme/chrome';
import authCard from './theme/auth-card';
import mail from './theme/mail';
import dialog from './theme/dialog';
import videoTool from './theme/video-tool';
import pricing from './theme/pricing';
import purchase from './theme/purchase';

export default {
  light,
  dark,
  defaultMode,
  font,
  account,
  tones,
  chrome,
  authCard,
  mail,
  dialog,
  videoTool,
  pricing,
  purchase,
  rowTones,
} satisfies ThemeConfig<VideoToolIconKeys>;
