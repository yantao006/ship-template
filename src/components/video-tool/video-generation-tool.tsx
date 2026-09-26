'use client';

import { useEffect, useRef, useState } from 'react';
import { ParameterField } from './parameter-field';
import { buildCreatePayload, modelForMedia, previewCost, reconcileFieldValues, summaryFields, visibleWorkflows } from './state';
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
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [quantity, setQuantity] = useState(config.quantity.default);
  const [expanded, setExpanded] = useState(false);
  const [tabId, setTabId] = useState(config.tabs[0]?.id ?? '');
  const [assetId, setAssetId] = useState('');
  const [referenceIds, setReferenceIds] = useState<string[]>([]);
  const [frameReferences, setFrameReferences] = useState<{ start?: string; end?: string }>({});
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quantityOpen, setQuantityOpen] = useState(false);
  const [promoVisible, setPromoVisible] = useState(true);
  const [endFrame, setEndFrame] = useState(false);
  const [framePick, setFramePick] = useState<'start' | 'end'>('start');
  const editorRef = useRef<HTMLDivElement>(null);

  const draft = drafts[mediaId] ?? '';
  const model = config.models.find(item => item.id === modelId);
  const workflows = config.workflows.filter(item => item.mediaId === mediaId);
  const supportedWorkflows = model ? visibleWorkflows(config, mediaId, model) : [];
  const currentWorkflowId = supportedWorkflows.some(item => item.id === workflowId) ? workflowId : supportedWorkflows[0]?.id ?? '';
  const currentValues = model ? reconcileFieldValues(config.fields, model, values) : {};
  const enabledFields = config.fields.filter(field => model?.fieldIds.includes(field.id));
  const summary = model ? summaryFields(config.fields, model).map(field => summaryValue(field, currentValues[field.id], copy)).filter(Boolean).join(' · ') : '';
  const currentWorkflow = config.workflows.find(item => item.id === currentWorkflowId);
  const referenceLimits = currentWorkflow?.referenceLimits ?? config.referenceLimits;
  const framePair = currentWorkflow?.referencePresentation === 'frame-pair';
  const selectedReferenceIds = framePair ? [frameReferences.start, endFrame ? frameReferences.end : undefined].filter((id): id is string => !!id) : referenceIds;
  const kinds = config.referenceKinds.filter(kind => (referenceLimits[kind.id] ?? 0) > 0 && (!kind.mediaIds || kind.mediaIds.includes(mediaId)));
  const excludedAssetIds = new Set(config.assets.filter(item => item.mediaIds && !item.mediaIds.includes(mediaId)).map(item => item.id));
  const tabAssets = [...assets, ...(status.state === 'done' && status.result ? [status.result] : [])].filter(asset => asset.tabId === tabId && !excludedAssetIds.has(asset.id));
  const preview = tabAssets.find(asset => asset.id === assetId) ?? tabAssets[0];
  const mediaModels = config.models.filter(item => item.workflowIds.includes(currentWorkflowId));
  const templateMedia = config.galleryModes?.[mediaId] === 'template-grid';
  const templateGrid = templateMedia && tabId === config.tabs[0]?.id;
  const promptLimit = copy.prompt.maxLengthByMedia?.[mediaId] ?? copy.prompt.maxLength;

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      const target = event.target as Node;
      const root = editorRef.current;
      if (!root?.contains(target)) {
        setMenuOpen(false);
        setExpanded(false);
        setQuantityOpen(false);
        return;
      }
      if (!root.querySelector('.vt-model-wrap')?.contains(target)) setMenuOpen(false);
      if (!root.querySelector('.vt-quantity')?.contains(target)) setQuantityOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setExpanded(false);
        setQuantityOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function used(kind: string) {
    return selectedReferenceIds.filter(id => config.references.find(item => item.id === id)?.kind === kind).length;
  }

  function chooseMedia(nextMedia: string) {
    const nextModel = modelForMedia(config, nextMedia, model && visibleWorkflows(config, nextMedia, model).length ? model.id : undefined);
    setMediaId(nextMedia);
    setModelId(nextModel?.id ?? '');
    const nextWorkflows = nextModel ? visibleWorkflows(config, nextMedia, nextModel) : [];
    setWorkflowId(nextWorkflows.find(item => item.id === config.defaultWorkflowIdsByMedia?.[nextMedia])?.id ?? nextWorkflows[0]?.id ?? '');
    setValues(nextModel ? reconcileFieldValues(config.fields, nextModel, {}) : {});
    setAssetId('');
    setTabId(config.tabs[0]?.id ?? '');
    setReferenceIds([]);
    setFrameReferences({});
    setEndFrame(false);
    setExpanded(false);
    setLibraryOpen(false);
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
    setReferenceIds([]);
    setFrameReferences({});
    setEndFrame(false);
    setExpanded(false);
    setLibraryOpen(false);
  }

  function toggleReference(id: string) {
    const candidate = config.references.find(item => item.id === id);
    if (!candidate) return;
    setReferenceIds(previous => previous.includes(id) ? previous.filter(item => item !== id)
      : previous.filter(item => config.references.find(reference => reference.id === item)?.kind === candidate.kind).length < (referenceLimits[candidate.kind] ?? 0) ? [...previous, id] : previous);
  }

  function assetFrame(asset: ToolAsset) {
    return asset.type === 'image'
      ? <img src={asset.url} alt={asset.title} />
      : <video controls autoPlay muted loop playsInline preload="metadata" poster={asset.poster} src={asset.url} aria-label={asset.title} />;
  }

  const quantities = Array.from({ length: config.quantity.max - config.quantity.min + 1 }, (_, index) => config.quantity.min + index);
  const cost = model ? previewCost(model, currentValues, quantity) : undefined;
  const parameterPanel = expanded && <div className="vt-fields" id="vt-parameters">{model && enabledFields.map(field => <ParameterField key={field.id} field={field} model={model} copy={copy} references={config.references} value={currentValues[field.id]} onChange={value => setValues(previous => ({ ...previous, [field.id]: value }))} />)}</div>;

  return <div className="video-tool">
    <div className="vt-editor" ref={editorRef}>
      <div className={`vt-editor-main${menuOpen ? ' vt-menu-active' : ''}`}>
        <div className="vt-media" role="group" aria-label={copy.title}>{config.media.map(item => <button key={item.id} type="button" aria-pressed={mediaId === item.id} onClick={() => chooseMedia(item.id)}><Mark icon={item.icon} />{copy.media[item.id]}</button>)}</div>
        <div className="vt-workflows" role="group" aria-label={copy.workflowLabel}>{workflows.map(item => <button key={item.id} type="button" aria-pressed={currentWorkflowId === item.id} onClick={() => {
          const preferred = config.defaultModelIdsByWorkflow?.[item.id];
          const compatible = config.models.find(candidate => candidate.id === preferred && candidate.workflowIds.includes(item.id))
            ?? (model?.workflowIds.includes(item.id) ? model : config.models.find(candidate => candidate.workflowIds.includes(item.id)));
          if (compatible) {
            setModelId(compatible.id);
            setValues(reconcileFieldValues(config.fields, compatible, config.defaultFieldValuesByWorkflow?.[item.id] ?? {}));
          }
          setWorkflowId(item.id); setReferenceIds([]); setFrameReferences({}); setEndFrame(false); setExpanded(false); setLibraryOpen(false); setQuantity(config.quantity.default);
        }}><Mark icon={item.icon} />{copy.workflows[item.id]}</button>)}</div>
        <div className="vt-model-wrap">
          <button type="button" className="vt-model" aria-label={copy.model} aria-haspopup="listbox" aria-expanded={menuOpen} onClick={() => { setMenuOpen(open => !open); setExpanded(false); setQuantityOpen(false); }}>
            {model && <Mark icon={model.icon} />}
            <span className="vt-model-name">{model ? copy.models[model.id] : copy.model}</span>
            {model?.tags.map(tag => <span className={`vt-tag vt-tone-${tag.tone}`} key={tag.id}>{tag.icon && <Mark icon={tag.icon} />}{copy.tags[tag.id]}</span>)}
            <span className="vt-chevron" aria-hidden="true" />
          </button>
          {menuOpen && <div className="vt-model-menu" role="listbox" aria-label={copy.model}>
            {config.vendors.map(vendor => {
              const group = mediaModels.filter(item => item.vendorId === vendor.id);
              if (!group.length) return null;
              return <div key={vendor.id} className="vt-vendor">
                <div className="vt-vendor-row"><Mark icon={vendor.icon ?? group[0].icon} /><span>{copy.vendors[vendor.id]}</span><b>{group.length}</b></div>
                {group.map(item => <button key={item.id} type="button" role="option" aria-selected={item.id === modelId} className={item.id === modelId ? 'is-selected' : undefined} onClick={() => { chooseModel(item.id); setMenuOpen(false); }}>
                  <Mark icon={item.icon} />
                  <span className="vt-model-copy"><span>{copy.models[item.id]}</span>{copy.modelSubtitles?.[item.id] && <small>{copy.modelSubtitles[item.id]}</small>}</span>
                  {item.tags.map(tag => <em className={`vt-tag vt-tone-${tag.tone}`} key={tag.id}>{tag.icon && <Mark icon={tag.icon} />}{copy.tags[tag.id]}</em>)}
                  {item.id === modelId && <span className="vt-check" aria-hidden="true">✓</span>}
                </button>)}
              </div>;
            })}
          </div>}
        </div>
        {kinds.length > 0 && <div className="vt-block">
          <div className="vt-reference-head"><h3>{copy.references.titleByWorkflow?.[currentWorkflowId] ?? copy.references.title}</h3>
            {framePair && <button type="button" className="vt-end-toggle" aria-pressed={endFrame} onClick={() => { setEndFrame(open => !open); if (endFrame) setFrameReferences(previous => ({ start: previous.start })); }}>{copy.references.endFrame} {endFrame ? '●' : '○'}</button>}
            {templateMedia && kinds.map(kind => <span key={kind.id} aria-label={`${copy.references.limits[kind.id]} ${used(kind.id)}/${referenceLimits[kind.id]}`}>{used(kind.id)} / {referenceLimits[kind.id]}</span>)}
          </div>
          {framePair ? (endFrame ? ['start', 'end'] as const : ['start'] as const).map(slot => <div className="vt-frame-upload" key={slot}>
            {frameReferences[slot] ? <img src={config.references.find(item => item.id === frameReferences[slot])?.url} alt="" /> : <Mark icon={kinds[0].icon} />}
            <span>{slot === 'start' ? copy.references.startFrame : copy.references.endFrame}</span>
            <button type="button" className="vt-library-chip" onClick={() => { setFramePick(slot); setLibraryOpen(true); }}>{copy.references.library}</button>
          </div>) : <>
            {!templateMedia && <div className="vt-limits">{kinds.map(kind => <span key={kind.id} aria-label={`${copy.references.limits[kind.id]} ${used(kind.id)}/${referenceLimits[kind.id]}`}><Mark icon={kind.icon} /><span aria-hidden="true">{used(kind.id)}/{referenceLimits[kind.id]}</span></span>)}</div>}
            {referenceIds.length > 0 && <div className="vt-selected">{referenceIds.map(id => {
              const item = config.references.find(reference => reference.id === id);
              return item ? <button key={id} type="button" aria-label={copy.references.candidates[id]} onClick={() => toggleReference(id)}><img src={item.thumbnail ?? item.url} alt="" /></button> : null;
            })}</div>}
            <div className="vt-upload">
              <div className="vt-upload-icons" aria-hidden="true">{kinds.map(kind => <Mark key={kind.id} icon={kind.icon} />)}</div>
              <p>{copy.references.hintsByWorkflow?.[currentWorkflowId] ?? copy.references.uploadHintByMedia?.[mediaId] ?? copy.references.uploadHint}</p>
              <button type="button" className="vt-library-chip" aria-expanded={libraryOpen} onClick={() => setLibraryOpen(open => !open)}>{libraryOpen ? copy.references.closeLibrary : copy.references.library}</button>
            </div>
          </>}
          {libraryOpen && <div className="vt-library">{config.references.filter(item => kinds.some(kind => kind.id === item.kind)).map(item => <button key={item.id} type="button" aria-pressed={selectedReferenceIds.includes(item.id)} disabled={!framePair && !selectedReferenceIds.includes(item.id) && used(item.kind) >= (referenceLimits[item.kind] ?? 0)} onClick={() => {
            if (framePair) {
              setFrameReferences(previous => ({ ...previous, [framePick]: item.id }));
              setLibraryOpen(false);
            } else toggleReference(item.id);
          }}><img src={item.thumbnail ?? item.url} alt="" /><span>{copy.references.candidates[item.id]}</span></button>)}</div>}
        </div>}
        <div className="vt-prompt">
          <div className="vt-row"><label htmlFor="vt-prompt">{copy.prompt.titleByWorkflow?.[currentWorkflowId] ?? copy.prompt.title}</label>{copy.prompt.assist && <button type="button" className="vt-assist" onClick={() => setDrafts(previous => ({ ...previous, [mediaId]: (copy.prompt.suggestion ?? '').slice(0, promptLimit) }))}>{copy.prompt.assist}</button>}</div>
          <textarea id="vt-prompt" maxLength={promptLimit} placeholder={copy.prompt.placeholderByWorkflow?.[currentWorkflowId] ?? copy.prompt.placeholderByMedia?.[mediaId] ?? copy.prompt.placeholder} value={draft} onChange={event => setDrafts(previous => ({ ...previous, [mediaId]: event.target.value }))} />
          <span className="vt-prompt-count" aria-live="polite">{draft.length}/{promptLimit}</span>
        </div>
      </div>
      <div className="vt-dock">
        <div className="vt-bar">
          <button type="button" className="vt-summary" aria-expanded={expanded} aria-controls="vt-parameters" onClick={() => { setExpanded(open => !open); setMenuOpen(false); setQuantityOpen(false); }}>
            <span>{summary || copy.parameters}</span>
            <span className="vt-chevron" aria-hidden="true" />
          </button>
          <div className="vt-quantity">
            <button type="button" aria-label={copy.quantity} aria-haspopup="listbox" aria-expanded={quantityOpen} onClick={() => { setQuantityOpen(open => !open); setMenuOpen(false); setExpanded(false); }}>{copy.quantityPrefix}{quantity}<span className="vt-chevron" aria-hidden="true" /></button>
            {quantityOpen && <div className="vt-quantity-menu" role="listbox" aria-label={copy.quantity}>{quantities.map(count => <button key={count} type="button" role="option" aria-selected={count === quantity} onClick={() => { setQuantity(count); setQuantityOpen(false); }}>{copy.quantityPrefix}{count}</button>)}</div>}
          </div>
        </div>
        {parameterPanel}
        <button className="vt-create" type="button" disabled={!model || !currentWorkflowId} onClick={() => { if (model && currentWorkflowId) onCreate(buildCreatePayload(model, currentWorkflowId, draft, quantity, currentValues, selectedReferenceIds, framePair ? frameReferences : undefined)); }}>{cost === undefined ? copy.create : `${copy.create} (${cost})`}</button>
        {promoVisible && config.promo && copy.promo && <div className="vt-promo"><a href={config.promo.href}><Mark icon={config.promo.icon} />{copy.promo}</a>{copy.promoDismiss && <button type="button" aria-label={copy.promoDismiss} onClick={() => setPromoVisible(false)}>×</button>}</div>}
      </div>
    </div>
    <div className="vt-gallery">
      <div className="vt-tabs" role="tablist" aria-label={copy.title}>{config.tabs.map(tab => <button key={tab.id} type="button" role="tab" id={`vt-tab-${tab.id}`} aria-controls="vt-tabpanel" aria-selected={tabId === tab.id} onClick={() => { setTabId(tab.id); setAssetId(''); }}>{copy.tabs[tab.id].labelByMedia?.[mediaId] ?? copy.tabs[tab.id].label}</button>)}</div>
      {templateGrid ? <div className="vt-template-gallery" role="tabpanel" id="vt-tabpanel" aria-labelledby={`vt-tab-${tabId}`}>
        {copy.galleryHeadings?.[mediaId] && <h3>{copy.galleryHeadings[mediaId]}</h3>}
        <div className="vt-template-grid">{tabAssets.map(asset => <button key={asset.id} className="vt-template-card" type="button" aria-label={`${asset.title}: ${asset.description}`} aria-pressed={asset.id === assetId} onClick={() => setAssetId(asset.id)}><img src={asset.url} alt="" loading="lazy" /><span><strong>{asset.title}</strong>{asset.description}</span></button>)}</div>
      </div> : <>
        <div className="vt-preview" role="tabpanel" id="vt-tabpanel" aria-labelledby={`vt-tab-${tabId}`}>{preview ? assetFrame(preview) : <p className="vt-empty">{copy.tabs[tabId]?.empty}</p>}</div>
        {tabAssets.length > 0 && <div className="vt-thumbnails">{tabAssets.map(asset => <button key={asset.id} type="button" aria-label={asset.title} aria-pressed={preview?.id === asset.id} onClick={() => setAssetId(asset.id)}><img src={asset.thumbnail ?? asset.poster ?? asset.url} alt="" /></button>)}</div>}
        {preview && <div className="vt-asset-detail">
          <h3>{preview.title}</h3>
          {preview.badge && <span className="vt-tag">{preview.badge}</span>}
          <p><RichText text={preview.description} /></p>
          <div className="vt-asset-actions">{preview.secondaryActions?.map(action => <button key={action.id} type="button">{action.label}</button>)}</div>
        </div>}
        {preview?.links && preview.links.length > 0 && <div className="vt-explore">{preview.links.map(link => <a key={link.id} href={link.href}>{link.label}</a>)}</div>}
      </>}
      <div className={status.state === 'idle' ? 'sr-only' : 'vt-status'} role="status">{copy.status[status.state]}{status.state === 'running' && status.progress !== undefined && <progress max={100} value={Math.min(100, Math.max(0, status.progress))} />}</div>
    </div>
  </div>;
}
