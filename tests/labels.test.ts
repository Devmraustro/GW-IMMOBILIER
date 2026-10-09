import { describe, expect, it } from 'vitest';
import { fr } from '@/lib/i18n/dictionaries/fr';
import { ar } from '@/lib/i18n/dictionaries/ar';
import {
  PRICE_UNIT_KEYS,
  PROPERTY_TYPE_KEYS,
  VEHICLE_CATEGORY_KEYS,
  priceUnitLabel,
  propertyTypeLabel,
  vehicleCategoryLabel,
} from '@/lib/labels';
import { PROPERTY_TYPES } from '@/lib/filters';
import type { PriceUnit, VehicleCategory } from '@/types';

const PRICE_UNITS: PriceUnit[] = ['day', 'month', 'year', 'total'];
const VEHICLE_CATEGORIES: VehicleCategory[] = [
  'economique',
  'berline',
  'suv',
  'luxe',
  'utilitaire',
];

describe('enum labels', () => {
  it('covers every property type in both languages', () => {
    for (const type of PROPERTY_TYPES) {
      expect(propertyTypeLabel(type, fr)).toBeTruthy();
      expect(propertyTypeLabel(type, ar)).toBeTruthy();
      expect(PROPERTY_TYPE_KEYS[type]).toBeTruthy();
    }
  });

  it('translates property types that are words rather than codes', () => {
    // F2/F3… are codes and legitimately stay identical; words must change.
    expect(propertyTypeLabel('Villa', ar)).not.toBe(propertyTypeLabel('Villa', fr));
    expect(propertyTypeLabel('Studio', ar)).not.toBe(propertyTypeLabel('Studio', fr));
    expect(propertyTypeLabel('Bureau', ar)).not.toBe(propertyTypeLabel('Bureau', fr));
  });

  it('covers every vehicle category and price unit in both languages', () => {
    for (const category of VEHICLE_CATEGORIES) {
      expect(VEHICLE_CATEGORY_KEYS[category]).toBeTruthy();
      expect(vehicleCategoryLabel(category, fr)).toBeTruthy();
      expect(vehicleCategoryLabel(category, ar)).toBeTruthy();
      expect(vehicleCategoryLabel(category, ar)).not.toBe(vehicleCategoryLabel(category, fr));
    }
    for (const unit of PRICE_UNITS) {
      expect(priceUnitLabel(unit, fr)).toBeTruthy();
      expect(priceUnitLabel(unit, ar)).toBeTruthy();
      expect(PRICE_UNIT_KEYS[unit]).toBeTruthy();
    }
  });

  it('never renders a raw machine value', () => {
    const rawValues = [...VEHICLE_CATEGORIES, ...PRICE_UNITS];
    for (const raw of rawValues) {
      if (raw === 'day' || raw === 'month' || raw === 'year' || raw === 'total') {
        expect(priceUnitLabel(raw as PriceUnit, fr)).not.toBe(raw);
      } else {
        expect(vehicleCategoryLabel(raw as VehicleCategory, fr)).not.toBe(raw);
      }
    }
  });
});
