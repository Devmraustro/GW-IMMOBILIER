import type { Metadata } from 'next';
import { CarCatalog } from '@/components/cars/car-catalog';
import { CatalogHeader } from '@/components/shared/catalog-header';

export const metadata: Metadata = {
  title: 'Location de véhicules — citadines, berlines, SUV et prestige',
  description:
    'Louez une citadine, une berline, un SUV ou un véhicule de prestige à la journée dans la wilaya d’Alger. Retrait sur nos communes couvertes ou livraison à l’aéroport.',
  alternates: { canonical: '/cars' },
};

export default function CarsPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <CatalogHeader section="cars" />

      <CarCatalog />
    </div>
  );
}
