import { describe, expect, it } from 'vitest';
import {
  createRecordId,
  parseRecordType,
  prepareNewRecord,
  validateNewRecord,
  validateRecordPatch,
} from '@/lib/server/record-validation';

const validProperty = {
  slug: 'f3-bab-ezzouar-pro',
  reference: 'GWI-N-0001',
  title: { fr: 'Appartement F3', ar: 'شقة F3' },
  description: { fr: 'Description', ar: 'وصف' },
  type: 'F3',
  category: 'rent',
  price: 65000,
  priceUnit: 'month',
  currency: 'DZD',
  area: 'bab-ezzouar',
  address: { fr: 'Bab Ezzouar', ar: 'باب الزوار' },
  coordinates: { lat: 36.72, lng: 3.18 },
  coordinatePrecision: 'approximate',
  surface: 85,
  bedrooms: 2,
  bathrooms: 1,
  furnished: true,
  amenities: [],
  images: ['/images/fallback/property-1.svg'],
  availability: { status: 'available', availableFrom: '2026-10-11' },
  conditions: [],
  featured: false,
  isDemo: true,
};

describe('admin record validation', () => {
  it('accepts only known collection names', () => {
    expect(parseRecordType('properties')).toBe('properties');
    expect(parseRecordType('audit')).toBeNull();
    expect(parseRecordType('gwi_properties; DROP TABLE users;')).toBeNull();
    expect(parseRecordType(null)).toBeNull();
  });

  it('rejects payloads that are not plain objects', () => {
    expect(validateNewRecord('properties', null)).toEqual({
      ok: false,
      error: 'RECORD_MUST_BE_OBJECT',
    });
    expect(validateNewRecord('properties', [])).toEqual({
      ok: false,
      error: 'RECORD_MUST_BE_OBJECT',
    });
  });

  it('reports missing required property fields', () => {
    expect(validateNewRecord('properties', { slug: 'only-a-slug' })).toEqual({
      ok: false,
      error: 'MISSING_REQUIRED_FIELDS',
    });
  });

  it('validates a property and sets server-owned metadata', () => {
    const result = validateNewRecord('properties', validProperty);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected valid property');

    const createdAt = new Date('2026-10-11T01:00:00.000Z');
    const prepared = prepareNewRecord('properties', result.value, createdAt);
    expect(prepared.id).toMatch(/^p-/);
    expect(prepared.createdAt).toBe(createdAt.toISOString());
    expect(prepared.isDemo).toBe(false);
  });

  it('rejects negative values and malformed vehicle data', () => {
    expect(validateNewRecord('properties', { ...validProperty, price: -1 })).toEqual({
      ok: false,
      error: 'INVALID_PROPERTY_RECORD',
    });
    expect(validateNewRecord('vehicles', { brand: 'Only a brand' })).toEqual({
      ok: false,
      error: 'MISSING_REQUIRED_FIELDS',
    });
  });

  it('rejects client changes to ids/timestamps and unsupported fields', () => {
    expect(validateRecordPatch('properties', { id: 'forged-id' })).toEqual({
      ok: false,
      error: 'PATCH_CONTAINS_UNSUPPORTED_FIELDS',
    });
    expect(validateRecordPatch('properties', { createdAt: '2000-01-01' })).toEqual({
      ok: false,
      error: 'PATCH_CONTAINS_UNSUPPORTED_FIELDS',
    });
    expect(validateRecordPatch('properties', { passwordHash: 'x' })).toEqual({
      ok: false,
      error: 'PATCH_CONTAINS_UNSUPPORTED_FIELDS',
    });
  });

  it('forces real property edits away from demo status', () => {
    const result = validateRecordPatch('properties', {
      isDemo: true,
      featured: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected valid patch');
    expect(result.value.isDemo).toBe(false);
  });

  it('rejects empty patches and invalid numeric updates', () => {
    expect(validateRecordPatch('vehicles', {})).toEqual({
      ok: false,
      error: 'EMPTY_PATCH',
    });
    expect(validateRecordPatch('vehicles', { dailyPrice: -100 })).toEqual({
      ok: false,
      error: 'INVALID_DAILY_PRICE',
    });
  });

  it('creates prefixed identifiers suitable for all collections', () => {
    expect(createRecordId('properties')).toMatch(/^p-[0-9a-f-]+$/i);
    expect(createRecordId('vehicles')).toMatch(/^v-[0-9a-f-]+$/i);
    expect(createRecordId('inquiries')).toMatch(/^i-[0-9a-f-]+$/i);
    expect(createRecordId('reservations')).toMatch(/^r-[0-9a-f-]+$/i);
  });

  it('rejects invalid partial property and vehicle fields', () => {
    expect(validateRecordPatch('properties', { bedrooms: 'two' })).toEqual({
      ok: false,
      error: 'INVALID_BEDROOMS',
    });
    expect(validateRecordPatch('properties', { currency: 'USD' })).toEqual({
      ok: false,
      error: 'INVALID_CURRENCY',
    });
    expect(validateRecordPatch('vehicles', { year: 1800 })).toEqual({
      ok: false,
      error: 'INVALID_YEAR',
    });
    expect(validateRecordPatch('vehicles', { featured: 'yes' })).toEqual({
      ok: false,
      error: 'INVALID_FEATURED',
    });
  });

  it('validates inquiry contact fields and full date ranges on patch', () => {
    expect(validateRecordPatch('inquiries', { phone: 'not-a-phone' })).toEqual({
      ok: false,
      error: 'INVALID_PHONE',
    });
    expect(validateRecordPatch('inquiries', { email: 'not-an-email' })).toEqual({
      ok: false,
      error: 'INVALID_EMAIL',
    });
    expect(validateRecordPatch('inquiries', { startDate: '2026-10-20' })).toEqual({
      ok: false,
      error: 'DATE_RANGE_REQUIRES_BOTH',
    });
  });

  it('rejects partial reservation date ranges and deposits larger than amounts', () => {
    expect(validateRecordPatch('reservations', { endDate: '2026-10-20' })).toEqual({
      ok: false,
      error: 'DATE_RANGE_REQUIRES_BOTH',
    });
    expect(validateRecordPatch('reservations', { amount: 100, deposit: 120 })).toEqual({
      ok: false,
      error: 'DEPOSIT_EXCEEDS_AMOUNT',
    });
    expect(validateRecordPatch('reservations', { amount: 5_000_000_000_000 })).toEqual({
      ok: false,
      error: 'INVALID_AMOUNT',
    });
  });
});
