'use client';

import Link from 'next/link';
import { CalendarDays, Fuel, Gauge, Users } from 'lucide-react';
import type { Vehicle } from '@/types';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/format';
import { getArea } from '@/data/areas';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import SmartImage from '@/components/shared/smart-image';

export function CarCard({ vehicle, priority = false }: { vehicle: Vehicle; priority?: boolean }) {
  const { t, pick } = useI18n();
  const area = getArea(vehicle.pickup.area);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
        <Link href={`/cars/${vehicle.slug}`} tabIndex={-1} className="absolute inset-0" aria-hidden>
          <SmartImage
            src={vehicle.images[0] ?? ''}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            priority={priority}
            seed={vehicle.year}
            fallbackKind="vehicle"
            className="transition-transform duration-700 ease-premium group-hover:scale-[1.05]"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <Badge variant="ink">{t.cars[CATEGORY_KEYS[vehicle.category]]}</Badge>
          {!vehicle.available ? <Badge variant="danger">{t.cars.unavailable}</Badge> : null}
          {vehicle.featured && vehicle.available ? (
            <Badge variant="gold">{t.common.featured}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
          {vehicle.brand} · {vehicle.year}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug">
          <Link
            href={`/cars/${vehicle.slug}`}
            className="transition-colors after:absolute after:inset-0 after:content-[''] hover:text-gold-600"
          >
            {vehicle.model}
          </Link>
        </h3>

        <ul className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-ink-600">
          <li className="inline-flex items-center gap-1.5">
            <Users className="size-3.5 text-gold-600" aria-hidden />
            {vehicle.seats} {t.cars.seats.toLowerCase()}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Gauge className="size-3.5 text-gold-600" aria-hidden />
            {t.cars[TRANSMISSION_KEYS[vehicle.transmission]]}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Fuel className="size-3.5 text-gold-600" aria-hidden />
            {t.cars[FUEL_KEYS[vehicle.fuel]]}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-gold-600" aria-hidden />
            {area ? pick(area.name) : vehicle.pickup.area}
          </li>
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="font-display text-lg font-semibold text-ink-900">
            {formatCurrency(vehicle.dailyPrice)}
            <span className="text-xs font-medium text-ink-500">{t.common.perDay}</span>
          </p>
          <span
            className={cn(
              'text-xs font-semibold text-gold-600 transition-transform duration-300',
              'group-hover:translate-x-1 rtl:group-hover:-translate-x-1',
            )}
          >
            {t.common.viewDetails} →
          </span>
        </div>
      </div>
    </article>
  );
}

const CATEGORY_KEYS: Record<
  Vehicle['category'],
  'categoryEconomique' | 'categoryBerline' | 'categorySuv' | 'categoryLuxe' | 'categoryUtilitaire'
> = {
  economique: 'categoryEconomique',
  berline: 'categoryBerline',
  suv: 'categorySuv',
  luxe: 'categoryLuxe',
  utilitaire: 'categoryUtilitaire',
};

const TRANSMISSION_KEYS: Record<
  Vehicle['transmission'],
  'transmissionManuelle' | 'transmissionAutomatique'
> = {
  manuelle: 'transmissionManuelle',
  automatique: 'transmissionAutomatique',
};

const FUEL_KEYS: Record<
  Vehicle['fuel'],
  'fuelEssence' | 'fuelDiesel' | 'fuelHybride' | 'fuelElectrique'
> = {
  essence: 'fuelEssence',
  diesel: 'fuelDiesel',
  hybride: 'fuelHybride',
  electrique: 'fuelElectrique',
};

export default CarCard;
