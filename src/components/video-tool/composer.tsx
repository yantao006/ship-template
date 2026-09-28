'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, AtSign, ChevronDown, Circle, CircleDot, Sparkles, SwatchBook, X } from 'lucide-react';
import { useDismissableLayer } from '@/lib/use-dismissable-layer';
import { Mark } from './mark';
import { ModelMenu } from './model-menu';
import { ParameterField } from './parameter-field';
import type { ComposerProps, ReferenceView } from './view-model';
export type { ComposerProps } from './view-model';

function References({ view, actions }: { view: ReferenceView; actions: ComposerProps['actions'] }) {
  const used = (kind: ReferenceView['kinds'][number]) => `${kind.used}/${kind.limit}`;
  return <div className="vt-block">
    <div className="vt-reference-head"><h3>{view.title}</h3>
      {view.framePair && <button type="button" className="vt-end-toggle" aria-pressed={view.endFrame} onClick={actions.onEndFrame}>{view.endFrameLabel}{view.endFrame ? <CircleDot aria-hidden="true" size={14} strokeWidth={2} /> : <Circle aria-hidden="true" size={14} strokeWidth={2} />}</button>}
      {view.templateMedia && view.kinds.map(kind => <span key={kind.id} aria-label={`${kind.label} ${used(kind)}`}>{kind.used} / {kind.limit}</span>)}
    </div>
    {view.framePair ? (view.endFrame ? ['start', 'end'] as const : ['start'] as const).map(slot => <div className="vt-frame-upload" key={slot}>
      {view.frames[slot] ? <img src={view.items.find(item => item.id === view.frames[slot])?.thumbnail ?? view.items.find(item => item.id === view.frames[slot])?.url} alt="" /> : <Mark icon={view.kinds[0].icon} />}
      <span>{slot === 'start' ? view.startFrameLabel : view.endFrameLabel}</span>
      <button type="button" className="vt-library-chip" onClick={() => actions.onFramePick(slot)}><SwatchBook aria-hidden="true" size={16} strokeWidth={2} />{view.libraryLabel}</button>
    </div>) : <>
      {!view.templateMedia && <div className="vt-limits">{view.kinds.map(kind => <span key={kind.id} aria-label={`${kind.label} ${used(kind)}`}><Mark icon={kind.icon} /><span aria-hidden="true">{used(kind)}</span></span>)}</div>}
      {view.selectedItems.length > 0 && <div className="vt-selected">{view.selectedItems.map(item => <button key={item.id} type="button" aria-label={item.label} onClick={() => actions.onReference(item.id)}><img src={item.thumbnail ?? item.url} alt="" /></button>)}</div>}
      <div className="vt-upload">
        <div className="vt-upload-icons" aria-hidden="true">{view.kinds.map(kind => <Mark key={kind.id} icon={kind.icon} />)}</div>
        <p>{view.uploadHint}</p>
        <button type="button" className="vt-library-chip" aria-expanded={view.libraryOpen} onClick={actions.onLibraryToggle}><SwatchBook aria-hidden="true" size={16} strokeWidth={2} />{view.libraryOpen ? view.closeLibraryLabel : view.libraryLabel}</button>
      </div>
    </>}
    {view.libraryOpen && <div className="vt-library">{view.items.map(item => <button key={item.id} type="button" aria-pressed={item.selected} disabled={item.disabled} onClick={() => actions.onReference(item.id)}><img src={item.thumbnail ?? item.url} alt="" /><span>{item.label}</span></button>)}</div>}
  </div>;
}

