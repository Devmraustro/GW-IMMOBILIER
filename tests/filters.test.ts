import { describe, expect, it } from 'vitest';
import { properties } from '@/data/properties';
import { vehicles } from '@/data/vehicles';
import {
  DEFAULT_PROPERTY_FILTERS,
  DEFAULT_VEHICLE_FILTERS,
  PRICE_BOUNDS,
  applyPropertyFilters,
  applyVehicleFilters,
  countActivePropertyFilters,
  sortProperties,
  sortVehicles,
} from '@/lib/filters';
import type { PropertyFilters } from '@/types';

const baseFilters = (): PropertyFilters => ({ ...DEFAULT_PROPERTY_FILTERS });

describe('applyPropertyFilters', () => {
  it('returns every listing when no filter is set', () => {
    expect(applyPropertyFilters(properties, baseFilters())).toHaveLength(properties.length);
  });

  it('filters by area', () => {
    const result = applyPropertyFilters(properties, {
      ...baseFilters(),
      areas: ['cheraga'],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.area === 'cheraga')).toBe(true);
  });

  it('filters by type', () => {
    const result = applyPropertyFilters(properties, { ...baseFilters(), types: ['F3'] });
    expect(result.every((item) => item.type === 'F3')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters by rental period', () => {
    const result = applyPropertyFilters(properties, { ...baseFilters(), periods: ['daily'] });
    expect(result.every((item) => item.rentalPeriod === 'daily')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters by price ceiling', () => {
    const result = applyPropertyFilters(properties, { ...baseFilters(), maxPrice: 60_000 });
    expect(result.every((item) => item.price <= 60_000)).toBe(true);
  });

  it('filters furnished / unfurnished', () => {
    const furnished = applyPropertyFilters(properties, { ...baseFilters(), furnished: 'furnished' });
    const unfurnished = applyPropertyFilters(properties, {
      ...baseFilters(),
      furnished: 'unfurnished',
    });
    expect(furnished.every((item) => item.furnished)).toBe(true);
    expect(unfurnished.every((item) => !item.furnished)).toBe(true);
    expect(furnished.length + unfurnished.length).toBe(properties.length);
  });

  it('filters available listings only', () => {
    const result = applyPropertyFilters(properties, { ...baseFilters(), availableOnly: true });
    expect(result.every((item) => item.availability.status === 'available')).toBe(true);
    expect(result.length).toBeLessThan(properties.length);
  });

  it('filters by minimum bedrooms', () => {
    const result = applyPropertyFilters(properties, { ...baseFilters(), bedrooms: 3 });
    expect(result.every((item) => item.bedrooms >= 3)).toBe(true);
  });

  it('matches free text on reference and title, accent insensitive', () => {
    const byReference = applyPropertyFilters(properties, { ...baseFilters(), query: 'gwi-ch-2201' });
    expect(byReference).toHaveLength(1);
    expect(byReference[0].reference).toBe('GWI-CH-2201');

    const byAccented = applyPropertyFilters(properties, { ...baseFilters(), query: 'cheraga' });
    expect(byAccented.length).toBeGreaterThan(0);
  });

  it('filters by minimum availability date', () => {
    const result = applyPropertyFilters(properties, {
      ...baseFilters(),
      availableFrom: '2026-12-01',
    });
    expect(result.every((item) => item.availability.availableFrom <= '2026-12-01')).toBe(true);
  });

  it('combines filters with AND semantics', () => {
    const result = applyPropertyFilters(properties, {
      ...baseFilters(),
      areas: ['douaouda-marine'],
      furnished: 'furnished',
      availableOnly: true,
    });
    expect(
      result.every(
        (item) =>
          item.area === 'douaouda-marine' &&
          item.furnished &&
          item.availability.status === 'available',
      ),
    ).toBe(true);
  });

  it('returns an empty array when nothing matches', () => {
    expect(
      applyPropertyFilters(properties, { ...baseFilters(), areas: ['cheraga'], types: ['Villa'] , periods: ['daily'] }),
    ).toHaveLength(0);
  });
});

describe('sortProperties', () => {
  it('sorts by ascending price', () => {
    const result = sortProperties(properties, 'price-asc');
    for (let i = 1; i < result.length; i += 1) {
      expect(result[i].price).toBeGreaterThanOrEqual(result[i - 1].price);
    }
  });

  it('sorts by descending price', () => {
    const result = sortProperties(properties, 'price-desc');
    for (let i = 1; i < result.length; i += 1) {
      expect(result[i].price).toBeLessThanOrEqual(result[i - 1].price);
    }
  });

  it('sorts by surface descending', () => {
    const result = sortProperties(properties, 'surface-desc');
    expect(result[0].surface).toBe(Math.max(...properties.map((item) => item.surface)));
  });

  it('sorts by newest first', () => {
    const result = sortProperties(properties, 'newest');
    for (let i = 1; i < result.length; i += 1) {
      expect(new Date(result[i].createdAt).getTime()).toBeLessThanOrEqual(
        new Date(result[i - 1].createdAt).getTime(),
      );
    }
  });

  it('is deterministic', () => {
    const a = sortProperties(properties, 'relevance').map((item) => item.id);
    const b = sortProperties(properties, 'relevance').map((item) => item.id);
    expect(a).toEqual(b);
  });
});

describe('countActivePropertyFilters', () => {
  it('counts zero for the default filters', () => {
    expect(countActivePropertyFilters(baseFilters())).toBe(0);
  });

  it('counts each active dimension', () => {
    expect(
      countActivePropertyFilters({
        ...baseFilters(),
        query: 'f3',
        areas: ['cheraga', 'draria'],
        availableOnly: true,
        maxPrice: PRICE_BOUNDS.max - 1,
      }),
    ).toBe(5);
  });
});

describe('applyVehicleFilters', () => {
  it('returns everything by default', () => {
    expect(applyVehicleFilters(vehicles, DEFAULT_VEHICLE_FILTERS)).toHaveLength(vehicles.length);
  });

  it('filters by category', () => {
    const result = applyVehicleFilters(vehicles, {
      ...DEFAULT_VEHICLE_FILTERS,
      categories: ['luxe'],
    });
    expect(result.every((item) => item.category === 'luxe')).toBe(true);
  });

  it('filters by daily price range', () => {
    const result = applyVehicleFilters(vehicles, {
      ...DEFAULT_VEHICLE_FILTERS,
      minPrice: 10_000,
      maxPrice: 20_000,
    });
    expect(result.every((item) => item.dailyPrice >= 10_000 && item.dailyPrice <= 20_000)).toBe(true);
  });

  it('filters by transmission and seats', () => {
    const result = applyVehicleFilters(vehicles, {
      ...DEFAULT_VEHICLE_FILTERS,
      transmission: 'automatique',
      seats: 7,
    });
    expect(result.every((item) => item.transmission === 'automatique' && item.seats >= 7)).toBe(true);
  });

  it('filters available vehicles', () => {
    const result = applyVehicleFilters(vehicles, {
      ...DEFAULT_VEHICLE_FILTERS,
      availableOnly: true,
    });
    expect(result.every((item) => item.available)).toBe(true);
    expect(result.length).toBeLessThan(vehicles.length);
  });

  it('searches by brand', () => {
    const result = applyVehicleFilters(vehicles, { ...DEFAULT_VEHICLE_FILTERS, query: 'mercedes' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.brand.toLowerCase().includes('mercedes'))).toBe(true);
  });
});

describe('sortVehicles', () => {
  it('sorts by daily price', () => {
    const asc = sortVehicles(vehicles, 'price-asc');
    expect(asc[0].dailyPrice).toBe(Math.min(...vehicles.map((item) => item.dailyPrice)));
    const desc = sortVehicles(vehicles, 'price-desc');
    expect(desc[0].dailyPrice).toBe(Math.max(...vehicles.map((item) => item.dailyPrice)));
  });
});
