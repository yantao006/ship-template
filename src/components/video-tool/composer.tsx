'use client';

import { useEffect, useRef } from 'react';
import { Mark } from './mark';
import { ModelMenu, type ModelMenuProps } from './model-menu';
import { ParameterField, type ParameterFieldProps } from './parameter-field';

type Choice = { id: string; icon: string; label: string; selected: boolean };
type ReferenceItem = { id: string; kind: string; url: string; thumbnail?: string; label: string; selected: boolean; disabled: boolean };
type ReferenceView = {
  title: string; kinds: { id: string; icon: string; label: string; used: number; limit: number }[];
  items: ReferenceItem[]; selectedItems: ReferenceItem[]; templateMedia: boolean;
  framePair: boolean; endFrame: boolean; frames: { start?: string; end?: string };
  startFrameLabel?: string; endFrameLabel?: string;
  uploadHint: string; libraryLabel: string; closeLibraryLabel: string; libraryOpen: boolean;
};

export type ComposerProps = {
  title: string; workflowLabel: string;
  media: Choice[]; workflows: Choice[]; modelMenu: ModelMenuProps;
  references?: ReferenceView;
  prompt: { title: string; assist?: string; placeholder: string; value: string; maxLength: number };
  parameters: { summary: string; fallbackLabel: string; expanded: boolean; fields: ParameterFieldProps[] };
  quantity: { label: string; prefix: string; value: number; values: number[]; open: boolean };
  create: { label: string; disabled: boolean };
  promo?: { icon: string; label: string; href: string; dismissLabel?: string };
  actions: {
    onMedia: (id: string) => void; onWorkflow: (id: string) => void;
    onEndFrame: () => void; onFramePick: (slot: 'start' | 'end') => void;
    onReference: (id: string) => void; onLibraryToggle: () => void;
    onPrompt: (value: string) => void; onAssist: () => void;
    onSummaryToggle: () => void; onQuantityToggle: () => void; onQuantity: (value: number) => void;
    onCreate: () => void; onPromoDismiss: () => void;
    onOutside: () => void; onCloseMenu: () => void; onCloseQuantity: () => void;
  };
};

function References({ view, actions }: { view: ReferenceView; actions: ComposerProps['actions'] }) {
  const used = (kind: ReferenceView['kinds'][number]) => `${kind.used}/${kind.limit}`;
  return <div className="vt-block">
    <div className="vt-reference-head"><h3>{view.title}</h3>
      {view.framePair && <button type="button" className="vt-end-toggle" aria-pressed={view.endFrame} onClick={actions.onEndFrame}>{view.endFrameLabel} {view.endFrame ? '●' : '○'}</button>}
      {view.templateMedia && view.kinds.map(kind => <span key={kind.id} aria-label={`${kind.label} ${used(kind)}`}>{kind.used} / {kind.limit}</span>)}
    </div>
    {view.framePair ? (view.endFrame ? ['start', 'end'] as const : ['start'] as const).map(slot => <div className="vt-frame-upload" key={slot}>
      {view.frames[slot] ? <img src={view.items.find(item => item.id === view.frames[slot])?.thumbnail ?? view.items.find(item => item.id === view.frames[slot])?.url} alt="" /> : <Mark icon={view.kinds[0].icon} />}
      <span>{slot === 'start' ? view.startFrameLabel : view.endFrameLabel}</span>
      <button type="button" className="vt-library-chip" onClick={() => actions.onFramePick(slot)}>{view.libraryLabel}</button>
    </div>) : <>
      {!view.templateMedia && <div className="vt-limits">{view.kinds.map(kind => <span key={kind.id} aria-label={`${kind.label} ${used(kind)}`}><Mark icon={kind.icon} /><span aria-hidden="true">{used(kind)}</span></span>)}</div>}
      {view.selectedItems.length > 0 && <div className="vt-selected">{view.selectedItems.map(item => <button key={item.id} type="button" aria-label={item.label} onClick={() => actions.onReference(item.id)}><img src={item.thumbnail ?? item.url} alt="" /></button>)}</div>}
      <div className="vt-upload">
        <div className="vt-upload-icons" aria-hidden="true">{view.kinds.map(kind => <Mark key={kind.id} icon={kind.icon} />)}</div>
        <p>{view.uploadHint}</p>
        <button type="button" className="vt-library-chip" aria-expanded={view.libraryOpen} onClick={actions.onLibraryToggle}>{view.libraryOpen ? view.closeLibraryLabel : view.libraryLabel}</button>
      </div>
    </>}
    {view.libraryOpen && <div className="vt-library">{view.items.map(item => <button key={item.id} type="button" aria-pressed={item.selected} disabled={item.disabled} onClick={() => actions.onReference(item.id)}><img src={item.thumbnail ?? item.url} alt="" /><span>{item.label}</span></button>)}</div>}
  </div>;
}

