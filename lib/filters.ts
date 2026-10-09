import type {
  Property,
  PropertyFilters,
  SortOption,
  Vehicle,
  VehicleFilters,
  PropertyType,
  RentalPeriod,
} from '@/types';

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
  query: '',
  areas: [],
  types: [],
  periods: [],
  categories: [],
  minPrice: 0,
  maxPrice: 300_000_000,
  furnished: 'all',
  availableOnly: false,
  bedrooms: 0,
};

export const PRICE_BOUNDS = { min: 0, max: 300_000_000 } as const;

export const DEFAULT_VEHICLE_FILTERS: VehicleFilters = {
  query: '',
  categories: [],
  minPrice: 0,
  maxPrice: 60_000,
  transmission: 'all',
  seats: 0,
  availableOnly: false,
};

export const VEHICLE_PRICE_BOUNDS = { min: 0, max: 60_000 } as const;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** Free-text match on reference, titles (both languages), area and type. */
function matchesQuery(property: Property, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(
    [
      property.title.fr,
      property.title.ar,
      property.reference,
      property.area,
      property.type,
      property.address.fr,
      property.address.ar,
    ].join(' '),
  );
  return haystack.includes(q);
}

export function applyPropertyFilters(
  items: Property[],
  filters: Partial<PropertyFilters>,
): Property[] {
  const {
    query = '',
    areas = [],
    types = [],
    periods = [],
    categories = [],
    minPrice = PRICE_BOUNDS.min,
    maxPrice = PRICE_BOUNDS.max,
    furnished = 'all',
    availableOnly = false,
    bedrooms = 0,
    availableFrom,
  } = filters;

  return items.filter((item) => {
    if (!matchesQuery(item, query)) return false;
    if (areas.length && !areas.includes(item.area)) return false;
    if (types.length && !types.includes(item.type)) return false;
    if (periods.length && !(item.rentalPeriod && periods.includes(item.rentalPeriod))) return false;
    if (categories.length && !categories.includes(item.category)) return false;
    if (item.price < minPrice || item.price > maxPrice) return false;
    if (furnished === 'furnished' && !item.furnished) return false;
    if (furnished === 'unfurnished' && item.furnished) return false;
    if (bedrooms > 0 && item.bedrooms < bedrooms) return false;
    if (availableOnly && item.availability.status !== 'available') return false;
    if (availableFrom && item.availability.availableFrom > availableFrom) return false;
    return true;
  });
}

/**
 * Relevance: featured first, then available, then newest.
 * Deterministic so the same input always yields the same order.
 */
export function sortProperties(items: Property[], sort: SortOption): Property[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price || a.reference.localeCompare(b.reference));
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price || a.reference.localeCompare(b.reference));
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'surface-desc':
      return copy.sort((a, b) => b.surface - a.surface || a.reference.localeCompare(b.reference));
    case 'relevance':
    default:
      return copy.sort((a, b) => {
        const score = (p: Property) =>
          (p.featured ? 4 : 0) +
          (p.availability.status === 'available' ? 2 : 0) +
          (p.availability.status === 'reserved' ? 1 : 0);
        const diff = score(b) - score(a);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
}

export function applyVehicleFilters(
  items: Vehicle[],
  filters: Partial<VehicleFilters>,
): Vehicle[] {
  const {
    query = '',
    categories = [],
    minPrice = VEHICLE_PRICE_BOUNDS.min,
    maxPrice = VEHICLE_PRICE_BOUNDS.max,
    transmission = 'all',
    seats = 0,
    availableOnly = false,
  } = filters;

  const q = normalize(query);

  return items.filter((item) => {
    if (q) {
      const haystack = normalize(
        [item.brand, item.model, item.reference, item.category, item.fuel, item.transmission].join(
          ' ',
        ),
      );
      if (!haystack.includes(q)) return false;
    }
    if (categories.length && !categories.includes(item.category)) return false;
    if (item.dailyPrice < minPrice || item.dailyPrice > maxPrice) return false;
    if (transmission !== 'all' && item.transmission !== transmission) return false;
    if (seats > 0 && item.seats < seats) return false;
    if (availableOnly && !item.available) return false;
    return true;
  });
}

export function sortVehicles(items: Vehicle[], sort: SortOption): Vehicle[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.dailyPrice - b.dailyPrice);
    case 'price-desc':
      return copy.sort((a, b) => b.dailyPrice - a.dailyPrice);
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'surface-desc':
      return copy.sort((a, b) => b.seats - a.seats || b.year - a.year);
    case 'relevance':
    default:
      return copy.sort((a, b) => {
        const score = (v: Vehicle) => (v.featured ? 4 : 0) + (v.available ? 2 : 0);
        const diff = score(b) - score(a);
        if (diff !== 0) return diff;
        return a.dailyPrice - b.dailyPrice;
      });
  }
}

export function countActivePropertyFilters(filters: Partial<PropertyFilters>): number {
  let count = 0;
  if (filters.query?.trim()) count += 1;
  count += filters.areas?.length ?? 0;
  count += filters.types?.length ?? 0;
  count += filters.periods?.length ?? 0;
  count += filters.categories?.length ?? 0;
  if (filters.furnished && filters.furnished !== 'all') count += 1;
  if (filters.availableOnly) count += 1;
  if ((filters.bedrooms ?? 0) > 0) count += 1;
  if ((filters.minPrice ?? 0) > PRICE_BOUNDS.min) count += 1;
  if ((filters.maxPrice ?? PRICE_BOUNDS.max) < PRICE_BOUNDS.max) count += 1;
  return count;
}

export const PROPERTY_TYPES: PropertyType[] = ['Studio', 'F2', 'F3', 'F4', 'F5', 'Villa', 'Bureau'];

export const RENTAL_PERIODS: RentalPeriod[] = ['daily', 'monthly', 'annual'];
