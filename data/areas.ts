import type { Area } from '@/types';

/**
 * Service areas of GW Immobilier.
 *
 * Coordinates are geocoded town / commune centres (WGS84) and are used to frame
 * the map and to place demonstration markers. They are NOT the addresses of real
 * listed properties — see `coordinatePrecision` on each listing.
 *
 * To use verified property coordinates later, edit `data/properties.ts` and set
 * `coordinatePrecision: 'exact'` with the surveyed lat/lng.
 */
export const AREAS: Area[] = [
  {
    id: 'bab-ezzouar',
    slug: 'bab-ezzouar',
    name: { fr: 'Bab Ezzouar', ar: 'باب الزوار' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7189, lng: 3.1845 },
    zoom: 14,
  },
  {
    id: 'cheraga',
    slug: 'cheraga',
    name: { fr: 'Chéraga', ar: 'الشراقة' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7514, lng: 2.9436 },
    zoom: 14,
  },
  {
    id: 'draria',
    slug: 'draria',
    name: { fr: 'Draria', ar: 'درارية' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7369, lng: 2.9836 },
    zoom: 14,
  },
  {
    id: 'dely-ibrahim',
    slug: 'dely-ibrahim',
    name: { fr: 'Dely Ibrahim', ar: 'دالي إبراهيم' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7519, lng: 3.0061 },
    zoom: 14,
  },
  {
    id: 'el-achour',
    slug: 'el-achour',
    name: { fr: 'El Achour', ar: 'العاشور' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7447, lng: 2.9636 },
    zoom: 14,
  },
  {
    id: 'douaouda-marine',
    slug: 'douaouda-marine',
    name: { fr: 'Douaouda Marine', ar: 'دوودة مارين' },
    // Administratively in Tipaza; included because GW Immobilier covers it.
    wilaya: { fr: 'Wilaya de Tipaza', ar: 'ولاية تيبازة' },
    center: { lat: 36.7, lng: 2.8 },
    zoom: 14,
  },
  {
    id: 'bordj-el-kiffan',
    slug: 'bordj-el-kiffan',
    name: { fr: 'Bordj El Kiffan', ar: 'برج الكيفان' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7453, lng: 3.1936 },
    zoom: 14,
  },
  {
    id: 'ouled-fayet',
    slug: 'ouled-fayet',
    name: { fr: 'Ouled Fayet', ar: 'أولاد فايت' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7444, lng: 2.9169 },
    zoom: 14,
  },
  {
    id: 'dar-el-beida',
    slug: 'dar-el-beida',
    name: { fr: 'Dar El Beida', ar: 'دار البيضاء' },
    wilaya: { fr: 'Wilaya d’Alger', ar: 'ولاية الجزائر' },
    center: { lat: 36.7147, lng: 3.2169 },
    zoom: 14,
  },
];

/** Bounding box of every service area — used to fit the map on first render. */
export const AREA_BOUNDS: { north: number; south: number; east: number; west: number } = {
  north: 36.77,
  south: 36.68,
  east: 3.26,
  west: 2.76,
};

/** Centre of the Wilaya of Algiers. */
export const ALGIERS_CENTER = { lat: 36.7538, lng: 3.0588 };

export const AREA_IDS = AREAS.map((a) => a.id);

export function getArea(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}

export function getAreaName(id: string, locale: 'fr' | 'ar' = 'fr'): string {
  return getArea(id)?.name[locale] ?? id;
}
