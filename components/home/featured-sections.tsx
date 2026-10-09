'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/components/shared/section-heading';
import Reveal from '@/components/shared/reveal';
import PropertyCard from '@/components/properties/property-card';
import CarCard from '@/components/cars/car-card';

export function FeaturedProperties() {
  const { t, locale } = useI18n();
  const { properties } = useDemoStore();
  const featured = properties.filter((p) => p.featured).slice(0, 6);

  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow={t.nav.properties}
        title={t.home.featuredProperties}
        text={t.home.featuredPropertiesText}
        action={
          <Button asChild variant="outline">
            <Link href="/properties">
              {t.common.seeAll}
              <ArrowLeft className={cn('size-4', locale === 'ar' ? '' : 'rotate-180')} aria-hidden />
            </Link>
          </Button>
        }
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {featured.map((property, index) => (
          <Reveal key={property.id} delay={index * 70}>
            <PropertyCard property={property} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FeaturedCars() {
  const { t, locale } = useI18n();
  const { vehicles } = useDemoStore();
  const featured = vehicles.filter((v) => v.featured).slice(0, 4);

  return (
    <section className="border-y border-ink-100 bg-sand-50 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow={t.nav.cars}
          title={t.home.featuredCars}
          text={t.home.featuredCarsText}
          action={
            <Button asChild variant="outline">
              <Link href="/cars">
                {t.common.seeAll}
                <ArrowLeft className={cn('size-4', locale === 'ar' ? '' : 'rotate-180')} aria-hidden />
              </Link>
            </Button>
          }
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((vehicle, index) => (
            <Reveal key={vehicle.id} delay={index * 70}>
              <CarCard vehicle={vehicle} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProperties;
