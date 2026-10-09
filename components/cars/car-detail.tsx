'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Fuel,
  Gauge,
  CarFront as CarFrontIcon,
  MapPin,
  MessageCircle,
  Users,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { buildVehicleMessage, whatsappUrl } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/format';
import { getArea } from '@/data/areas';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DemoBadge from '@/components/shared/demo-badge';
import EmptyState from '@/components/shared/empty-state';
import SectionHeading from '@/components/shared/section-heading';
import DirectionsDialog from '@/components/shared/directions-dialog';
import InquiryForm from '@/components/shared/inquiry-form';
import { PropertyGallery } from '@/components/properties/property-gallery';
import CarCard from './car-card';
import { PropertyMapLazy } from '@/components/map/map-lazy';

const CATEGORY_KEYS = {
  economique: 'categoryEconomique',
  berline: 'categoryBerline',
  suv: 'categorySuv',
  luxe: 'categoryLuxe',
  utilitaire: 'categoryUtilitaire',
} as const;

const TRANSMISSION_KEYS = {
  manuelle: 'transmissionManuelle',
  automatique: 'transmissionAutomatique',
} as const;

const FUEL_KEYS = {
  essence: 'fuelEssence',
  diesel: 'fuelDiesel',
  hybride: 'fuelHybride',
  electrique: 'fuelElectrique',
} as const;

export function CarDetail({ slug }: { slug: string }) {
  const { t, pick, locale } = useI18n();
  const { vehicles, hydrated } = useDemoStore();
  const vehicle = useMemo(() => vehicles.find((v) => v.slug === slug), [vehicles, slug]);
  const [missing, setMissing] = useState(false);
  const mapRef = useRef<null | import('leaflet').Map>(null);

  useEffect(() => {
    if (hydrated && !vehicle) setMissing(true);
  }, [hydrated, vehicle]);

  if (missing) {
    return (
      <div className="container-page py-24">
        <EmptyState
          icon={<CarFrontIcon className="size-6" aria-hidden />}
          title={t.errors.missingVehicle}
          text={t.common.notFoundText}
          action={
            <Button asChild>
              <Link href="/cars">{t.errors.backToCatalog}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container-page py-24">
        <div className="skeleton h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const area = getArea(vehicle.pickup.area);
  const message = buildVehicleMessage(vehicle, { locale, t });

  const specs = [
    { icon: Users, label: t.cars.seats, value: String(vehicle.seats) },
    { icon: Gauge, label: t.cars.transmission, value: t.cars[TRANSMISSION_KEYS[vehicle.transmission]] },
    { icon: Fuel, label: t.cars.fuel, value: t.cars[FUEL_KEYS[vehicle.fuel]] },
    { icon: CalendarDays, label: t.cars.year, value: String(vehicle.year) },
  ];

  const related = vehicles
    .filter((item) => item.id !== vehicle.id && item.category === vehicle.category)
    .slice(0, 3);

  return (
    <article className="pb-8">
      <div className="container-page pt-8">
        <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-xs text-ink-400">
          <Link href="/" className="hover:text-ink-900">
            {t.nav.home}
          </Link>
          <span aria-hidden>/</span>
          <Link href="/cars" className="hover:text-ink-900">
            {t.nav.cars}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-ink-600">
            {vehicle.brand} {vehicle.model}
          </span>
        </nav>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ink">{t.cars[CATEGORY_KEYS[vehicle.category]]}</Badge>
              <Badge variant={vehicle.available ? 'success' : 'danger'}>
                {vehicle.available ? t.cars.available : t.cars.unavailable}
              </Badge>
              {vehicle.isDemo ? <DemoBadge /> : null}
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              {vehicle.year} · {t.common.reference} {vehicle.reference}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="font-display text-3xl font-semibold">
              {formatCurrency(vehicle.dailyPrice)}
              <span className="text-base font-medium text-ink-500">{t.common.perDay}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="whatsapp" size="sm">
                <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden />
                  {t.common.whatsapp}
                </a>
              </Button>
              <DirectionsDialog
                destination={vehicle.pickup.coordinates}
                destinationLabel={pick(vehicle.pickup.address)}
                variant="outline"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-page mt-8">
        <PropertyGallery
          images={vehicle.images}
          title={`${vehicle.brand} ${vehicle.model}`}
          seed={vehicle.year}
          kind="vehicle"
        />
      </div>

      <div className="container-page mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="space-y-12">
          <section>
            <h2 className="font-display text-xl font-semibold">{t.cars.specifications}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-400">
                    <spec.icon className="size-3.5 text-gold-600" aria-hidden />
                    {spec.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-ink-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">{t.properties.description}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <p className="text-[15px] leading-relaxed text-ink-600">{pick(vehicle.description)}</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">{t.cars.features}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vehicle.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <span className="flex size-5 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {t.amenities[feature as keyof typeof t.amenities] ?? feature}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">{t.cars.conditions}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <ul className="space-y-3">
              {vehicle.conditions.map((condition) => (
                <li key={condition.fr} className="flex items-start gap-3 text-sm text-ink-600">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                  {pick(condition)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold">{t.cars.pickup}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <div className="overflow-hidden rounded-2xl border border-ink-100">
              <div className="h-[300px] w-full">
                <PropertyMapLazy
                  items={[]}
                  center={vehicle.pickup.coordinates}
                  zoom={14}
                  mapRef={mapRef as never}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-start gap-2 text-xs text-ink-500">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden />
                {pick(vehicle.pickup.address)}
                {area ? ` · ${pick(area.name)}` : ''}
              </p>
              <DirectionsDialog
                destination={vehicle.pickup.coordinates}
                destinationLabel={pick(vehicle.pickup.address)}
                variant="outline"
                size="sm"
              />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <p className="font-display text-2xl font-semibold">
              {formatCurrency(vehicle.dailyPrice)}
              <span className="text-sm font-medium text-ink-500">{t.common.perDay}</span>
            </p>
            <p className="mt-1 text-xs text-ink-400">
              {t.common.reference} {vehicle.reference}
            </p>
            <Separator className="my-5" />
            <InquiryForm vehicle={vehicle} requireDates />
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="container-page mt-20 border-t border-ink-100 pt-14">
          <SectionHeading
            eyebrow={t.nav.cars}
            title={t.properties.related}
            action={
              <Button asChild variant="outline">
                <Link href="/cars">
                  {t.common.seeAll}
                  <ArrowLeft className={cn('size-4', locale === 'ar' ? '' : 'rotate-180')} aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <CarCard key={item.id} vehicle={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default CarDetail;
