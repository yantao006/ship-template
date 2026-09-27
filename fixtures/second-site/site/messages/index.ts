import en from './en';
import zh from './zh';
import type { messages } from '../../../../src/lib/config';

type StringShape<T> = { [K in keyof T]: T[K] extends string ? string : StringShape<T[K]> };
const checkedZh: StringShape<typeof en> = zh;
// Plan IDs and pricing feature keys are site-local, so only their common pricing copy must match.
type ReferenceMessages = (typeof messages)['en'];
type SharedMessages = Omit<ReferenceMessages, 'planCopy' | 'pricing'> & {
  pricing: Omit<ReferenceMessages['pricing'], 'planFeatures'>;
};
const checkedEn: StringShape<SharedMessages> = en;
void checkedZh;
void checkedEn;

export default { en, zh };
