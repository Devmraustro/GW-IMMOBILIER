'use client';

import { useI18n } from '@/lib/i18n';

/**
 * Page heading for the property and vehicle catalogues.
 *
 * It lives in a client component (rather than in the server page) so the
 * heading follows the active language; the server-rendered `<title>` stays in
 * French because every route is statically prerendered.
 */
export function CatalogHeader({ section }: { section: 'properties' | 'cars' }) {
  const { t } = useI18n();
  const copy = section === 'properties' ? t.properties : t.cars;

  return (
    <header className="mb-10 max-w-2xl">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{copy.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-500">{copy.subtitle}</p>
    </header>
  );
}

export default CatalogHeader;
