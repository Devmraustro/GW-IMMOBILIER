import { describe, expect, it } from 'vitest';
import { fr } from '@/lib/i18n/dictionaries/fr';
import { ar } from '@/lib/i18n/dictionaries/ar';
import { slugify, uniqueSlug } from '@/lib/slug';
import { haversineDistance, googleDirectionsUrl, isValidGeoPoint } from '@/lib/geo';

/** Recursively collect the paths of every leaf string in an object. */
function leaves(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      leaves(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

describe('translations', () => {
  it('Arabic implements exactly the same keys as French', () => {
    expect(new Set(leaves(ar))).toEqual(new Set(leaves(fr)));
  });

  it('has no empty translation', () => {
    Object.entries(ar).forEach(([section, value]) => {
      leaves(value).forEach((_leaf, index) => {
        void index;
      });
      void section;
    });
    const empty = leaves(ar).filter((path) => {
      const parts = path.split('.');
      let cursor: unknown = ar;
      for (const part of parts) cursor = (cursor as Record<string, unknown>)[part];
      return typeof cursor === 'string' && cursor.trim().length === 0;
    });
    expect(empty).toEqual([]);
  });

  it('keeps the {placeholder} tokens identical between locales', () => {
    const tokens = (dict: unknown, path = ''): Record<string, string[]> => {
      const result: Record<string, string[]> = {};
      const collect = (value: unknown, current: string) => {
        if (typeof value === 'string') {
          result[current] = (value.match(/\{\w+\}/g) ?? []).sort();
          return;
        }
        if (value && typeof value === 'object') {
          Object.entries(value as Record<string, unknown>).forEach(([key, child]) =>
            collect(child, current ? `${current}.${key}` : key),
          );
        }
      };
      collect(dict, path);
      return result;
    };

    const frTokens = tokens(fr);
    const arTokens = tokens(ar);
    Object.keys(frTokens).forEach((key) => {
      expect(arTokens[key], key).toEqual(frTokens[key]);
    });
  });
});

describe('slug helpers', () => {
  it('slugifies accented French text', () => {
    expect(slugify('F3 meublé — cœur de Bab Ezzouar')).toBe('f3-meuble-coeur-de-bab-ezzouar');
  });

  it('keeps Arabic characters', () => {
    expect(slugify('شقة مفروشة')).toBe('شقة-مفروشة');
  });

  it('generates unique slugs', () => {
    expect(uniqueSlug('f3 cheraga', [])).toBe('f3-cheraga');
    expect(uniqueSlug('f3 cheraga', ['f3-cheraga'])).toBe('f3-cheraga-2');
    expect(uniqueSlug('f3 cheraga', ['f3-cheraga', 'f3-cheraga-2'])).toBe('f3-cheraga-3');
  });
});

describe('geo helpers', () => {
  it('computes a plausible distance between two Algiers communes', () => {
    const babEzzouar = { lat: 36.7189, lng: 3.1845 };
    const cheraga = { lat: 36.7514, lng: 2.9436 };
    const distance = haversineDistance(babEzzouar, cheraga);
    expect(distance).toBeGreaterThan(15);
    expect(distance).toBeLessThan(30);
  });

  it('is zero for the same point', () => {
    expect(haversineDistance({ lat: 36.75, lng: 3.05 }, { lat: 36.75, lng: 3.05 })).toBeCloseTo(0, 5);
  });

  it('builds a Google Maps directions link with the destination', () => {
    const url = googleDirectionsUrl('36.718900,3.184500');
    expect(url).toContain('https://www.google.com/maps/dir/?api=1');
    expect(url).toContain(encodeURIComponent('36.718900,3.184500'));
    expect(url).not.toContain('origin=');
  });

  it('includes an origin when provided', () => {
    expect(googleDirectionsUrl('36.7,3.1', 'Place des Martyrs, Alger')).toContain('origin=');
  });

  it('validates geo points', () => {
    expect(isValidGeoPoint({ lat: 36.75, lng: 3.05 })).toBe(true);
    expect(isValidGeoPoint({ lat: 100, lng: 3.05 })).toBe(false);
    expect(isValidGeoPoint(null)).toBe(false);
    expect(isValidGeoPoint({ lat: '36.75', lng: 3.05 })).toBe(false);
  });
});
