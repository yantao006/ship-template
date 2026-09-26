import type { FieldType, FieldValue } from './types';

export type ParameterFieldProps = {
  id: string; type: FieldType; label: string; value: FieldValue;
  options?: { value: string; label: string }[]; stops?: number[]; uploadHint?: string;
  onChange: (value: FieldValue) => void;
};

export function ParameterField({ id: fieldId, type, label, value, options = [], stops = [], uploadHint, onChange }: ParameterFieldProps) {
  const id = `video-field-${fieldId}`;
  if (type === 'switch') return <label className="vt-switch" htmlFor={id}><span>{label}</span><input id={id} type="checkbox" checked={value === true} onChange={event => onChange(event.target.checked)} /></label>;
  if (type === 'number') return <label className="vt-field" htmlFor={id}><span>{label}: <strong>{value}</strong></span><input id={id} type="range" min={0} max={Math.max(0, stops.length - 1)} step={1} disabled={!stops.length} value={Math.max(0, stops.indexOf(Number(value)))} onChange={event => onChange(stops[Number(event.target.value)])} /><span className="vt-stops">{stops.join(' · ')}</span></label>;
  if (type === 'option') return <div className="vt-field" role="group" aria-label={label}><span id={id}>{label}</span><div className="vt-choices">{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div></div>;
  if (type === 'upload') return <label className="vt-field" htmlFor={id}><span>{label}</span><select id={id} value={String(value)} onChange={event => onChange(event.target.value)}><option value="">{uploadHint}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  return <label className="vt-field" htmlFor={id}><span>{label}</span><input id={id} type="text" value={String(value)} onChange={event => onChange(event.target.value)} /></label>;
}
