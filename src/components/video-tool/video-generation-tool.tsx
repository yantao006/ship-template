'use client';

import { useState } from 'react';
import { ParameterField } from './parameter-field';
import { buildCreatePayload, reconcileFieldValues, visibleWorkflows } from './state';
import type { ToolAsset, VideoGenerationToolProps } from './types';

export function VideoGenerationTool({ config, copy, assets, status = { state: 'idle' }, onCreate }: VideoGenerationToolProps) {
  const [mediaId, setMediaId] = useState(config.media[0]?.id ?? '');
  const [modelId, setModelId] = useState(config.models.find(model => visibleWorkflows(config, config.media[0]?.id ?? '', model).length)?.id ?? '');
  const [workflowId, setWorkflowId] = useState('');
  const [draft, setDraft] = useState('');
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [quantity, setQuantity] = useState(config.quantity.default);
  const [expanded, setExpanded] = useState(true);
  const [tabId, setTabId] = useState(config.tabs[0]?.id ?? '');
  const [assetId, setAssetId] = useState('');
  const [referenceIds, setReferenceIds] = useState<string[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const model = config.models.find(item => item.id === modelId);
  const workflows = model ? visibleWorkflows(config, mediaId, model) : [];
  const currentWorkflowId = workflows.some(item => item.id === workflowId) ? workflowId : workflows[0]?.id ?? '';
  const currentValues = model ? reconcileFieldValues(config.fields, model, values) : {};
  const enabledFields = config.fields.filter(field => model?.fieldIds.includes(field.id));
  const tabAssets = [...assets, ...(status.state === 'done' && status.result ? [status.result] : [])].filter(asset => asset.tabId === tabId);
  const preview = tabAssets.find(asset => asset.id === assetId) ?? tabAssets[0];

  function chooseMedia(nextMedia: string) {
    const nextModel = config.models.find(item => item.id === modelId && visibleWorkflows(config, nextMedia, item).length) ?? config.models.find(item => visibleWorkflows(config, nextMedia, item).length);
    setMediaId(nextMedia);
    setModelId(nextModel?.id ?? '');
    setWorkflowId(nextModel ? visibleWorkflows(config, nextMedia, nextModel)[0]?.id ?? '' : '');
    setValues(nextModel ? reconcileFieldValues(config.fields, nextModel, currentValues) : {});
  }

  function chooseModel(nextId: string) {
    const nextModel = config.models.find(item => item.id === nextId);
    if (!nextModel) return;
    const nextMedia = visibleWorkflows(config, mediaId, nextModel).length ? mediaId : config.media.find(item => visibleWorkflows(config, item.id, nextModel).length)?.id ?? mediaId;
    const nextWorkflows = visibleWorkflows(config, nextMedia, nextModel);
    setModelId(nextId);
    setMediaId(nextMedia);
    setWorkflowId(nextWorkflows.some(item => item.id === currentWorkflowId) ? currentWorkflowId : nextWorkflows[0]?.id ?? '');
    setValues(reconcileFieldValues(config.fields, nextModel, currentValues));
  }

  function toggleReference(id: string) {
    const candidate = config.references.find(item => item.id === id);
    if (!candidate) return;
    setReferenceIds(previous => previous.includes(id) ? previous.filter(item => item !== id)
      : previous.filter(item => config.references.find(reference => reference.id === item)?.kind === candidate.kind).length < (config.referenceLimits[candidate.kind] ?? 0) ? [...previous, id] : previous);
  }

  function assetFrame(asset: ToolAsset) {
    return asset.type === 'image'
      ? <img src={asset.url} alt={asset.title} />
      : <video controls preload="none" poster={asset.poster} src={asset.url} aria-label={asset.title} />;
  }

  return <div className="video-tool">
    <div className="vt-editor">
      <div className="vt-media" role="group" aria-label={copy.title}>{config.media.map(item => <button key={item.id} type="button" aria-pressed={mediaId === item.id} onClick={() => chooseMedia(item.id)}><span aria-hidden="true">{item.icon}</span> {copy.media[item.id]}</button>)}</div>
      <div className="vt-workflows" role="group" aria-label={copy.workflowLabel}>{workflows.map(item => <button key={item.id} type="button" aria-pressed={currentWorkflowId === item.id} onClick={() => setWorkflowId(item.id)}><span aria-hidden="true">{item.icon}</span> {copy.workflows[item.id]}</button>)}</div>
      <label className="vt-field vt-model" htmlFor="vt-model"><span>{copy.model}</span><select id="vt-model" value={modelId} onChange={event => chooseModel(event.target.value)}>{config.vendors.map(vendor => <optgroup key={vendor.id} label={copy.vendors[vendor.id]}>{config.models.filter(item => item.vendorId === vendor.id).map(item => <option key={item.id} value={item.id}>{item.icon} {copy.models[item.id]}{item.tags.map(tag => ` · ${copy.tags[tag.id]}`).join('')}</option>)}</optgroup>)}</select></label>
      {model && <div className="vt-model-meta"><span>{model.icon} {copy.vendors[model.vendorId]} / {copy.models[model.id]}</span>{model.tags.map(tag => <span className={`vt-tag vt-tone-${tag.tone}`} key={tag.id}>{copy.tags[tag.id]}</span>)}</div>}
      <div className="vt-block"><div className="vt-row"><h3>{copy.references.title}</h3><button type="button" className="vt-link-button" aria-expanded={libraryOpen} onClick={() => setLibraryOpen(!libraryOpen)}>{libraryOpen ? copy.references.closeLibrary : copy.references.library}</button></div>
        <p className="vt-upload">{copy.references.uploadHint}</p>
        <div className="vt-limits">{Object.entries(config.referenceLimits).map(([kind, max]) => <span key={kind}>{copy.references.limits[kind]} {referenceIds.filter(id => config.references.find(item => item.id === id)?.kind === kind).length}/{max}</span>)}</div>
        {libraryOpen && <div className="vt-library">{config.references.map(item => <button key={item.id} type="button" aria-pressed={referenceIds.includes(item.id)} disabled={!referenceIds.includes(item.id) && referenceIds.filter(id => config.references.find(reference => reference.id === id)?.kind === item.kind).length >= (config.referenceLimits[item.kind] ?? 0)} onClick={() => toggleReference(item.id)}><img src={item.url} alt="" /><span>{copy.references.candidates[item.id]}</span></button>)}</div>}
      </div>
      <div className="vt-block"><div className="vt-row"><label htmlFor="vt-prompt" className="vt-heading">{copy.prompt.title}</label>{copy.prompt.assist && <button type="button" className="vt-link-button" onClick={() => setDraft(copy.prompt.suggestion?.slice(0, copy.prompt.maxLength) ?? '')}>{copy.prompt.assist}</button>}</div><textarea id="vt-prompt" maxLength={copy.prompt.maxLength} placeholder={copy.prompt.placeholder} value={draft} onChange={event => setDraft(event.target.value)} /><div className="vt-counter">{draft.length}/{copy.prompt.maxLength}</div></div>
      <div className="vt-block"><div className="vt-row"><h3>{copy.parameters}</h3><button type="button" className="vt-link-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? copy.collapse : copy.expand}</button></div>{expanded && <div className="vt-fields">{model && enabledFields.map(field => <ParameterField key={field.id} field={field} model={model} copy={copy} references={config.references} value={currentValues[field.id]} onChange={value => setValues(previous => ({ ...previous, [field.id]: value }))} />)}</div>}</div>
      <div className="vt-submit"><label className="vt-field" htmlFor="vt-quantity"><span>{copy.quantity}</span><input id="vt-quantity" type="number" min={config.quantity.min} max={config.quantity.max} value={quantity} onChange={event => setQuantity(Math.min(config.quantity.max, Math.max(config.quantity.min, Number(event.target.value) || config.quantity.min)))} /></label><button className="vt-create" type="button" disabled={!model || !currentWorkflowId} onClick={() => { if (model && currentWorkflowId) onCreate(buildCreatePayload(model, currentWorkflowId, draft, quantity, currentValues, referenceIds)); }}>{model?.count === undefined ? copy.create : `${copy.create} (${model.count})`}</button></div>
      {config.promo && copy.promo && <a className="vt-promo" href={config.promo.href}><span aria-hidden="true">{config.promo.icon}</span> {copy.promo}</a>}
    </div>
    <div className="vt-gallery"><div className="vt-tabs" role="tablist" aria-label={copy.title}>{config.tabs.map(tab => <button key={tab.id} type="button" role="tab" id={`vt-tab-${tab.id}`} aria-controls="vt-tabpanel" aria-selected={tabId === tab.id} onClick={() => { setTabId(tab.id); setAssetId(''); }}>{copy.tabs[tab.id].label}</button>)}</div>
      <div className="vt-preview" role="tabpanel" id="vt-tabpanel" aria-labelledby={`vt-tab-${tabId}`}>{preview ? assetFrame(preview) : <p className="vt-empty">{copy.tabs[tabId]?.empty}</p>}</div>
      {tabAssets.length > 0 && <div className="vt-thumbnails">{tabAssets.map(asset => <button key={asset.id} type="button" aria-label={asset.title} aria-pressed={preview?.id === asset.id} onClick={() => setAssetId(asset.id)}><img src={asset.poster ?? asset.url} alt="" /></button>)}</div>}
      {preview && <div className="vt-asset-detail"><div className="vt-row"><h3>{preview.title}</h3>{preview.badge && <span className="vt-tag">{preview.badge}</span>}</div><p>{preview.description}</p><div className="vt-asset-actions">{preview.secondaryActions?.map(action => <button key={action.id} type="button">{action.label}</button>)}</div>{preview.footerLink && <a href={preview.footerLink.href}>{preview.footerLink.label}</a>}</div>}
      <div className="vt-status" role="status">{copy.status[status.state]}{status.state === 'running' && status.progress !== undefined && <progress max={100} value={Math.min(100, Math.max(0, status.progress))} />}</div>
    </div>
  </div>;
}
