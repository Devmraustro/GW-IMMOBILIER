import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PropertyCatalog } from '@/components/properties/property-catalog';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Nos biens — location, vente et meublés à Alger',
  description:
    'Parcourez les appartements F2, F3, studios, villas et bureaux disponibles dans la wilaya d’Alger. Filtrez par commune, type, durée et budget.',
  alternates: { canonical: '/properties' },
};

export default function PropertiesPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow">Catalogue</p>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
          Trouvez le bien qui vous correspond
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">
          Appartements, studios, villas et bureaux dans les neuf communes couvertes par GW
          Immobilier. Utilisez les filtres pour affiner, puis consultez la fiche complète de chaque
          bien.
        </p>
      </header>

      <Suspense fallback={<CatalogFallback />}>
        <PropertyCatalog />
      </Suspense>
    </div>
  );
}

function CatalogFallback() {
  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <div className="hidden space-y-4 lg:block">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[380px] w-full" />
        ))}
      </div>
    </div>
  );
}
