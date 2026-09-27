import type { ShareNetworkName } from './site-config-types';

/** The check-in card has its own invite format; other account shares keep their existing URLs. */
export function checkinInviteShare(siteUrl: string, referralCode: string, sentence: string) {
  const url = new URL('/invitation-landing', siteUrl);
  url.searchParams.set('invite_code', referralCode);
  const link = url.toString();
  const text = `${sentence}\n${link}`;
  const targets: Record<ShareNetworkName, string> = {
    X: `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
    WhatsApp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
    Telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(sentence)}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(sentence)}`,
    LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(sentence)}`,
    Reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(sentence)}`,
  };
  return { link, text, targets };
}