export function Composer({ title, workflowLabel, media, workflows, modelMenu, references, prompt, parameters, quantity, create, promo, actions }: ComposerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const insertReference = () => {
    const textarea = promptRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    actions.onPrompt(`${prompt.value.slice(0, start)}@${prompt.value.slice(textarea.selectionEnd)}`.slice(0, prompt.maxLength));
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + 1, start + 1); });
  };
  useEffect(() => {
    if (parameters.expanded && mainRef.current) mainRef.current.scrollTop = mainRef.current.scrollHeight;
  }, [parameters.expanded]);
  const { onOutside, onCloseMenu, onCloseQuantity } = actions;
  useDismissableLayer({ active: true, area: editorRef, onClose: onOutside, onPointer: event => {
    const target = event.target as Node;
    const root = editorRef.current;
    if (!root?.contains(target)) return;
    if (!root.querySelector('.vt-model-wrap')?.contains(target)) onCloseMenu();
    if (!root.querySelector('.vt-quantity')?.contains(target)) onCloseQuantity();
  } });

  return <div className="vt-editor" ref={editorRef}>
    <div ref={mainRef} className={`vt-editor-main${modelMenu.open ? ' vt-menu-active' : ''}`}>
      <div className="vt-media" role="group" aria-label={title}>{media.map(item => <button key={item.id} type="button" aria-pressed={item.selected} onClick={() => actions.onMedia(item.id)}><Mark icon={item.icon} />{item.label}</button>)}</div>
      <div className="vt-workflows" role="group" aria-label={workflowLabel}>{workflows.map(item => <button key={item.id} type="button" aria-pressed={item.selected} onClick={() => actions.onWorkflow(item.id)}><Mark icon={item.icon} />{item.label}</button>)}</div>
      <ModelMenu {...modelMenu} />
      {references && <References view={references} actions={actions} />}
      <div className="vt-prompt">
        <div className="vt-row"><label htmlFor="vt-prompt">{prompt.title}</label><div className="vt-prompt-actions">{references && <button type="button" className="vt-mention-button" aria-label={prompt.referenceLabel} onClick={insertReference}><AtSign aria-hidden="true" size={16} strokeWidth={2} /></button>}{prompt.assist && <button type="button" className="vt-assist" onClick={actions.onAssist}><Sparkles aria-hidden="true" size={16} strokeWidth={2} />{prompt.assist}</button>}</div></div>
        <textarea ref={promptRef} id="vt-prompt" maxLength={prompt.maxLength} placeholder={prompt.placeholder} value={prompt.value} onChange={event => actions.onPrompt(event.target.value)} />
        <span className="vt-prompt-count" aria-live="polite">{prompt.value.length}/{prompt.maxLength}</span>
      </div>
      {parameters.expanded && <div className="vt-fields" id="vt-parameters" role="group" aria-label={parameters.fallbackLabel}>{parameters.fields.map(field => <ParameterField key={field.id} {...field} />)}</div>}
    </div>
    <div className="vt-dock">
      <div className="vt-bar">
        <button type="button" className="vt-summary" aria-expanded={parameters.expanded} aria-controls="vt-parameters" onClick={actions.onSummaryToggle}><span>{parameters.summary || parameters.fallbackLabel}</span><ChevronDown className="vt-chevron" aria-hidden="true" size={18} strokeWidth={2} /></button>
        <div className="vt-quantity">
          <button type="button" aria-label={quantity.label} aria-haspopup="listbox" aria-expanded={quantity.open} onClick={actions.onQuantityToggle}>{quantity.prefix}{quantity.value}<ChevronDown className="vt-chevron" aria-hidden="true" size={18} strokeWidth={2} /></button>
          {quantity.open && <div className="vt-quantity-menu" role="listbox" aria-label={quantity.label}>{quantity.values.map(count => <button key={count} type="button" role="option" aria-selected={count === quantity.value} onClick={() => actions.onQuantity(count)}>{quantity.prefix}{count}</button>)}</div>}
        </div>
      </div>
      <button className="ui-button-solid vt-create" type="button" disabled={create.disabled} onClick={actions.onCreate}>{create.label}</button>
      {promo && <div className="vt-promo">{promo.href.startsWith('/') && !promo.href.includes('{locale}') ? <Link href={promo.href}><Mark icon={promo.icon} />{promo.label}<ArrowRight aria-hidden="true" size={16} strokeWidth={2} /></Link> : <a href={promo.href}><Mark icon={promo.icon} />{promo.label}<ArrowRight aria-hidden="true" size={16} strokeWidth={2} /></a>}{promo.dismissLabel && <button type="button" aria-label={promo.dismissLabel} onClick={actions.onPromoDismiss}><X aria-hidden="true" size={18} strokeWidth={2} /></button>}</div>}
    </div>
  </div>;
}
