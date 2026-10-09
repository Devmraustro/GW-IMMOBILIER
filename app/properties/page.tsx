import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PropertyCatalog } from '@/components/properties/property-catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { PropertyCardSkeleton } from '@/components/properties/property-card-skeleton';
import { CatalogHeader } from '@/components/shared/catalog-header';

export const metadata: Metadata = {
  title: 'Nos biens — location, vente et meublés à Alger',
  description:
    'Parcourez les appartements F2, F3, studios, villas et bureaux disponibles dans la wilaya d’Alger. Filtrez par commune, type, durée et budget.',
  alternates: { canonical: '/properties' },
};

export default function PropertiesPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <CatalogHeader section="properties" />

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
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
