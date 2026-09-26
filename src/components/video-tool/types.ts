export type FieldValue = string | number | boolean;
export type FieldType = 'text' | 'option' | 'switch' | 'upload' | 'number';
export type ToolField = { id: string; type: FieldType; stops?: number[]; unit?: string; summary?: boolean };
export type ToolModel = {
  id: string; vendorId: string; icon: string; workflowIds: string[]; fieldIds: string[];
  options: Record<string, string[]>; stops?: Record<string, number[]>; tags: { id: string; tone: string }[]; count?: number;
};
export type ToolAssetConfig = {
  id: string; type: 'image' | 'video'; url: string; poster?: string; tabId: string;
  actionIds?: string[]; links?: { id: string; href: string }[]; badgeId?: string;
};
export type ToolAsset = {
  id: string; type: 'image' | 'video'; url: string; poster?: string; tabId: string;
  title: string; description: string; badge?: string;
  secondaryActions?: { id: string; label: string }[];
  links?: { id: string; label: string; href: string }[];
};
export type VideoToolStructure = {
  media: { id: string; icon: string }[];
  workflows: { id: string; icon: string; mediaId: string }[];
  vendors: { id: string }[];
  models: ToolModel[];
  fields: ToolField[];
  references: { id: string; kind: string; url: string }[];
  referenceKinds: { id: string; icon: string }[];
  referenceLimits: Record<string, number>;
  quantity: { min: number; max: number; default: number };
  tabs: { id: string }[];
  assets: ToolAssetConfig[];
  defaultModelId?: string;
  promo?: { icon: string; href: string };
};
export type VideoToolCopy = {
  title: string; description: string; media: Record<string, string>; workflows: Record<string, string>;
  vendors: Record<string, string>; models: Record<string, string>; tags: Record<string, string>;
  fields: Record<string, string>; options: Record<string, Record<string, string>>;
  references: { title: string; uploadHint: string; library: string; closeLibrary: string; limits: Record<string, string>; candidates: Record<string, string> };
  prompt: { title: string; placeholder: string; maxLength: number; assist?: string; suggestion?: string };
  model: string; workflowLabel: string; parameters: string; expand: string; collapse: string; quantity: string; quantityPrefix: string; create: string;
  promo?: string;
  tabs: Record<string, { label: string; empty: string }>;
  assets: Record<string, { title: string; description: string; badge?: string; actions?: Record<string, string>; links?: Record<string, string> }>;
  status: { idle: string; running: string; done: string; failed: string };
  previewHeading: string;
};
export type CreatePayload = {
  modelId: string; workflowId: string; prompt: string; quantity: number;
  values: Record<string, FieldValue>; referenceIds: string[];
};
export type ToolStatus = { state: 'idle' | 'running' | 'done' | 'failed'; progress?: number; result?: ToolAsset };
export type VideoGenerationToolProps = {
  config: VideoToolStructure; copy: VideoToolCopy; assets: ToolAsset[]; status?: ToolStatus;
  onCreate: (payload: CreatePayload) => void;
};
