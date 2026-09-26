import en from './en';
import zh from './zh';

type StringShape<T> = { [K in keyof T]: T[K] extends string ? string : StringShape<T[K]> };
const checkedZh: StringShape<typeof en> = zh;
void checkedZh;

export default { en, zh };
