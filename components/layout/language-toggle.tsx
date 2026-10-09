'use client';

import { Languages } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Real language toggle: swaps the whole dictionary and flips document dir.
 * The active choice is persisted in localStorage (see I18nProvider).
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-ink-200 bg-white p-0.5 text-xs font-semibold',
        className,
      )}
      role="group"
      aria-label={t.common.language}
    >
      <Languages className="mx-1.5 size-3.5 text-ink-400" aria-hidden />
      <button
        type="button"
        onClick={() => setLocale('fr')}
        aria-pressed={locale === 'fr'}
        className={cn(
          'rounded-full px-2.5 py-1 transition-colors',
          locale === 'fr' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900',
        )}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale('ar')}
        aria-pressed={locale === 'ar'}
        className={cn(
          'rounded-full px-2.5 py-1 transition-colors',
          locale === 'ar' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900',
        )}
      >
        ع
      </button>
    </div>
  );
}

export default LanguageToggle;
