import en from './en';
import zh from './zh';
import type { messages } from '../../../../src/lib/config';

type StringShape<T> = { [K in keyof T]: T[K] extends string ? string : StringShape<T[K]> };
const checkedZh: StringShape<typeof en> = zh;
// Plan IDs are site-local, so the fixture's planCopy map need not mirror the reference site's IDs.
const checkedEn: StringShape<Omit<(typeof messages)['en'], 'planCopy'>> = en;
void checkedZh;
void checkedEn;

export default { en, zh };
