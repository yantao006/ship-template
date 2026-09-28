// Internal presentation contracts. State binds these shapes; leaf views only render them.
import type { FieldType, FieldValue, ToolAsset, ToolField, ToolStatus } from './types';

export type ModelMenuItem = { id: string; icon: string; label: string; subtitle?: string; tags: { id: string; label: string; tone: string; icon?: string }[] };
export type ModelMenuGroup = { id: string; icon: string; label: string; models: ModelMenuItem[] };
export type ModelMenuProps = {
  label: string; selectedId: string; selected?: ModelMenuItem; groups: ModelMenuGroup[]; open: boolean;
  onToggle: () => void; onSelect: (id: string) => void;
};

export type ParameterFieldProps = {
  id: string; type: FieldType; label: string; value: FieldValue;
  presentation?: ToolField['presentation']; unit?: string;
  options?: { value: string; label: string }[]; stops?: number[]; uploadHint?: string;
  switchStates?: { on: string; off: string };
  onChange: (value: FieldValue) => void;
};

type Choice = { id: string; icon: string; label: string; selected: boolean };
type ReferenceItem = { id: string; kind: string; url: string; thumbnail?: string; label: string; selected: boolean; disabled: boolean };
export type ReferenceView = {
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
  prompt: { title: string; assist?: string; referenceLabel: string; placeholder: string; value: string; maxLength: number };
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

export type StageProps = {
  title: string;
  tabs: { id: string; label: string; empty: string }[];
  tabId: string; onTabChange: (id: string) => void;
  assets: ToolAsset[]; assetId: string; onAssetChange: (id: string) => void;
  templateGrid: boolean; galleryHeading?: string;
  status: ToolStatus; statusText: string;
};
