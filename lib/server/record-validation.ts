export const RECORD_TYPES = [
  'properties',
  'vehicles',
  'inquiries',
  'reservations',
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];
export type RecordPayload = Record<string, unknown>;

const TABLE_NAMES: Record<RecordType, string> = {
  properties: 'gwi_properties',
  vehicles: 'gwi_vehicles',
  inquiries: 'gwi_inquiries',
  reservations: 'gwi_reservations',
};

// These names are used only as trusted SQL identifiers after record-type validation.
export function tableForRecordType(type: RecordType): string {
  return TABLE_NAMES[type];
}

const REQUIRED_FIELDS: Record<RecordType, readonly string[]> = {
  properties: [
    'slug', 'reference', 'title', 'description', 'type', 'category', 'price',
    'priceUnit', 'currency', 'area', 'address', 'coordinates', 'surface',
    'bedrooms', 'bathrooms', 'furnished', 'amenities', 'images',
    'availability', 'conditions', 'featured',
  ],
  vehicles: [
    'slug', 'reference', 'brand', 'model', 'year', 'category', 'transmission',
    'fuel', 'seats', 'dailyPrice', 'currency', 'images', 'features', 'available',
    'pickup', 'conditions', 'description', 'featured',
  ],
  inquiries: ['type', 'status', 'channel', 'fullName', 'phone', 'message'],
  reservations: [
    'kind', 'itemId', 'itemReference', 'itemTitle', 'customerName', 'phone',
    'startDate', 'endDate', 'amount', 'deposit', 'status',
  ],
};

const PATCH_FIELDS: Record<RecordType, readonly string[]> = {
  properties: [
    'slug', 'reference', 'title', 'description', 'type', 'category',
    'rentalPeriod', 'price', 'priceUnit', 'currency', 'area', 'address',
    'coordinates', 'coordinatePrecision', 'surface', 'bedrooms', 'bathrooms',
    'floor', 'furnished', 'amenities', 'images', 'availability', 'conditions',
    'featured', 'isDemo',
  ],
  vehicles: [
    'slug', 'reference', 'brand', 'model', 'year', 'category', 'transmission',
    'fuel', 'seats', 'dailyPrice', 'currency', 'images', 'features', 'available',
    'pickup', 'conditions', 'description', 'featured', 'isDemo',
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

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export type ValidationResult =
  | { ok: true; value: RecordPayload }
  | { ok: false; error: string };

export function validateNewRecord(
  type: RecordType,
  input: unknown,
): ValidationResult {
  if (!isPlainRecord(input)) {
    return { ok: false, error: 'RECORD_MUST_BE_OBJECT' };
  }

  const missing = REQUIRED_FIELDS[type].filter((field) => !(field in input));
  if (missing.length > 0) {
    return { ok: false, error: 'MISSING_REQUIRED_FIELDS' };
  }

  if (type === 'properties') {
    if (!nonEmptyString(input.slug) || !nonEmptyString(input.reference) ||
        !isPlainRecord(input.title) || !isPlainRecord(input.description) ||
        !finiteNumber(input.price) || input.price < 0 ||
        !finiteNumber(input.surface) || input.surface < 0 ||
        !Array.isArray(input.images)) {
      return { ok: false, error: 'INVALID_PROPERTY_RECORD' };
    }
  }

  if (type === 'vehicles') {
    if (!nonEmptyString(input.slug) || !nonEmptyString(input.reference) ||
        !nonEmptyString(input.brand) || !nonEmptyString(input.model) ||
        !finiteNumber(input.year) || !finiteNumber(input.dailyPrice) ||
        input.dailyPrice < 0 || !Array.isArray(input.images)) {
      return { ok: false, error: 'INVALID_VEHICLE_RECORD' };
    }
  }

  if (type === 'inquiries') {
    if (!nonEmptyString(input.fullName) || !nonEmptyString(input.phone) ||
        !nonEmptyString(input.message)) {
      return { ok: false, error: 'INVALID_INQUIRY_RECORD' };
    }
  }

  if (type === 'reservations') {
    if (!nonEmptyString(input.customerName) || !nonEmptyString(input.phone) ||
        !nonEmptyString(input.itemId) || !nonEmptyString(input.startDate) ||
        !nonEmptyString(input.endDate) || !finiteNumber(input.amount) ||
        !finiteNumber(input.deposit) || input.amount < 0 || input.deposit < 0 ||
        input.endDate <= input.startDate) {
      return { ok: false, error: 'INVALID_RESERVATION_RECORD' };
    }
  }

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

  const value = { ...input };
  delete value.id;
  delete value.createdAt;
  delete value.updatedAt;

  if (Object.keys(value).length === 0) return { ok: false, error: 'EMPTY_PATCH' };
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
  if ('slug' in value && !nonEmptyString(value.slug)) {
    return { ok: false, error: 'INVALID_SLUG' };
  }
  if (type === 'properties' || type === 'vehicles') value.isDemo = false;
  return { ok: true, value };
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
  if (!nonEmptyString(record.id)) record.id = createRecordId(type);
  record.createdAt = now.toISOString();
  if (type === 'properties' || type === 'vehicles') record.isDemo = false;
  return record;
}
