import { describe, expect, it } from 'vitest';
import { properties } from '@/data/properties';
import { vehicles } from '@/data/vehicles';
import { inquiries } from '@/data/inquiries';
import { reservations } from '@/data/reservations';
import { services } from '@/data/services';
import { AREAS } from '@/data/areas';
import { findConflicts } from '@/lib/availability';
import { isValidGeoPoint } from '@/lib/geo';

const AREA_IDS = AREAS.map((area) => area.id);

describe('demonstration dataset integrity', () => {
  it('has unique property ids, slugs and references', () => {
    expect(new Set(properties.map((item) => item.id)).size).toBe(properties.length);
    expect(new Set(properties.map((item) => item.slug)).size).toBe(properties.length);
    expect(new Set(properties.map((item) => item.reference)).size).toBe(properties.length);
  });

  it('uses URL-safe slugs', () => {
    properties.forEach((property) => {
      expect(property.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('places every listing in a known service area with valid coordinates', () => {
    properties.forEach((property) => {
      expect(AREA_IDS).toContain(property.area);
      expect(isValidGeoPoint(property.coordinates)).toBe(true);
      // Algiers / Tipaza bounding box
      expect(property.coordinates.lat).toBeGreaterThan(36.5);
      expect(property.coordinates.lat).toBeLessThan(36.9);
      expect(property.coordinates.lng).toBeGreaterThan(2.5);
      expect(property.coordinates.lng).toBeLessThan(3.4);
    });
  });

  it('marks every seeded listing as demonstration data', () => {
    expect(properties.every((item) => item.isDemo)).toBe(true);
    expect(vehicles.every((item) => item.isDemo)).toBe(true);
  });

  it('never claims an exact address without an exact coordinate precision', () => {
    properties.forEach((property) => {
      expect(['exact', 'approximate', 'area']).toContain(property.coordinatePrecision);
    });
  });

  it('has consistent prices', () => {
    properties.forEach((property) => {
      expect(property.price).toBeGreaterThan(0);
      expect(property.currency).toBe('DZD');
      if (property.category === 'sale') expect(property.priceUnit).toBe('total');
    });
  });

  it('has at least one image and a bilingual title for every listing', () => {
    properties.forEach((property) => {
      expect(property.images.length).toBeGreaterThan(0);
      expect(property.title.fr.length).toBeGreaterThan(3);
      expect(property.title.ar.length).toBeGreaterThan(3);
      expect(property.description.fr.length).toBeGreaterThan(20);
      expect(property.description.ar.length).toBeGreaterThan(20);
    });
  });

  it('covers every service area', () => {
    const covered = new Set(properties.map((item) => item.area));
    AREA_IDS.forEach((id) => expect(covered.has(id)).toBe(true));
  });

  it('has unique vehicle ids, slugs and references', () => {
    expect(new Set(vehicles.map((item) => item.id)).size).toBe(vehicles.length);
    expect(new Set(vehicles.map((item) => item.slug)).size).toBe(vehicles.length);
    expect(new Set(vehicles.map((item) => item.reference)).size).toBe(vehicles.length);
  });

  it('links reservations to an existing listing or vehicle', () => {
    const propertyIds = new Set(properties.map((item) => item.id));
    const vehicleIds = new Set(vehicles.map((item) => item.id));
    reservations.forEach((reservation) => {
      const target = reservation.kind === 'property' ? propertyIds : vehicleIds;
      expect(target.has(reservation.itemId)).toBe(true);
      expect(reservation.endDate > reservation.startDate).toBe(true);
      expect(reservation.deposit).toBeLessThanOrEqual(reservation.amount + 200_000);
    });
  });

  it('ships no overlapping reservations for the same item', () => {
    reservations.forEach((reservation) => {
      const conflicts = findConflicts(
        reservations,
        reservation.itemId,
        reservation.startDate,
        reservation.endDate,
        reservation.id,
      );
      expect(conflicts, `${reservation.itemReference} ${reservation.startDate}`).toHaveLength(0);
    });
  });

  it('links inquiries to existing items when a target is set', () => {
    const propertyIds = new Set(properties.map((item) => item.id));
    const vehicleIds = new Set(vehicles.map((item) => item.id));
    inquiries.forEach((inquiry) => {
      if (inquiry.propertyId) expect(propertyIds.has(inquiry.propertyId)).toBe(true);
      if (inquiry.vehicleId) expect(vehicleIds.has(inquiry.vehicleId)).toBe(true);
    });
  });

  it('exposes six services with a valid internal destination', () => {
    expect(services).toHaveLength(6);
    services.forEach((service) => {
      expect(service.href.startsWith('/')).toBe(true);
      expect(service.title.fr.length).toBeGreaterThan(3);
      expect(service.title.ar.length).toBeGreaterThan(3);
    });
  });

  it('declares areas with geocoded centres', () => {
    AREAS.forEach((area) => {
      expect(isValidGeoPoint(area.center)).toBe(true);
      expect(area.name.fr.length).toBeGreaterThan(2);
      expect(area.name.ar.length).toBeGreaterThan(2);
    });
  });
});
