/** URL-safe slugs that keep Arabic characters (browsers percent-encode them). */
export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    // Ligatures that neither NFD nor NFKD decompose.
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    // Remove Latin accents but keep Arabic/Persian blocks intact.
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function generateReference(prefix: string, seed: number): string {
  const padded = String(seed).padStart(4, '0');
  return `${prefix}-${padded}`;
}

export function uniqueSlug(base: string, taken: string[]): string {
  const clean = slugify(base) || 'annonce';
  if (!taken.includes(clean)) return clean;
  let i = 2;
  while (taken.includes(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
}

export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${random}`;
}
