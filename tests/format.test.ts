import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatSurface,
  nightsBetween,
} from '@/lib/format';

describe('formatCurrency', () => {
  // Intl uses a narrow no-break space for the fr-FR group separator.
  const plain = (value: string) => value.replace(/[\u202f\u00a0]/g, ' ');

  it('formats Algerian dinars with a space group separator', () => {
    expect(plain(formatCurrency(78_000))).toBe('78 000 DA');
    expect(plain(formatCurrency(1_250))).toBe('1 250 DA');
    expect(plain(formatCurrency(0))).toBe('0 DA');
  });

  it('compresses large amounts', () => {
    expect(formatCurrencyCompact(145_000_000)).toContain('M DA');
    expect(formatCurrencyCompact(78_000)).toContain('k DA');
    expect(formatCurrencyCompact(900)).toBe('900 DA');
  });
});

describe('formatSurface', () => {
  it('appends the square metre unit', () => {
    expect(formatSurface(96)).toBe('96 m²');
  });
});

describe('date helpers', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2026-10-15', 'fr')).toContain('2026');
  });

  it('adds days', () => {
    expect(addDays('2026-10-15', 5)).toBe('2026-10-20');
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
  });

  it('counts nights', () => {
    expect(nightsBetween('2026-08-01', '2026-08-08')).toBe(7);
    expect(nightsBetween('2026-08-08', '2026-08-01')).toBe(0);
  });
});
