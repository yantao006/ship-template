import en from './en';
import zh from './zh';
import type { messages } from '../../../../src/lib/config';

type StringShape<T> = { [K in keyof T]: T[K] extends string ? string : StringShape<T[K]> };
const checkedZh: StringShape<typeof en> = zh;
const checkedEn: StringShape<(typeof messages)['en']> = en;
void checkedZh;
void checkedEn;

export default { en, zh };
