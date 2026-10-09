'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Locale, Translated } from '@/types';
import { STORAGE_KEYS } from '@/lib/config';
import { ar, fr, type Dictionary } from './dictionaries';

const dictionaries: Record<Locale, Dictionary> = { fr, ar };

export const LOCALES: Locale[] = ['fr', 'ar'];

interface I18nContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Resolve a translated field to a plain string. */
  pick: (value: Translated | undefined) => string;
  /** Replace {placeholders} inside a translated string. */
  tpl: (template: string, values: Record<string, string | number>) => string;
  /** BCP-47 tag of the active locale (used by Intl). */
  localeTag: string;
  /** False until the persisted locale has been read from localStorage. */
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = 'fr',
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [ready, setReady] = useState(false);

  // Read the persisted choice after mount so server and client markup match.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.locale);
      if (stored === 'fr' || stored === 'ar') {
        setLocaleState(stored);
      }
    } catch {
      /* localStorage unavailable (private mode) — fall back to default. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.locale, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'fr' ? 'ar' : 'fr');
  }, [locale, setLocale]);

  const value = useMemo<I18nContextValue>(() => {
    const t = dictionaries[locale];
    return {
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      t,
      setLocale,
      toggleLocale,
      pick: (v) => (v ? v[locale] : ''),
      tpl: (template, values) =>
        template.replace(/\{(\w+)\}/g, (match, key: string) =>
          key in values ? String(values[key]) : match,
        ),
      localeTag: locale === 'ar' ? 'ar-DZ' : 'fr-DZ',
      ready,
    };
  }, [locale, ready, setLocale, toggleLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

export type { Dictionary };
