import type { Metadata } from 'next';
import { CarCatalog } from '@/components/cars/car-catalog';

export const metadata: Metadata = {
  title: 'Location de véhicules — citadines, berlines, SUV et prestige',
  description:
    'Louez une citadine, une berline, un SUV ou un véhicule de prestige à la journée dans la wilaya d’Alger. Retrait sur nos communes couvertes ou livraison à l’aéroport.',
  alternates: { canonical: '/cars' },
};

export default function CarsPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow">Mobilité</p>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
          Location de véhicules à Alger
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">
          Citadines économiques, berlines, SUV et véhicules de prestige disponibles à la journée,
          avec retrait dans nos communes ou livraison à l’aéroport Houari Boumediene.
        </p>
      </header>

      <CarCatalog />
    </div>
  );
}
