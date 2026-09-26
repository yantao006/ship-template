'use client';

import { useState } from 'react';
import { buildCreatePayload, fieldStops, modelForMedia, previewCost, reconcileFieldValues, summaryFields, visibleWorkflows } from './state';
import type { ComposerProps } from './composer';
import type { ModelMenuItem } from './model-menu';
import type { ParameterFieldProps } from './parameter-field';
import type { StageProps } from './stage';
import type { FieldValue, ToolModel, VideoGenerationToolProps } from './types';

export function useVideoToolState({ config, copy, assets, status = { state: 'idle' }, onCreate }: VideoGenerationToolProps): { composer: ComposerProps; stage: StageProps } {
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

  const draft = drafts[mediaId] ?? '';
  const model = config.models.find(item => item.id === modelId);
  const workflows = config.workflows.filter(item => item.mediaId === mediaId);
  const supportedWorkflows = model ? visibleWorkflows(config, mediaId, model) : [];
  const currentWorkflowId = supportedWorkflows.some(item => item.id === workflowId) ? workflowId : supportedWorkflows[0]?.id ?? '';
  const currentWorkflow = config.workflows.find(item => item.id === currentWorkflowId);
  const currentValues = model ? reconcileFieldValues(config.fields, model, values) : {};
  const enabledFields = config.fields.filter(field => model?.fieldIds.includes(field.id)).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const summary = model ? summaryFields(config.fields, model).map(field => {
    const value = currentValues[field.id];
    return field.type === 'number' ? `${value ?? ''}${field.unit ?? ''}` : copy.options[field.id]?.[String(value ?? '')] ?? String(value ?? '');
  }).filter(Boolean).join(' · ') : '';
  const referenceLimits = currentWorkflow?.referenceLimits ?? config.referenceLimits;
  const framePair = currentWorkflow?.referencePresentation === 'frame-pair';
  const selectedReferenceIds = framePair ? [frameReferences.start, endFrame ? frameReferences.end : undefined].filter((id): id is string => !!id) : referenceIds;
  const kinds = config.referenceKinds.filter(kind => (referenceLimits[kind.id] ?? 0) > 0 && (!kind.mediaIds || kind.mediaIds.includes(mediaId)));
  const used = (kind: string) => selectedReferenceIds.filter(id => config.references.find(item => item.id === id)?.kind === kind).length;
  const templateMedia = config.galleryModes?.[mediaId] === 'template-grid';
  const promptLimit = copy.prompt.maxLengthByMedia?.[mediaId] ?? copy.prompt.maxLength;

  function resetReferences() {
    setReferenceIds([]);
    setFrameReferences({});
    setEndFrame(false);
    setExpanded(false);
    setLibraryOpen(false);
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
    resetReferences();
  }

  function chooseWorkflow(nextId: string) {
    const preferred = config.defaultModelIdsByWorkflow?.[nextId];
    const compatible = config.models.find(candidate => candidate.id === preferred && candidate.workflowIds.includes(nextId))
      ?? (model?.workflowIds.includes(nextId) ? model : config.models.find(candidate => candidate.workflowIds.includes(nextId)));
    if (compatible) {
      setModelId(compatible.id);
      setValues(reconcileFieldValues(config.fields, compatible, config.defaultFieldValuesByWorkflow?.[nextId] ?? {}));
    }
    setWorkflowId(nextId);
    setQuantity(config.quantity.default);
    resetReferences();
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
    resetReferences();
    setMenuOpen(false);
  }

  function chooseReference(id: string) {
    const candidate = config.references.find(item => item.id === id);
    if (!candidate) return;
    if (framePair) {
      setFrameReferences(previous => ({ ...previous, [framePick]: id }));
      setLibraryOpen(false);
      return;
    }
    setReferenceIds(previous => previous.includes(id) ? previous.filter(item => item !== id)
      : previous.filter(item => config.references.find(reference => reference.id === item)?.kind === candidate.kind).length < (referenceLimits[candidate.kind] ?? 0) ? [...previous, id] : previous);
  }

  function bindModel(item: ToolModel): ModelMenuItem {
    return {
      id: item.id, icon: item.icon, label: copy.models[item.id], subtitle: copy.modelSubtitles?.[item.id],
      tags: item.tags.map(tag => ({ id: tag.id, icon: tag.icon, tone: tag.tone, label: copy.tags[tag.id] })),
    };
  }

  const mediaModels = config.models.filter(item => item.workflowIds.includes(currentWorkflowId));
  const groups = config.vendors.flatMap(vendor => {
    const models = mediaModels.filter(item => item.vendorId === vendor.id);
    return models.length ? [{ id: vendor.id, icon: vendor.icon ?? models[0].icon, label: copy.vendors[vendor.id], models: models.map(bindModel) }] : [];
  });
  const fieldProps: ParameterFieldProps[] = model ? enabledFields.map(field => ({
    id: field.id, type: field.type, label: copy.fields[field.id], value: currentValues[field.id],
    presentation: field.presentation, unit: field.unit, switchStates: copy.switchStates,
    stops: fieldStops(field, model), uploadHint: copy.references.uploadHint,
    options: field.type === 'upload' ? config.references.map(item => ({ value: item.id, label: copy.references.candidates[item.id] }))
      : (model.options[field.id] ?? []).map(value => ({ value, label: copy.options[field.id]?.[value] ?? value })),
    onChange: value => setValues(previous => ({ ...previous, [field.id]: value })),
  })) : [];
  const referenceItems = config.references.filter(item => kinds.some(kind => kind.id === item.kind)).map(item => ({
    ...item, label: copy.references.candidates[item.id], selected: selectedReferenceIds.includes(item.id),
    disabled: !framePair && !selectedReferenceIds.includes(item.id) && used(item.kind) >= (referenceLimits[item.kind] ?? 0),
  }));
  const cost = model ? previewCost(model, currentValues, quantity) : undefined;
  const composer: ComposerProps = {
    title: copy.title, workflowLabel: copy.workflowLabel,
    media: config.media.map(item => ({ ...item, label: copy.media[item.id], selected: item.id === mediaId })),
    workflows: workflows.map(item => ({ ...item, label: copy.workflows[item.id], selected: item.id === currentWorkflowId })),
    modelMenu: { label: copy.model, selectedId: modelId, selected: model && bindModel(model), groups, open: menuOpen,
      onToggle: () => { setMenuOpen(open => !open); setExpanded(false); setQuantityOpen(false); }, onSelect: chooseModel },
    references: kinds.length ? {
      title: copy.references.titleByWorkflow?.[currentWorkflowId] ?? copy.references.title,
      kinds: kinds.map(kind => ({ id: kind.id, icon: kind.icon, label: copy.references.limits[kind.id], used: used(kind.id), limit: referenceLimits[kind.id] })),
      items: referenceItems, selectedItems: referenceIds.flatMap(id => referenceItems.find(item => item.id === id) ?? []),
      templateMedia, framePair, endFrame, frames: frameReferences,
      startFrameLabel: copy.references.startFrame, endFrameLabel: copy.references.endFrame,
      uploadHint: copy.references.hintsByWorkflow?.[currentWorkflowId] ?? copy.references.uploadHintByMedia?.[mediaId] ?? copy.references.uploadHint,
      libraryLabel: copy.references.library, closeLibraryLabel: copy.references.closeLibrary, libraryOpen,
    } : undefined,
    prompt: { title: copy.prompt.titleByWorkflow?.[currentWorkflowId] ?? copy.prompt.title, assist: copy.prompt.assist,
      placeholder: copy.prompt.placeholderByWorkflow?.[currentWorkflowId] ?? copy.prompt.placeholderByMedia?.[mediaId] ?? copy.prompt.placeholder,
      maxLength: promptLimit, value: draft },
    parameters: { summary, fallbackLabel: copy.parameters, expanded, fields: fieldProps },
    quantity: { label: copy.quantity, prefix: copy.quantityPrefix, value: quantity,
      values: Array.from({ length: config.quantity.max - config.quantity.min + 1 }, (_, index) => config.quantity.min + index), open: quantityOpen },
    create: { label: cost === undefined ? copy.create : `${copy.create} (${cost})`, disabled: !model || !currentWorkflowId },
    promo: promoVisible && config.promo && copy.promo ? { icon: config.promo.icon, href: config.promo.href, label: copy.promo, dismissLabel: copy.promoDismiss } : undefined,
    actions: {
      onMedia: chooseMedia, onWorkflow: chooseWorkflow,
      onEndFrame: () => { setEndFrame(open => !open); if (endFrame) setFrameReferences(previous => ({ start: previous.start })); },
      onFramePick: slot => { setFramePick(slot); setLibraryOpen(true); },
      onReference: chooseReference, onLibraryToggle: () => setLibraryOpen(open => !open),
      onPrompt: value => setDrafts(previous => ({ ...previous, [mediaId]: value })),
      onAssist: () => setDrafts(previous => ({ ...previous, [mediaId]: (copy.prompt.suggestion ?? '').slice(0, promptLimit) })),
      onSummaryToggle: () => { setExpanded(open => !open); setMenuOpen(false); setQuantityOpen(false); },
      onQuantityToggle: () => { setQuantityOpen(open => !open); setMenuOpen(false); setExpanded(false); },
      onQuantity: value => { setQuantity(value); setQuantityOpen(false); },
      onCreate: () => { if (model && currentWorkflowId) onCreate(buildCreatePayload(model, currentWorkflowId, draft, quantity, currentValues, selectedReferenceIds, framePair ? frameReferences : undefined)); },
      onPromoDismiss: () => setPromoVisible(false),
      onOutside: () => { setMenuOpen(false); setExpanded(false); setQuantityOpen(false); },
      onCloseMenu: () => setMenuOpen(false), onCloseQuantity: () => setQuantityOpen(false),
    },
  };
  const excludedAssetIds = new Set(config.assets.filter(item => item.mediaIds && !item.mediaIds.includes(mediaId)).map(item => item.id));
  const currentAssets = [...assets, ...(status.state === 'done' && status.result ? [status.result] : [])].filter(asset => asset.tabId === tabId && !excludedAssetIds.has(asset.id));
  const stage: StageProps = {
    title: copy.title,
    tabs: config.tabs.map(item => ({ id: item.id, label: copy.tabs[item.id].labelByMedia?.[mediaId] ?? copy.tabs[item.id].label, empty: copy.tabs[item.id].empty })),
    tabId, onTabChange: id => { setTabId(id); setAssetId(''); },
    assets: currentAssets, assetId, onAssetChange: setAssetId,
    templateGrid: templateMedia && tabId === config.tabs[0]?.id, galleryHeading: copy.galleryHeadings?.[mediaId],
    status, statusText: copy.status[status.state],
  };
  return { composer, stage };
}