export function Composer({ title, workflowLabel, media, workflows, modelMenu, references, prompt, parameters, quantity, create, promo, actions }: ComposerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { onOutside, onCloseMenu, onCloseQuantity } = actions;
  useEffect(() => {
    function onPointer(event: PointerEvent) {
      const target = event.target as Node;
      const root = editorRef.current;
      if (!root?.contains(target)) { onOutside(); return; }
      if (!root.querySelector('.vt-model-wrap')?.contains(target)) onCloseMenu();
      if (!root.querySelector('.vt-quantity')?.contains(target)) onCloseQuantity();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onOutside();
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [onOutside, onCloseMenu, onCloseQuantity]);

  return <div className="vt-editor" ref={editorRef}>
    <div className={`vt-editor-main${modelMenu.open ? ' vt-menu-active' : ''}`}>
      <div className="vt-media" role="group" aria-label={title}>{media.map(item => <button key={item.id} type="button" aria-pressed={item.selected} onClick={() => actions.onMedia(item.id)}><Mark icon={item.icon} />{item.label}</button>)}</div>
      <div className="vt-workflows" role="group" aria-label={workflowLabel}>{workflows.map(item => <button key={item.id} type="button" aria-pressed={item.selected} onClick={() => actions.onWorkflow(item.id)}><Mark icon={item.icon} />{item.label}</button>)}</div>
      <ModelMenu {...modelMenu} />
      {references && <References view={references} actions={actions} />}
      <div className="vt-prompt">
        <div className="vt-row"><label htmlFor="vt-prompt">{prompt.title}</label>{prompt.assist && <button type="button" className="vt-assist" onClick={actions.onAssist}>{prompt.assist}</button>}</div>
        <textarea id="vt-prompt" maxLength={prompt.maxLength} placeholder={prompt.placeholder} value={prompt.value} onChange={event => actions.onPrompt(event.target.value)} />
        <span className="vt-prompt-count" aria-live="polite">{prompt.value.length}/{prompt.maxLength}</span>
      </div>
    </div>
    <div className="vt-dock">
      <div className="vt-bar">
        <button type="button" className="vt-summary" aria-expanded={parameters.expanded} aria-controls="vt-parameters" onClick={actions.onSummaryToggle}><span>{parameters.summary || parameters.fallbackLabel}</span><span className="vt-chevron" aria-hidden="true" /></button>
        <div className="vt-quantity">
          <button type="button" aria-label={quantity.label} aria-haspopup="listbox" aria-expanded={quantity.open} onClick={actions.onQuantityToggle}>{quantity.prefix}{quantity.value}<span className="vt-chevron" aria-hidden="true" /></button>
          {quantity.open && <div className="vt-quantity-menu" role="listbox" aria-label={quantity.label}>{quantity.values.map(count => <button key={count} type="button" role="option" aria-selected={count === quantity.value} onClick={() => actions.onQuantity(count)}>{quantity.prefix}{count}</button>)}</div>}
        </div>
      </div>
      {parameters.expanded && <div className="vt-fields" id="vt-parameters">{parameters.fields.map(field => <ParameterField key={field.id} {...field} />)}</div>}
      <button className="vt-create" type="button" disabled={create.disabled} onClick={actions.onCreate}>{create.label}</button>
      {promo && <div className="vt-promo"><a href={promo.href}><Mark icon={promo.icon} />{promo.label}</a>{promo.dismissLabel && <button type="button" aria-label={promo.dismissLabel} onClick={actions.onPromoDismiss}>×</button>}</div>}
    </div>
  </div>;
}
