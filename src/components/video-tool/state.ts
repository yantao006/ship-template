import type { CreatePayload, FieldValue, ToolField, ToolModel, VideoToolStructure } from './types';

export function visibleWorkflows(config: VideoToolStructure, mediaId: string, model: ToolModel) {
  return config.workflows.filter(workflow => workflow.mediaId === mediaId && model.workflowIds.includes(workflow.id));
}

export function snapToStops(value: number, stops: readonly number[]): number | undefined {
  return stops.length ? stops.reduce((nearest, stop) => Math.abs(stop - value) < Math.abs(nearest - value) ? stop : nearest) : undefined;
}

export function fieldStops(field: ToolField, model: ToolModel) {
  return model.stops?.[field.id] ?? field.stops ?? [];
}

export function defaultFieldValue(field: ToolField, model: ToolModel): FieldValue {
  if (field.type === 'switch') return false;
  if (field.type === 'number') return fieldStops(field, model)[0] ?? 0;
  if (field.type === 'option') return model.options[field.id]?.[0] ?? '';
  return '';
}

export function reconcileFieldValues(fields: ToolField[], model: ToolModel, values: Record<string, FieldValue>): Record<string, FieldValue> {
  return Object.fromEntries(fields.filter(field => model.fieldIds.includes(field.id)).map(field => {
    const value = values[field.id];
    const valid = field.type === 'option' ? typeof value === 'string' && (model.options[field.id] ?? []).includes(value)
      : field.type === 'number' ? typeof value === 'number' && fieldStops(field, model).includes(value)
      : field.type === 'switch' ? typeof value === 'boolean' : typeof value === 'string';
    return [field.id, valid ? value : defaultFieldValue(field, model)];
  }));
}

export function buildCreatePayload(model: ToolModel, workflowId: string, prompt: string, quantity: number, values: Record<string, FieldValue>, referenceIds: string[]): CreatePayload {
  return { modelId: model.id, workflowId, prompt, quantity, values: Object.fromEntries(Object.entries(values).filter(([id]) => model.fieldIds.includes(id))), referenceIds: [...referenceIds] };
}
