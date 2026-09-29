import type { messages } from '@/lib/config';
import { WhereItShines } from './WhereItShines';

export function VideoFeatures({ locale }: { locale: keyof typeof messages }) {
  return <section id="video-features"><WhereItShines locale={locale} /></section>;
}
