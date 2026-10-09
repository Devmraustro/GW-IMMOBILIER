/**
 * Human-readable labels for the enumerated values stored on listings.
 *
 * The seed data stores short machine values (`'Villa'`, `'luxe'`, `'month'`).
 * Rendering them directly leaks untranslated strings into the Arabic
 * interface, so every enum is mapped through the active dictionary here.
 */
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { PriceUnit, PropertyType, VehicleCategory } from '@/types';

export const PROPERTY_TYPE_KEYS = {
  F2: 'typeF2',
  F3: 'typeF3',
  F4: 'typeF4',
  F5: 'typeF5',
  Studio: 'typeStudio',
  Villa: 'typeVilla',
  Bureau: 'typeBureau',
} as const satisfies Record<PropertyType, 'typeF2' | 'typeF3' | 'typeF4' | 'typeF5' | 'typeStudio' | 'typeVilla' | 'typeBureau'>;

export const VEHICLE_CATEGORY_KEYS = {
  economique: 'categoryEconomique',
  berline: 'categoryBerline',
  suv: 'categorySuv',
  luxe: 'categoryLuxe',
  utilitaire: 'categoryUtilitaire',
} as const satisfies Record<VehicleCategory, 'categoryEconomique' | 'categoryBerline' | 'categorySuv' | 'categoryLuxe' | 'categoryUtilitaire'>;

export const PRICE_UNIT_KEYS = {
  day: 'perDay',
  month: 'perMonth',
  year: 'perYear',
  total: 'total',
} as const satisfies Record<PriceUnit, 'perDay' | 'perMonth' | 'perYear' | 'total'>;

export function propertyTypeLabel(type: PropertyType, t: Dictionary): string {
  return t.properties[PROPERTY_TYPE_KEYS[type]];
}

export function vehicleCategoryLabel(category: VehicleCategory, t: Dictionary): string {
  return t.cars[VEHICLE_CATEGORY_KEYS[category]];
}

export function priceUnitLabel(unit: PriceUnit, t: Dictionary): string {
  return t.common[PRICE_UNIT_KEYS[unit]];
}
