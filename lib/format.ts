import type { Locale, PriceUnit, Translated } from '@/types';

/**
 * Formatting helpers for the Algerian market.
 *
 * Numbers always use Latin digits with a thin space / narrow no-break space as
 * the group separator, which is the convention used in Algeria in both French
 * and Arabic. Currency is the Algerian dinar (DZD), written "DA" as is usual
 * locally rather than the ISO code.
 */

const NUMBER_LOCALE = 'fr-FR';

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(NUMBER_LOCALE, options).format(value);
}

/** e.g. "78 000 DA" */
export function formatCurrency(value: number): string {
  return `${formatNumber(Math.round(value))} DA`;
}

/** Compact form for dense cards: "145 M DA", "78 k DA". */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${formatNumber(millions, { maximumFractionDigits: millions >= 10 ? 0 : 1 })} M DA`;
  }
  if (value >= 1_000) {
    return `${formatNumber(value / 1_000, { maximumFractionDigits: 0 })} k DA`;
  }
  return formatCurrency(value);
}

/** e.g. "78 000 DA / mois" */
export function formatPriceWithUnit(
  value: number,
  unit: PriceUnit,
  t: { common: Record<string, string> },
): string {
  const suffix =
    unit === 'day'
      ? t.common.perDay
      : unit === 'month'
        ? t.common.perMonth
        : unit === 'year'
          ? t.common.perYear
          : '';
  return `${formatCurrency(value)}${suffix}`;
}

export function formatSurface(surface: number): string {
  return `${formatNumber(surface)} m²`;
}

export function formatDate(iso: string, locale: Locale = 'fr'): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(iso: string, locale: Locale = 'fr'): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(iso: string, locale: Locale = 'fr'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** "il y a 3 jours" / "منذ 3 أيام" */
export function formatRelativeTime(iso: string, locale: Locale = 'fr'): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return iso;
  const diffSeconds = Math.round((target - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'fr', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return rtf.format(diffSeconds, 'second');
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${formatNumber(km, { maximumFractionDigits: 1 })} km`;
}

/** Pick a translated value without React context (server components). */
export function pickTranslated(value: Translated | undefined, locale: Locale): string {
  return value ? value[locale] : '';
}

export function todayISO(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function nightsBetween(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
