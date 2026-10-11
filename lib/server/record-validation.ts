import { isValidEmail, isValidPhone } from '@/lib/validation';

export const RECORD_TYPES = [
  'properties',
  'vehicles',
  'inquiries',
  'reservations',
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];
export type RecordPayload = Record<string, unknown>;

const AREA_IDS = [
  'bab-ezzouar',
  'cheraga',
  'draria',
  'dely-ibrahim',
  'el-achour',
  'douaouda-marine',
  'bordj-el-kiffan',
  'ouled-fayet',
  'dar-el-beida',
] as const;

const PROPERTY_TYPES = ['F2', 'F3', 'F4', 'F5', 'Studio', 'Villa', 'Bureau'] as const;
const LISTING_CATEGORIES = ['rent', 'sale', 'exchange'] as const;
const PRICE_UNITS = ['day', 'month', 'year', 'total'] as const;
const RENTAL_PERIODS = ['daily', 'monthly', 'annual'] as const;
const AVAILABILITY_STATUSES = ['available', 'reserved', 'unavailable'] as const;
const COORDINATE_PRECISIONS = ['exact', 'approximate', 'area'] as const;
const VEHICLE_CATEGORIES = ['economique', 'berline', 'suv', 'luxe', 'utilitaire'] as const;
const TRANSMISSIONS = ['manuelle', 'automatique'] as const;
const FUEL_TYPES = ['essence', 'diesel', 'hybride', 'electrique'] as const;
const INQUIRY_TYPES = ['property', 'vehicle', 'general'] as const;
const INQUIRY_STATUSES = ['new', 'contacted', 'confirmed', 'cancelled'] as const;
const INQUIRY_CHANNELS = ['whatsapp', 'form'] as const;
const RESERVATION_KINDS = ['property', 'vehicle'] as const;
const RESERVATION_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const;

const CREATE_FIELDS: Record<RecordType, readonly string[]> = {
  properties: [
    'slug', 'reference', 'title', 'description', 'type', 'category', 'rentalPeriod',
    'price', 'priceUnit', 'currency', 'area', 'address', 'coordinates',
    'coordinatePrecision', 'surface', 'bedrooms', 'bathrooms', 'floor', 'furnished',
    'amenities', 'images', 'availability', 'conditions', 'featured', 'isDemo',
  ],
  vehicles: [
    'slug', 'reference', 'brand', 'model', 'year', 'category', 'transmission', 'fuel',
    'seats', 'dailyPrice', 'currency', 'images', 'features', 'available', 'pickup',
    'conditions', 'description', 'featured', 'isDemo',
  ],
  inquiries: [
    'type', 'status', 'channel', 'fullName', 'phone', 'email', 'message',
    'propertyId', 'vehicleId', 'startDate', 'endDate',
  ],
  reservations: [
    'kind', 'itemId', 'itemReference', 'itemTitle', 'customerName', 'phone',
    'startDate', 'endDate', 'amount', 'deposit', 'status', 'notes',
  ],
};

const PATCH_FIELDS: Record<RecordType, readonly string[]> = {
  properties: CREATE_FIELDS.properties,
  vehicles: CREATE_FIELDS.vehicles,
  inquiries: CREATE_FIELDS.inquiries,
  reservations: CREATE_FIELDS.reservations,
};

export function parseRecordType(value: unknown): RecordType | null {
  return typeof value === 'string' &&
    (RECORD_TYPES as readonly string[]).includes(value)
    ? (value as RecordType)
    : null;
}

