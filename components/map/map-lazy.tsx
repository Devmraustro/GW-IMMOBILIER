'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * Leaflet touches `window` on import, so the map is always loaded on the client
 * only. The placeholder keeps the layout stable (no CLS, no black screen).
 */
export const PropertyMapLazy = dynamic(
  () => import('./property-map').then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
  },
);

function MapLoadingPlaceholder() {
  return (
    <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-3 bg-[#eae8e3] text-ink-500">
      <Loader2 className="size-6 animate-spin text-gold-600" aria-hidden />
      <span className="text-sm">Carte…</span>
    </div>
  );
}

export function MapLoadingFallback() {
  const { t } = useI18n();
  return (
    <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-[#eae8e3] text-sm text-ink-500">
      {t.mapPage.loadingMap}
    </div>
  );
}

export default PropertyMapLazy;
