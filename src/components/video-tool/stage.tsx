import type { ToolAsset, ToolStatus } from './types';

export type StageProps = {
  title: string;
  tabs: { id: string; label: string; empty: string }[];
  tabId: string; onTabChange: (id: string) => void;
  assets: ToolAsset[]; assetId: string; onAssetChange: (id: string) => void;
  templateGrid: boolean; galleryHeading?: string;
  status: ToolStatus; statusText: string;
};

function RichText({ text }: { text: string }) {
  return <>{text.split(/(@[^.,;]+)/g).map((part, index) => part.startsWith('@') ? <span className="vt-mention" key={index}>{part}</span> : <span key={index}>{part}</span>)}</>;
}

function AssetFrame({ asset }: { asset: ToolAsset }) {
  return asset.type === 'image'
    ? <img src={asset.url} alt={asset.title} />
    : <video controls autoPlay muted loop playsInline preload="metadata" poster={asset.poster} src={asset.url} aria-label={asset.title} />;
}

export function Stage({ title, tabs, tabId, onTabChange, assets, assetId, onAssetChange, templateGrid, galleryHeading, status, statusText }: StageProps) {
  const preview = assets.find(asset => asset.id === assetId) ?? assets[0];
  return <div className="vt-gallery">
    <div className="vt-tabs" role="tablist" aria-label={title}>{tabs.map(tab => <button key={tab.id} type="button" role="tab" id={`vt-tab-${tab.id}`} aria-controls="vt-tabpanel" aria-selected={tabId === tab.id} onClick={() => onTabChange(tab.id)}>{tab.label}</button>)}</div>
    {templateGrid ? <div className="vt-template-gallery" role="tabpanel" id="vt-tabpanel" aria-labelledby={`vt-tab-${tabId}`}>
      {galleryHeading && <h3>{galleryHeading}</h3>}
      <div className="vt-template-grid">{assets.map(asset => <button key={asset.id} className="vt-template-card" type="button" aria-label={`${asset.title}: ${asset.description}`} aria-pressed={asset.id === assetId} onClick={() => onAssetChange(asset.id)}><img src={asset.url} alt="" loading="lazy" /><span><strong>{asset.title}</strong>{asset.description}</span></button>)}</div>
    </div> : <>
      <div className="vt-preview" role="tabpanel" id="vt-tabpanel" aria-labelledby={`vt-tab-${tabId}`}>{preview ? <AssetFrame asset={preview} /> : <p className="vt-empty">{tabs.find(tab => tab.id === tabId)?.empty}</p>}</div>
      {assets.length > 0 && <div className="vt-thumbnails">{assets.map(asset => <button key={asset.id} type="button" aria-label={asset.title} aria-pressed={preview?.id === asset.id} onClick={() => onAssetChange(asset.id)}><img src={asset.thumbnail ?? asset.poster ?? asset.url} alt="" /></button>)}</div>}
      {preview && <div className="vt-asset-detail">
        <h3>{preview.title}</h3>
        {preview.badge && <span className="vt-tag">{preview.badge}</span>}
        <p><RichText text={preview.description} /></p>
        <div className="vt-asset-actions">{preview.secondaryActions?.map(action => <button key={action.id} type="button">{action.label}</button>)}</div>
      </div>}
      {preview?.links && preview.links.length > 0 && <div className="vt-explore">{preview.links.map(link => <a key={link.id} href={link.href}>{link.label}</a>)}</div>}
    </>}
    <div className={status.state === 'idle' ? 'sr-only' : 'vt-status'} role="status">{statusText}{status.state === 'running' && status.progress !== undefined && <progress max={100} value={Math.min(100, Math.max(0, status.progress))} />}</div>
  </div>;
}