export function isPlainRecord(value: unknown): value is RecordPayload {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function nonEmptyString(value: unknown, maxLength = 500): value is string {
  return typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maxLength;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isEnumValue<T extends string>(
  value: unknown,
  options: readonly T[],
): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isTranslated(value: unknown): boolean {
  return isPlainRecord(value) &&
    nonEmptyString(value.fr, 5000) &&
    nonEmptyString(value.ar, 5000);
}

function isGeoPoint(value: unknown): boolean {
  return isPlainRecord(value) &&
    finiteNumber(value.lat) &&
    finiteNumber(value.lng) &&
    value.lat >= -90 && value.lat <= 90 &&
    value.lng >= -180 && value.lng <= 180;
}

function isImages(value: unknown): boolean {
  return Array.isArray(value) &&
    value.length <= 30 &&
    value.every((image) =>
      typeof image === 'string' &&
      image.length <= 2048 &&
      (/^https:\/\//i.test(image) || /^\/images\/[A-Za-z0-9_./-]+$/.test(image)) &&
      !image.includes('..'),
    );
}

function isStringArray(value: unknown, maximum = 100): boolean {
  return Array.isArray(value) &&
    value.length <= maximum &&
    value.every((item) => nonEmptyString(item, 200));
}

function isDateRange(start: unknown, end: unknown): boolean {
  return isIsoDate(start) && isIsoDate(end) && end > start;
}

export type ValidationResult =
  | { ok: true; value: RecordPayload }
  | { ok: false; error: string };

function validateShape(type: RecordType, value: RecordPayload): string | null {
  if (!nonEmptyString(value.slug, 180) && (type === 'properties' || type === 'vehicles')) {
    return 'INVALID_SLUG';
  }

  if (type === 'properties') {
    if (
      !nonEmptyString(value.reference, 80) ||
      !isTranslated(value.title) ||
      !isTranslated(value.description) ||
      !isEnumValue(value.type, PROPERTY_TYPES) ||
      !isEnumValue(value.category, LISTING_CATEGORIES) ||
      (value.rentalPeriod !== undefined && !isEnumValue(value.rentalPeriod, RENTAL_PERIODS)) ||
      !finiteNumber(value.price) || value.price < 0 || value.price > 1_000_000_000_000 ||
      !isEnumValue(value.priceUnit, PRICE_UNITS) ||
      value.currency !== 'DZD' ||
      !isEnumValue(value.area, AREA_IDS) ||
      !isTranslated(value.address) ||
      !isGeoPoint(value.coordinates) ||
      !isEnumValue(value.coordinatePrecision, COORDINATE_PRECISIONS) ||
      !finiteNumber(value.surface) || value.surface < 0 || value.surface > 1_000_000 ||
      !Number.isInteger(value.bedrooms) || (value.bedrooms as number) < 0 ||
      !Number.isInteger(value.bathrooms) || (value.bathrooms as number) < 0 ||
      (value.floor !== undefined && (!Number.isInteger(value.floor) || (value.floor as number) < -20 || (value.floor as number) > 300)) ||
      typeof value.furnished !== 'boolean' ||
      !isStringArray(value.amenities) ||
      !isImages(value.images) ||
      !isPlainRecord(value.availability) ||
      !isEnumValue(value.availability.status, AVAILABILITY_STATUSES) ||
      !isIsoDate(value.availability.availableFrom) ||
      (value.availability.availableTo !== undefined &&
        !isIsoDate(value.availability.availableTo)) ||
      !Array.isArray(value.conditions) ||
      !value.conditions.every(isTranslated) ||
      typeof value.featured !== 'boolean'
    ) return 'INVALID_PROPERTY_RECORD';
  }

  if (type === 'vehicles') {
    if (
      !nonEmptyString(value.reference, 80) ||
      !nonEmptyString(value.brand, 120) ||
      !nonEmptyString(value.model, 120) ||
      !Number.isInteger(value.year) || (value.year as number) < 1950 || (value.year as number) > 2100 ||
      !isEnumValue(value.category, VEHICLE_CATEGORIES) ||
      !isEnumValue(value.transmission, TRANSMISSIONS) ||
      !isEnumValue(value.fuel, FUEL_TYPES) ||
      !Number.isInteger(value.seats) || (value.seats as number) < 1 || (value.seats as number) > 100 ||
      !finiteNumber(value.dailyPrice) || value.dailyPrice < 0 || value.dailyPrice > 1_000_000_000 ||
      value.currency !== 'DZD' ||
      !isImages(value.images) ||
      !isStringArray(value.features) ||
      typeof value.available !== 'boolean' ||
      !isPlainRecord(value.pickup) ||
      !isEnumValue(value.pickup.area, AREA_IDS) ||
      !isTranslated(value.pickup.address) ||
      !isGeoPoint(value.pickup.coordinates) ||
      !Array.isArray(value.conditions) ||
      !value.conditions.every(isTranslated) ||
      !isTranslated(value.description) ||
      typeof value.featured !== 'boolean'
    ) return 'INVALID_VEHICLE_RECORD';
  }

  if (type === 'inquiries') {
    if (
      !isEnumValue(value.type, INQUIRY_TYPES) ||
      !isEnumValue(value.status, INQUIRY_STATUSES) ||
      !isEnumValue(value.channel, INQUIRY_CHANNELS) ||
      !nonEmptyString(value.fullName, 160) ||
      !nonEmptyString(value.phone, 80) ||
      !nonEmptyString(value.message, 5000) ||
      (value.email !== undefined &&
        (typeof value.email !== 'string' || value.email.length > 320)) ||
      (value.propertyId !== undefined && !nonEmptyString(value.propertyId, 160)) ||
      (value.vehicleId !== undefined && !nonEmptyString(value.vehicleId, 160)) ||
      (value.startDate !== undefined && !isIsoDate(value.startDate)) ||
      (value.endDate !== undefined && !isIsoDate(value.endDate)) ||
      ((value.startDate === undefined) !== (value.endDate === undefined)) ||
      (value.startDate !== undefined && !isDateRange(value.startDate, value.endDate))
    ) return 'INVALID_INQUIRY_RECORD';
  }

  if (type === 'reservations') {
    if (
      !isEnumValue(value.kind, RESERVATION_KINDS) ||
      !nonEmptyString(value.itemId, 160) ||
      !nonEmptyString(value.itemReference, 100) ||
      !isTranslated(value.itemTitle) ||
      !nonEmptyString(value.customerName, 160) ||
      !nonEmptyString(value.phone, 80) ||
      !isDateRange(value.startDate, value.endDate) ||
      !finiteNumber(value.amount) || value.amount < 0 || value.amount > 1_000_000_000_000 ||
      !finiteNumber(value.deposit) || value.deposit < 0 || value.deposit > value.amount ||
      !isEnumValue(value.status, RESERVATION_STATUSES) ||
      (value.notes !== undefined && (typeof value.notes !== 'string' || value.notes.length > 5000))
    ) return 'INVALID_RESERVATION_RECORD';
  }

  return null;
}

export function validateNewRecord(
  type: RecordType,
  input: unknown,
): ValidationResult {
  if (!isPlainRecord(input)) return { ok: false, error: 'RECORD_MUST_BE_OBJECT' };

  if (Object.keys(input).some((key) => !CREATE_FIELDS[type].includes(key))) {
    return { ok: false, error: 'RECORD_CONTAINS_UNSUPPORTED_FIELDS' };
  }

  if (Object.prototype.hasOwnProperty.call(input, 'id') ||
      Object.prototype.hasOwnProperty.call(input, 'createdAt') ||
      Object.prototype.hasOwnProperty.call(input, 'updatedAt')) {
    return { ok: false, error: 'SERVER_OWNED_FIELD' };
  }

  const missing = [
    ...({
      properties: ['slug', 'reference', 'title', 'description', 'type', 'category', 'price',
        'priceUnit', 'currency', 'area', 'address', 'coordinates', 'coordinatePrecision',
        'surface', 'bedrooms', 'bathrooms', 'furnished', 'amenities', 'images',
        'availability', 'conditions', 'featured'],
      vehicles: ['slug', 'reference', 'brand', 'model', 'year', 'category', 'transmission',
        'fuel', 'seats', 'dailyPrice', 'currency', 'images', 'features', 'available',
        'pickup', 'conditions', 'description', 'featured'],
      inquiries: ['type', 'status', 'channel', 'fullName', 'phone', 'message'],
      reservations: ['kind', 'itemId', 'itemReference', 'itemTitle', 'customerName', 'phone',
        'startDate', 'endDate', 'amount', 'deposit', 'status'],
    } satisfies Record<RecordType, readonly string[]>)[type],
  ].filter((field) => !(field in input));
  if (missing.length > 0) return { ok: false, error: 'MISSING_REQUIRED_FIELDS' };

  const error = validateShape(type, input);
  if (error) return { ok: false, error };
  return { ok: true, value: { ...input } };
}

export function validateRecordPatch(
  type: RecordType,
  input: unknown,
): ValidationResult {
  if (!isPlainRecord(input)) return { ok: false, error: 'PATCH_MUST_BE_OBJECT' };
  const keys = Object.keys(input);
  if (keys.length === 0) return { ok: false, error: 'EMPTY_PATCH' };
  if (keys.some((key) => !PATCH_FIELDS[type].includes(key))) {
    return { ok: false, error: 'PATCH_CONTAINS_UNSUPPORTED_FIELDS' };
  }
  if (Object.prototype.hasOwnProperty.call(input, 'id') ||
      Object.prototype.hasOwnProperty.call(input, 'createdAt') ||
      Object.prototype.hasOwnProperty.call(input, 'updatedAt')) {
    return { ok: false, error: 'SERVER_OWNED_FIELD' };
  }

  const value = { ...input };
  if (type === 'properties' && 'isDemo' in value) value.isDemo = false;
  if (type === 'vehicles' && 'isDemo' in value) value.isDemo = false;

  if ('price' in value && (!finiteNumber(value.price) || value.price < 0)) {
    return { ok: false, error: 'INVALID_PRICE' };
  }
  if ('dailyPrice' in value && (!finiteNumber(value.dailyPrice) || value.dailyPrice < 0)) {
    return { ok: false, error: 'INVALID_DAILY_PRICE' };
  }
  if ('amount' in value && (!finiteNumber(value.amount) || value.amount < 0)) {
    return { ok: false, error: 'INVALID_AMOUNT' };
  }
  if ('deposit' in value && (!finiteNumber(value.deposit) || value.deposit < 0)) {
    return { ok: false, error: 'INVALID_DEPOSIT' };
  }

  // Validate the supplied fields' types before merging them with persisted data.
  if ('slug' in value && !nonEmptyString(value.slug, 180)) return { ok: false, error: 'INVALID_SLUG' };
  if ('title' in value && !isTranslated(value.title)) return { ok: false, error: 'INVALID_TITLE' };
  if ('description' in value && !isTranslated(value.description)) return { ok: false, error: 'INVALID_DESCRIPTION' };
  if ('address' in value && !isTranslated(value.address)) return { ok: false, error: 'INVALID_ADDRESS' };
  if ('coordinates' in value && !isGeoPoint(value.coordinates)) return { ok: false, error: 'INVALID_COORDINATES' };
  if ('images' in value && !isImages(value.images)) return { ok: false, error: 'INVALID_IMAGES' };
  if ('amenities' in value && !isStringArray(value.amenities)) return { ok: false, error: 'INVALID_AMENITIES' };
  if ('features' in value && !isStringArray(value.features)) return { ok: false, error: 'INVALID_FEATURES' };
  if ('conditions' in value && (!Array.isArray(value.conditions) || !value.conditions.every(isTranslated))) {
    return { ok: false, error: 'INVALID_CONDITIONS' };
  }
  if ('status' in value) {
    const statuses =
      type === 'inquiries' ? INQUIRY_STATUSES :
      type === 'reservations' ? RESERVATION_STATUSES : null;
    if (statuses && !isEnumValue(value.status, statuses)) return { ok: false, error: 'INVALID_STATUS' };
  }
  if (type === 'properties') {
    if ('type' in value && !isEnumValue(value.type, PROPERTY_TYPES)) return { ok: false, error: 'INVALID_PROPERTY_TYPE' };
    if ('category' in value && !isEnumValue(value.category, LISTING_CATEGORIES)) return { ok: false, error: 'INVALID_CATEGORY' };
    if ('rentalPeriod' in value && value.rentalPeriod !== undefined &&
      !isEnumValue(value.rentalPeriod, RENTAL_PERIODS)) return { ok: false, error: 'INVALID_RENTAL_PERIOD' };
    if ('priceUnit' in value && !isEnumValue(value.priceUnit, PRICE_UNITS)) return { ok: false, error: 'INVALID_PRICE_UNIT' };
    if ('area' in value && !isEnumValue(value.area, AREA_IDS)) return { ok: false, error: 'INVALID_AREA' };
    if ('coordinatePrecision' in value && !isEnumValue(value.coordinatePrecision, COORDINATE_PRECISIONS)) return { ok: false, error: 'INVALID_COORDINATE_PRECISION' };
    if ('availability' in value &&
      (!isPlainRecord(value.availability) ||
       !isEnumValue(value.availability.status, AVAILABILITY_STATUSES) ||
       !isIsoDate(value.availability.availableFrom) ||
       (value.availability.availableTo !== undefined && !isIsoDate(value.availability.availableTo)))) {
      return { ok: false, error: 'INVALID_AVAILABILITY' };
    }
    if ('reference' in value && !nonEmptyString(value.reference, 80)) return { ok: false, error: 'INVALID_REFERENCE' };
    if ('currency' in value && value.currency !== 'DZD') return { ok: false, error: 'INVALID_CURRENCY' };
    if ('surface' in value && (!finiteNumber(value.surface) || value.surface < 0 || value.surface > 1_000_000)) {
      return { ok: false, error: 'INVALID_SURFACE' };
    }
    if ('bedrooms' in value && (!Number.isInteger(value.bedrooms) || (value.bedrooms as number) < 0 || (value.bedrooms as number) > 100)) {
      return { ok: false, error: 'INVALID_BEDROOMS' };
    }
    if ('bathrooms' in value && (!Number.isInteger(value.bathrooms) || (value.bathrooms as number) < 0 || (value.bathrooms as number) > 100)) {
      return { ok: false, error: 'INVALID_BATHROOMS' };
    }
    if ('floor' in value && value.floor !== undefined &&
      (!Number.isInteger(value.floor) || (value.floor as number) < -20 || (value.floor as number) > 300)) {
      return { ok: false, error: 'INVALID_FLOOR' };
    }
    if ('price' in value && finiteNumber(value.price) && value.price > 1_000_000_000_000) {
      return { ok: false, error: 'INVALID_PRICE' };
    }
    if ('availability' in value && isPlainRecord(value.availability) &&
      isIsoDate(value.availability.availableFrom) &&
      isIsoDate(value.availability.availableTo) &&
      value.availability.availableTo < value.availability.availableFrom) {
      return { ok: false, error: 'INVALID_AVAILABILITY_RANGE' };
    }
    if ('furnished' in value && typeof value.furnished !== 'boolean') return { ok: false, error: 'INVALID_FURNISHED' };
    if ('featured' in value && typeof value.featured !== 'boolean') return { ok: false, error: 'INVALID_FEATURED' };
  }
  if (type === 'vehicles') {
    if ('category' in value && !isEnumValue(value.category, VEHICLE_CATEGORIES)) return { ok: false, error: 'INVALID_CATEGORY' };
    if ('transmission' in value && !isEnumValue(value.transmission, TRANSMISSIONS)) return { ok: false, error: 'INVALID_TRANSMISSION' };
    if ('fuel' in value && !isEnumValue(value.fuel, FUEL_TYPES)) return { ok: false, error: 'INVALID_FUEL' };
    if ('reference' in value && !nonEmptyString(value.reference, 80)) return { ok: false, error: 'INVALID_REFERENCE' };
    if ('brand' in value && !nonEmptyString(value.brand, 120)) return { ok: false, error: 'INVALID_BRAND' };
    if ('model' in value && !nonEmptyString(value.model, 120)) return { ok: false, error: 'INVALID_MODEL' };
    if ('year' in value && (!Number.isInteger(value.year) || (value.year as number) < 1950 || (value.year as number) > 2100)) {
      return { ok: false, error: 'INVALID_YEAR' };
    }
    if ('seats' in value && (!Number.isInteger(value.seats) || (value.seats as number) < 1 || (value.seats as number) > 100)) {
      return { ok: false, error: 'INVALID_SEATS' };
    }
    if ('dailyPrice' in value && finiteNumber(value.dailyPrice) && value.dailyPrice > 1_000_000_000) {
      return { ok: false, error: 'INVALID_DAILY_PRICE' };
    }
    if ('currency' in value && value.currency !== 'DZD') return { ok: false, error: 'INVALID_CURRENCY' };
    if ('available' in value && typeof value.available !== 'boolean') return { ok: false, error: 'INVALID_AVAILABILITY' };
    if ('featured' in value && typeof value.featured !== 'boolean') return { ok: false, error: 'INVALID_FEATURED' };
    if ('pickup' in value &&
      (!isPlainRecord(value.pickup) ||
       !isEnumValue(value.pickup.area, AREA_IDS) ||
       !isTranslated(value.pickup.address) ||
       !isGeoPoint(value.pickup.coordinates))) return { ok: false, error: 'INVALID_PICKUP' };
  }
  if (type === 'inquiries') {
    if ('type' in value && !isEnumValue(value.type, INQUIRY_TYPES)) return { ok: false, error: 'INVALID_INQUIRY_TYPE' };
    if ('channel' in value && !isEnumValue(value.channel, INQUIRY_CHANNELS)) return { ok: false, error: 'INVALID_CHANNEL' };
    if ('fullName' in value && !nonEmptyString(value.fullName, 160)) return { ok: false, error: 'INVALID_FULL_NAME' };
    if ('phone' in value && (!nonEmptyString(value.phone, 80) || !isValidPhone(value.phone))) {
      return { ok: false, error: 'INVALID_PHONE' };
    }
    if ('message' in value && (!nonEmptyString(value.message, 5000) || value.message.trim().length < 10)) {
      return { ok: false, error: 'INVALID_MESSAGE' };
    }
    if ('email' in value && (
      typeof value.email !== 'string' ||
      value.email.length > 320 ||
      (!!value.email.trim() && !isValidEmail(value.email))
    )) return { ok: false, error: 'INVALID_EMAIL' };
    if ('propertyId' in value && !nonEmptyString(value.propertyId, 160)) return { ok: false, error: 'INVALID_PROPERTY_ID' };
    if ('vehicleId' in value && !nonEmptyString(value.vehicleId, 160)) return { ok: false, error: 'INVALID_VEHICLE_ID' };
    if ('startDate' in value && !isIsoDate(value.startDate)) return { ok: false, error: 'INVALID_START_DATE' };
    if ('endDate' in value && !isIsoDate(value.endDate)) return { ok: false, error: 'INVALID_END_DATE' };
    if (('startDate' in value) !== ('endDate' in value)) {
      return { ok: false, error: 'DATE_RANGE_REQUIRES_BOTH' };
    }
    if ('startDate' in value && 'endDate' in value && !isDateRange(value.startDate, value.endDate)) {
      return { ok: false, error: 'INVALID_DATE_RANGE' };
    }
    if ('type' in value) {
      if (value.type === 'general' && ('propertyId' in value || 'vehicleId' in value)) {
        return { ok: false, error: 'INVALID_LISTING_REFERENCE' };
      }
      if (value.type === 'property' && 'vehicleId' in value) {
        return { ok: false, error: 'INVALID_LISTING_REFERENCE' };
      }
      if (value.type === 'vehicle' && 'propertyId' in value) {
        return { ok: false, error: 'INVALID_LISTING_REFERENCE' };
      }
    }
  }
  if (type === 'reservations') {
    if ('kind' in value && !isEnumValue(value.kind, RESERVATION_KINDS)) return { ok: false, error: 'INVALID_RESERVATION_KIND' };
    if ('itemId' in value && !nonEmptyString(value.itemId, 160)) return { ok: false, error: 'INVALID_ITEM_ID' };
    if ('itemReference' in value && !nonEmptyString(value.itemReference, 100)) return { ok: false, error: 'INVALID_ITEM_REFERENCE' };
    if ('itemTitle' in value && !isTranslated(value.itemTitle)) return { ok: false, error: 'INVALID_ITEM_TITLE' };
    if ('customerName' in value && !nonEmptyString(value.customerName, 160)) return { ok: false, error: 'INVALID_CUSTOMER_NAME' };
    if ('phone' in value && (!nonEmptyString(value.phone, 80) || !isValidPhone(value.phone))) return { ok: false, error: 'INVALID_PHONE' };
    if ('amount' in value && finiteNumber(value.amount) && value.amount > 1_000_000_000_000) {
      return { ok: false, error: 'INVALID_AMOUNT' };
    }
    if ('deposit' in value && finiteNumber(value.deposit) && value.deposit > 1_000_000_000_000) {
      return { ok: false, error: 'INVALID_DEPOSIT' };
    }
    if ('notes' in value && value.notes !== undefined &&
      (typeof value.notes !== 'string' || value.notes.length > 5000)) {
      return { ok: false, error: 'INVALID_NOTES' };
    }
    if ('startDate' in value && !isIsoDate(value.startDate)) return { ok: false, error: 'INVALID_START_DATE' };
    if ('endDate' in value && !isIsoDate(value.endDate)) return { ok: false, error: 'INVALID_END_DATE' };
    if (('startDate' in value) !== ('endDate' in value)) {
      return { ok: false, error: 'DATE_RANGE_REQUIRES_BOTH' };
    }
    if ('startDate' in value && 'endDate' in value && !isDateRange(value.startDate, value.endDate)) {
      return { ok: false, error: 'INVALID_DATE_RANGE' };
    }
    if ('amount' in value && 'deposit' in value &&
      finiteNumber(value.amount) && finiteNumber(value.deposit) && value.deposit > value.amount) {
      return { ok: false, error: 'DEPOSIT_EXCEEDS_AMOUNT' };
    }
  }
  for (const key of ['reference', 'brand', 'model', 'itemReference', 'phone', 'fullName', 'customerName'] as const) {
    if (key in value && typeof value[key] === 'string' && value[key].length > 500) {
      return { ok: false, error: 'FIELD_TOO_LONG' };
    }
  }

  return Object.keys(value).length > 0
    ? { ok: true, value }
    : { ok: false, error: 'EMPTY_PATCH' };
}

export function createRecordId(type: RecordType): string {
  const prefix: Record<RecordType, string> = {
    properties: 'p',
    vehicles: 'v',
    inquiries: 'i',
    reservations: 'r',
  };
  return prefix[type] + '-' + crypto.randomUUID();
}

export function prepareNewRecord(
  type: RecordType,
  value: RecordPayload,
  now = new Date(),
): RecordPayload {
  const record = { ...value };
  // Identity and timestamps are server-owned regardless of the submitted body.
  record.id = createRecordId(type);
  record.createdAt = now.toISOString();
  if (type === 'properties' || type === 'vehicles') record.isDemo = false;
  return record;
}
