import type { GeoPoint } from '@/types';

/** Great-circle distance in kilometres. */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Google Maps **directions** link. We deliberately do not build a routing
 * engine: Google computes the route, the travel time and the live navigation.
 *
 * @param destination lat/lng of the listing (or a free-text query)
 * @param origin      'lat,lng' or a free-text address, or `null` to let the
 *                    user's own Maps app decide the starting point.
 */
export function googleDirectionsUrl(destination: string, origin?: string | null): string {
  const base = 'https://www.google.com/maps/dir/?api=1';
  const params = new URLSearchParams();
  params.set('destination', destination);
  if (origin && origin.trim().length > 0) params.set('origin', origin);
  params.set('travelmode', 'driving');
  return `${base}&${params.toString()}`;
}

/** Google Maps place / search link (used for approximate area markers). */
export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** OpenStreetMap alternative — useful fallback, no key required. */
export function osmDirectionsUrl(
  destination: GeoPoint,
  origin?: GeoPoint | null,
): string {
  const params = new URLSearchParams();
  if (origin) params.set('route', `${origin.lat},${origin.lng};${destination.lat},${destination.lng}`);
  return `https://www.openstreetmap.org/${params.toString() ? `?${params.toString()}` : ''}${
    params.toString() ? '#' : '#'
  }map=16/${destination.lat}/${destination.lng}`;
}

export function formatLatLng(point: GeoPoint): string {
  return `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
}

export type GeolocationError = 'denied' | 'unavailable' | 'unsupported' | 'timeout';

/**
 * Ask the browser for the device position.
 * MUST be triggered by an explicit user action — never on page load.
 */
export function requestCurrentPosition(
  timeout = 10_000,
): Promise<{ ok: true; point: GeoPoint } | { ok: false; error: GeolocationError }> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ok: false, error: 'unsupported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          ok: true,
          point: { lat: position.coords.latitude, lng: position.coords.longitude },
        }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) resolve({ ok: false, error: 'denied' });
        else if (error.code === error.TIMEOUT) resolve({ ok: false, error: 'timeout' });
        else resolve({ ok: false, error: 'unavailable' });
      },
      { enableHighAccuracy: true, timeout, maximumAge: 60_000 },
    );
  });
}

export function isValidGeoPoint(point: unknown): point is GeoPoint {
  if (!point || typeof point !== 'object') return false;
  const { lat, lng } = point as GeoPoint;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
