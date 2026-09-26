import type { CSSProperties } from 'react';
import type { FieldType, FieldValue, ToolField } from './types';

export type ParameterFieldProps = {
  id: string; type: FieldType; label: string; value: FieldValue;
  presentation?: ToolField['presentation']; unit?: string;
  options?: { value: string; label: string }[]; stops?: number[]; uploadHint?: string;
  switchStates?: { on: string; off: string };
  onChange: (value: FieldValue) => void;
};

function ratioDimensions(value: string) {
  const match = /^(\d+)-(\d+)$/.exec(value);
  if (!match) return { width: 18, height: 18 };
  const width = Number(match[1]);
  const height = Number(match[2]);
  const scale = 28 / Math.max(width, height);
  return { width: Math.max(12, Math.round(width * scale)), height: Math.max(12, Math.round(height * scale)) };
}

export function ParameterField({ id: fieldId, type, label, value, presentation, unit = '', options = [], stops = [], uploadHint, switchStates, onChange }: ParameterFieldProps) {
  const id = `video-field-${fieldId}`;
  if (type === 'switch') return <label className="vt-audio-toggle" htmlFor={id}><span>{label}</span><span className="vt-switch-status" aria-hidden="true"><span className="vt-switch-dot" />{value === true ? switchStates?.on : switchStates?.off}</span><input id={id} type="checkbox" checked={value === true} onChange={event => onChange(event.target.checked)} /></label>;
  if (type === 'number') {
    const index = Math.max(0, stops.indexOf(Number(value)));
    const fill = stops.length > 1 ? `${100 * index / (stops.length - 1)}%` : '0%';
    return <div className="vt-field-card vt-duration-field"><label htmlFor={id}>{label}</label><div className="vt-range-labels"><span>{stops[0]}{unit}</span><strong aria-live="polite">{value}{unit}</strong><span>{stops[stops.length - 1]}{unit}</span></div><input id={id} type="range" min={0} max={Math.max(0, stops.length - 1)} step={1} disabled={!stops.length} value={index} style={{ '--vt-range-fill': fill } as CSSProperties} onChange={event => onChange(stops[Number(event.target.value)])} /></div>;
  }
  if (type === 'option') return <div className="vt-field-card" role="group" aria-label={label}><span className="vt-field-label">{label}</span><div className={`vt-choices${presentation === 'ratio' ? ' vt-ratio-choices' : ''}`}>{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{presentation === 'ratio' && <span className="vt-ratio-icon" style={ratioDimensions(option.value)} aria-hidden="true" />}{option.label}</button>)}</div></div>;
  if (type === 'upload') return <label className="vt-field-card vt-field" htmlFor={id}><span>{label}</span><select id={id} value={String(value)} onChange={event => onChange(event.target.value)}><option value="">{uploadHint}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  return <label className="vt-field-card vt-field" htmlFor={id}><span>{label}</span><input id={id} type="text" value={String(value)} onChange={event => onChange(event.target.value)} /></label>;
}
