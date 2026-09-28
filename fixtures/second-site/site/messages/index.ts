import en from './en';
import zh from './zh';
import type { MessageShape } from '../../../../src/lib/message-shape';

const checkedZh: MessageShape<typeof en> = zh;
const checkedEn: MessageShape<typeof zh> = en;
void checkedZh;
void checkedEn;

export default { en, zh };
