'use client';

import { useState } from 'react';
import { ParameterField } from './parameter-field';
import { buildCreatePayload, modelForMedia, reconcileFieldValues, summaryFields, visibleWorkflows } from './state';
import type { FieldValue, ToolAsset, ToolField, VideoGenerationToolProps, VideoToolCopy } from './types';

function Mark({ icon }: { icon: string }) {
  const image = icon.startsWith('data:') || icon.startsWith('http:') || icon.startsWith('https:') || icon.startsWith('/');
  return <span className="vt-mark">{image ? <img src={icon} alt="" /> : <span aria-hidden="true">{icon}</span>}</span>;
}

function RichText({ text }: { text: string }) {
  return <>{text.split(/(@[^.,;]+)/g).map((part, index) => part.startsWith('@') ? <span className="vt-mention" key={index}>{part}</span> : <span key={index}>{part}</span>)}</>;
}

function summaryValue(field: ToolField, value: FieldValue | undefined, copy: VideoToolCopy) {
  if (field.type === 'number') return `${value ?? ''}${field.unit ?? ''}`;
  return copy.options[field.id]?.[String(value ?? '')] ?? String(value ?? '');
}

export function VideoGenerationTool({ config, copy, assets, status = { state: 'idle' }, onCreate }: VideoGenerationToolProps) {
  const initialMedia = config.media[0]?.id ?? '';
  const initialModel = modelForMedia(config, initialMedia);
  const [mediaId, setMediaId] = useState(initialMedia);
  const [modelId, setModelId] = useState(initialModel?.id ?? '');
  const [workflowId, setWorkflowId] = useState('');
  const [draft, setDraft] = useState('');
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [quantity, setQuantity] = useState(config.quantity.default);
  const [expanded, setExpanded] = useState(false);
  const [tabId, setTabId] = useState(config.tabs[0]?.id ?? '');
  const [assetId, setAssetId] = useState('');
  const [referenceIds, setReferenceIds] = useState<string[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const model = config.models.find(item => item.id === modelId);
  const workflows = model ? visibleWorkflows(config, mediaId, model) : [];
  const currentWorkflowId = workflows.some(item => item.id === workflowId) ? workflowId : workflows[0]?.id ?? '';
  const currentValues = model ? reconcileFieldValues(config.fields, model, values) : {};
  const enabledFields = config.fields.filter(field => model?.fieldIds.includes(field.id));
  const summary = model ? summaryFields(config.fields, model).map(field => summaryValue(field, currentValues[field.id], copy)).filter(Boolean).join(' · ') : '';
  const kinds = config.referenceKinds.filter(kind => (config.referenceLimits[kind.id] ?? 0) > 0);
  const tabAssets = [...assets, ...(status.state === 'done' && status.result ? [status.result] : [])].filter(asset => asset.tabId === tabId);
  const preview = tabAssets.find(asset => asset.id === assetId) ?? tabAssets[0];
  const mediaModels = config.models.filter(item => visibleWorkflows(config, mediaId, item).length > 0);

  function used(kind: string) {
    return referenceIds.filter(id => config.references.find(item => item.id === id)?.kind === kind).length;
  }

  function chooseMedia(nextMedia: string) {
    const nextModel = modelForMedia(config, nextMedia, model && visibleWorkflows(config, nextMedia, model).length ? model.id : undefined);
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

  const quantities = Array.from({ length: config.quantity.max - config.quantity.min + 1 }, (_, index) => config.quantity.min + index);

  return <div className="video-tool">
    <div className="vt-editor">
      <div className="vt-editor-main">
        <div className="vt-media" role="group" aria-label={copy.title}>{config.media.map(item => <button key={item.id} type="button" aria-pressed={mediaId === item.id} onClick={() => chooseMedia(item.id)}><Mark icon={item.icon} />{copy.media[item.id]}</button>)}</div>
        <div className="vt-workflows" role="group" aria-label={copy.workflowLabel}>{workflows.map(item => <button key={item.id} type="button" aria-pressed={currentWorkflowId === item.id} onClick={() => setWorkflowId(item.id)}><Mark icon={item.icon} />{copy.workflows[item.id]}</button>)}</div>
        <div className="vt-model">
          {model && <Mark icon={model.icon} />}
          <span className="vt-model-name">{model ? copy.models[model.id] : copy.model}</span>
          {model?.tags.map(tag => <span className={`vt-tag vt-tone-${tag.tone}`} key={tag.id}>{copy.tags[tag.id]}</span>)}
          <span className="vt-chevron" aria-hidden="true" />
          <select className="vt-model-select" aria-label={copy.model} value={modelId} onChange={event => chooseModel(event.target.value)}>
            {config.vendors.map(vendor => {
              const group = mediaModels.filter(item => item.vendorId === vendor.id);
              return group.length ? <optgroup key={vendor.id} label={copy.vendors[vendor.id]}>{group.map(item => <option key={item.id} value={item.id}>{copy.models[item.id]}{item.tags.map(tag => ` · ${copy.tags[tag.id]}`).join('')}</option>)}</optgroup> : null;
            })}
          </select>
        </div>
        <div className="vt-block">
          <h3>{copy.references.title}</h3>
          <div className="vt-limits">{kinds.map(kind => <span key={kind.id} aria-label={`${copy.references.limits[kind.id]} ${used(kind.id)}/${config.referenceLimits[kind.id]}`}><Mark icon={kind.icon} /><span aria-hidden="true">{used(kind.id)}/{config.referenceLimits[kind.id]}</span></span>)}</div>
          {referenceIds.length > 0 && <div className="vt-selected">{referenceIds.map(id => {
            const item = config.references.find(reference => reference.id === id);
            return item ? <button key={id} type="button" aria-label={copy.references.candidates[id]} onClick={() => toggleReference(id)}><img src={item.url} alt="" /></button> : null;
          })}</div>}
          <div className="vt-upload">
            <div className="vt-upload-icons" aria-hidden="true">{kinds.map(kind => <Mark key={kind.id} icon={kind.icon} />)}</div>
            <p>{copy.references.uploadHint}</p>
            <button type="button" className="vt-library-chip" aria-expanded={libraryOpen} onClick={() => setLibraryOpen(open => !open)}>{libraryOpen ? copy.references.closeLibrary : copy.references.library}</button>
          </div>
          {libraryOpen && <div className="vt-library">{config.references.map(item => <button key={item.id} type="button" aria-pressed={referenceIds.includes(item.id)} disabled={!referenceIds.includes(item.id) && used(item.kind) >= (config.referenceLimits[item.kind] ?? 0)} onClick={() => toggleReference(item.id)}><img src={item.url} alt="" /><span>{copy.references.candidates[item.id]}</span></button>)}</div>}
        </div>
        <div className="vt-prompt">
          <div className="vt-row"><label htmlFor="vt-prompt">{copy.prompt.title}</label>{copy.prompt.assist && <button type="button" className="vt-assist" onClick={() => setDraft((copy.prompt.suggestion ?? '').slice(0, copy.prompt.maxLength))}>{copy.prompt.assist}</button>}</div>
          <textarea id="vt-prompt" maxLength={copy.prompt.maxLength} placeholder={copy.prompt.placeholder} value={draft} onChange={event => setDraft(event.target.value)} />
        </div>
      </div>
      <div className="vt-dock">
        {expanded && <div className="vt-fields" id="vt-parameters">{model && enabledFields.map(field => <ParameterField key={field.id} field={field} model={model} copy={copy} references={config.references} value={currentValues[field.id]} onChange={value => setValues(previous => ({ ...previous, [field.id]: value }))} />)}</div>}
        <div className="vt-bar">
          <button type="button" className="vt-summary" aria-expanded={expanded} aria-controls="vt-parameters" onClick={() => setExpanded(open => !open)}>
            <span>{summary || copy.parameters}</span>
            <span className="vt-chevron" aria-hidden="true" />
          </button>
          <label className="vt-quantity">
            <span className="sr-only">{copy.quantity}</span>
            <select aria-label={copy.quantity} value={quantity} onChange={event => setQuantity(Math.min(config.quantity.max, Math.max(config.quantity.min, Number(event.target.value) || config.quantity.min)))}>{quantities.map(count => <option key={count} value={count}>{copy.quantityPrefix}{count}</option>)}</select>
            <span className="vt-chevron" aria-hidden="true" />
          </label>
        </div>
        <button className="vt-create" type="button" disabled={!model || !currentWorkflowId} onClick={() => { if (model && currentWorkflowId) onCreate(buildCreatePayload(model, currentWorkflowId, draft, quantity, currentValues, referenceIds)); }}>{model?.count === undefined ? copy.create : `${copy.create} (${model.count})`}</button>
        {config.promo && copy.promo && <a className="vt-promo" href={config.promo.href}><Mark icon={config.promo.icon} />{copy.promo}</a>}
      </div>
    </div>
    <div className="vt-gallery">
      <div className="vt-tabs" role="tablist" aria-label={copy.title}>{config.tabs.map(tab => <button key={tab.id} type="button" role="tab" id={`vt-tab-${tab.id}`} aria-controls="vt-tabpanel" aria-selected={tabId === tab.id} onClick={() => { setTabId(tab.id); setAssetId(''); }}>{copy.tabs[tab.id].label}</button>)}</div>
      <div className="vt-preview" role="tabpanel" id="vt-tabpanel" aria-labelledby={`vt-tab-${tabId}`}>{preview ? assetFrame(preview) : <p className="vt-empty">{copy.tabs[tabId]?.empty}</p>}</div>
      {tabAssets.length > 0 && <div className="vt-thumbnails">{tabAssets.map(asset => <button key={asset.id} type="button" aria-label={asset.title} aria-pressed={preview?.id === asset.id} onClick={() => setAssetId(asset.id)}><img src={asset.poster ?? asset.url} alt="" /></button>)}</div>}
      {preview && <div className="vt-asset-detail">
        {preview.badge && <span className="vt-tag">{preview.badge}</span>}
        <p><RichText text={preview.description} /></p>
        <div className="vt-asset-actions">{preview.secondaryActions?.map(action => <button key={action.id} type="button">{action.label}</button>)}</div>
      </div>}
      {preview?.links && preview.links.length > 0 && <div className="vt-explore">{preview.links.map(link => <a key={link.id} href={link.href}>{link.label}</a>)}</div>}
      <div className={status.state === 'idle' ? 'sr-only' : 'vt-status'} role="status">{copy.status[status.state]}{status.state === 'running' && status.progress !== undefined && <progress max={100} value={Math.min(100, Math.max(0, status.progress))} />}</div>
    </div>
  </div>;
}
