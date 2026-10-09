import type { Locale } from '@/types';
import { ar } from './ar';
import { fr, type Dictionary } from './fr';

const dictionaries: Record<Locale, Dictionary> = { fr, ar };

/**
 * Server-safe dictionary access (used by `generateMetadata` and structured
 * data). Client components must use the `useI18n()` hook instead.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export { ar, fr };
export type { Dictionary };
