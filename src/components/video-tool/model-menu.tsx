import { Check, ChevronDown } from 'lucide-react';
import { Mark } from './mark';

import type { ModelMenuItem, ModelMenuProps } from './view-model';
export type { ModelMenuItem, ModelMenuGroup, ModelMenuProps } from './view-model';

function Tags({ tags, as = 'span' }: { tags: ModelMenuItem['tags']; as?: 'span' | 'em' }) {
  return <>{tags.map(tag => as === 'em'
    ? <em className={`tone-tag tone-${tag.tone} vt-tag`} key={tag.id}>{tag.icon && <Mark icon={tag.icon} />}{tag.label}</em>
    : <span className={`tone-tag tone-${tag.tone} vt-tag`} key={tag.id}>{tag.icon && <Mark icon={tag.icon} />}{tag.label}</span>)}</>;
}

export function ModelMenu({ label, selectedId, selected, groups, open, onToggle, onSelect }: ModelMenuProps) {
  return <div className="vt-model-wrap">
    <button type="button" className="vt-model" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={onToggle}>
      {selected && <Mark icon={selected.icon} />}
      <span className="vt-model-name">{selected?.label ?? label}</span>
      {selected && <Tags tags={selected.tags} />}
      <ChevronDown className="vt-chevron" aria-hidden="true" size={18} strokeWidth={2} />
    </button>
    {open && <div className="vt-model-menu" role="listbox" aria-label={label}>
      {groups.map(group => <div key={group.id} className="vt-vendor">
        <div className="vt-vendor-row"><Mark icon={group.icon} /><span>{group.label}</span><b>{group.models.length}</b></div>
        {group.models.map(item => <button key={item.id} type="button" role="option" aria-selected={item.id === selectedId} className={item.id === selectedId ? 'is-selected' : undefined} onClick={() => onSelect(item.id)}>
          <Mark icon={item.icon} />
          <span className="vt-model-copy"><span>{item.label}</span>{item.subtitle && <small>{item.subtitle}</small>}</span>
          <Tags tags={item.tags} as="em" />
          {item.id === selectedId && <Check className="vt-check" aria-hidden="true" size={16} strokeWidth={2} />}
        </button>)}
      </div>)}
    </div>}
  </div>;
}
