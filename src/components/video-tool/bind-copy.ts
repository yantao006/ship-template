import type { ToolAsset, VideoToolCopy, VideoToolStructure } from './types';

export function bindToolSite(config: VideoToolStructure, copy: VideoToolCopy, locale: string): { config: VideoToolStructure; assets: ToolAsset[] } {
  const localizeUrl = (url: string) => url.replace('{locale}', locale);
  return {
    config: { ...config, promo: config.promo && { ...config.promo, href: localizeUrl(config.promo.href) } },
    assets: config.assets.map(asset => {
      const text = copy.assets[asset.id];
      return {
        id: asset.id, type: asset.type, url: asset.url, poster: asset.poster, thumbnail: asset.thumbnail, tabId: asset.tabId,
        title: text.title, description: text.description, badge: text.badge,
        secondaryActions: asset.actionIds?.map(id => ({ id, label: text.actions?.[id] ?? '' })),
        links: asset.links?.map(link => ({ id: link.id, label: text.links?.[link.id] ?? '', href: localizeUrl(link.href) })).filter(link => link.label),
      };
    }),
  };
}
