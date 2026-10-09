/**
 * Runtime, deployment-time configuration.
 *
 * Nothing secret belongs here: every one of these values is exposed to the
 * browser (NEXT_PUBLIC_*). Never put API keys, database URLs or tokens in this
 * file — the real backend should keep those server-side.
 */

/** Replace with the agency's real WhatsApp business line (digits only, no +). */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '213600000000';

/** Telephone shown in the header / footer. */
export const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '+213 00 00 00 00';

/** Public e-mail address. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contact@gw-immobilier.example';

/**
 * True while the contact details are still the placeholder values shipped with
 * the prototype. The UI surfaces a visible "démonstration" badge when this is
 * the case so nobody mistakes the prototype for a live business line.
 */
export const IS_PLACEHOLDER_CONTACT =
  WHATSAPP_NUMBER === '213600000000' || PHONE_NUMBER === '+213 00 00 00 00';

/** OpenStreetMap tile endpoint (public, no key required). */
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const DEFAULT_MAP_CENTER = { lat: 36.7372, lng: 3.0 } as const;
export const DEFAULT_MAP_ZOOM = 12;

/** Local storage keys used by the demonstration persistence layer. */
export const STORAGE_KEYS = {
  locale: 'gwi.locale',
  favorites: 'gwi.favorites',
  properties: 'gwi.properties',
  vehicles: 'gwi.vehicles',
  inquiries: 'gwi.inquiries',
  reservations: 'gwi.reservations',
} as const;
