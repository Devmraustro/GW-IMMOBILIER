/**
 * Image helpers.
 *
 * Photography is served from Unsplash's public CDN and loaded straight by the
 * browser — no account, key or paid plan required. `imageFallback()` returns a
 * locally stored SVG artwork file so a card never renders broken, even offline.
 */

const UNSPLASH = 'https://images.unsplash.com/photo-';

export function unsplash(photoId: string, width = 1200): string {
  return `${UNSPLASH}${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Local, always-available artwork used when remote photography fails. */
export function imageFallback(kind: 'property' | 'vehicle' | 'hero' = 'property', seed = 0): string {
  const index = (Math.abs(seed) % 4) + 1;
  return kind === 'vehicle'
    ? `/images/fallback/vehicle-${index}.svg`
    : kind === 'hero'
      ? '/images/fallback/hero.svg'
      : `/images/fallback/property-${index}.svg`;
}
