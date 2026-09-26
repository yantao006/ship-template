import { Mark } from './mark';

export type ModelMenuItem = { id: string; icon: string; label: string; subtitle?: string; tags: { id: string; label: string; tone: string; icon?: string }[] };
export type ModelMenuGroup = { id: string; icon: string; label: string; models: ModelMenuItem[] };
export type ModelMenuProps = {
  label: string; selectedId: string; selected?: ModelMenuItem; groups: ModelMenuGroup[]; open: boolean;
  onToggle: () => void; onSelect: (id: string) => void;
};

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
      <span className="vt-chevron" aria-hidden="true" />
    </button>
    {open && <div className="vt-model-menu" role="listbox" aria-label={label}>
      {groups.map(group => <div key={group.id} className="vt-vendor">
        <div className="vt-vendor-row"><Mark icon={group.icon} /><span>{group.label}</span><b>{group.models.length}</b></div>
        {group.models.map(item => <button key={item.id} type="button" role="option" aria-selected={item.id === selectedId} className={item.id === selectedId ? 'is-selected' : undefined} onClick={() => onSelect(item.id)}>
          <Mark icon={item.icon} />
          <span className="vt-model-copy"><span>{item.label}</span>{item.subtitle && <small>{item.subtitle}</small>}</span>
          <Tags tags={item.tags} as="em" />
          {item.id === selectedId && <span className="vt-check" aria-hidden="true">✓</span>}
        </button>)}
      </div>)}
    </div>}
  </div>;
}
