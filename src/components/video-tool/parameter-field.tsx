import type { FieldValue, ToolField, ToolModel, VideoToolCopy, VideoToolStructure } from './types';
import { fieldStops } from './state';

type Props = {
  field: ToolField; model: ToolModel; copy: VideoToolCopy; references: VideoToolStructure['references'];
  value: FieldValue; onChange: (value: FieldValue) => void;
};

export function ParameterField({ field, model, copy, references, value, onChange }: Props) {
  const label = copy.fields[field.id];
  const id = `video-field-${field.id}`;
  if (field.type === 'switch') return <label className="vt-switch" htmlFor={id}><span>{label}</span><input id={id} type="checkbox" checked={value === true} onChange={event => onChange(event.target.checked)} /></label>;
  if (field.type === 'number') {
    const stops = fieldStops(field, model);
    return <label className="vt-field" htmlFor={id}><span>{label}: <strong>{value}</strong></span><input id={id} type="range" min={0} max={Math.max(0, stops.length - 1)} step={1} disabled={!stops.length} value={Math.max(0, stops.indexOf(Number(value)))} onChange={event => onChange(stops[Number(event.target.value)])} /><span className="vt-stops">{stops.join(' · ')}</span></label>;
  }
  if (field.type === 'option') return <div className="vt-field" role="group" aria-label={label}><span id={id}>{label}</span><div className="vt-choices">{(model.options[field.id] ?? []).map(option => <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)}>{copy.options[field.id]?.[option] ?? option}</button>)}</div></div>;
  if (field.type === 'upload') return <label className="vt-field" htmlFor={id}><span>{label}</span><select id={id} value={String(value)} onChange={event => onChange(event.target.value)}><option value="">{copy.references.uploadHint}</option>{references.map(reference => <option key={reference.id} value={reference.id}>{copy.references.candidates[reference.id]}</option>)}</select></label>;
  return <label className="vt-field" htmlFor={id}><span>{label}</span><input id={id} type="text" value={String(value)} onChange={event => onChange(event.target.value)} /></label>;
}
