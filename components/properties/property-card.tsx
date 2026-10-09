'use client';

import Link from 'next/link';
import { Bath, BedDouble, Heart, Maximize2, Ruler, Sofa } from 'lucide-react';
import type { Property } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { toast } from 'sonner';
import { formatCurrency, formatSurface } from '@/lib/format';
import { getArea } from '@/data/areas';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import SmartImage from '@/components/shared/smart-image';

const STATUS_VARIANT = {
  available: 'success',
  reserved: 'warning',
  unavailable: 'danger',
} as const;

export function PropertyCard({
  property,
  variant = 'grid',
  priority = false,
}: {
  property: Property;
  variant?: 'grid' | 'list';
  priority?: boolean;
}) {
  const { t, pick, locale } = useI18n();
  const { isFavorite, toggleFavorite } = useDemoStore();
  const area = getArea(property.area);
  const favorite = isFavorite(property.id);

  const unitLabel =
    property.priceUnit === 'day'
      ? t.common.perDay
      : property.priceUnit === 'month'
        ? t.common.perMonth
        : property.priceUnit === 'year'
          ? t.common.perYear
          : '';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover',
        variant === 'list' && 'sm:flex-row',
      )}
    >
      {/* Media */}
      <div
        className={cn(
          'relative overflow-hidden bg-ink-100',
          variant === 'list' ? 'sm:w-[320px] sm:shrink-0' : 'aspect-[4/3]',
        )}
      >
        <Link
          href={`/properties/${property.slug}`}
          className="absolute inset-0 block"
          aria-label={pick(property.title)}
          tabIndex={-1}
        >
          <SmartImage
            src={property.images[0] ?? ''}
            alt={pick(property.title)}
            fill
            priority={priority}
            seed={property.id.length}
            className="transition-transform duration-700 ease-premium group-hover:scale-[1.06]"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="pointer-events-auto flex flex-wrap gap-1.5">
            <Badge variant="ink">{property.type}</Badge>
            {property.category !== 'rent' ? (
              <Badge variant="gold">{t.categories[property.category]}</Badge>
            ) : null}
            {property.featured ? <Badge variant="gold">{t.common.featured}</Badge> : null}
          </div>
          <button
            type="button"
            onClick={() => {
              const added = toggleFavorite(property.id);
              toast.success(added ? t.properties.favouriteAdded : t.properties.favouriteRemoved);
            }}
            aria-pressed={favorite}
            title={favorite ? t.properties.favouriteRemoved : t.properties.favourite}
            className={cn(
              'pointer-events-auto relative z-10 flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-all',
              favorite
                ? 'bg-gold-400 text-ink-900'
                : 'bg-white/90 text-ink-600 hover:bg-white hover:text-danger',
            )}
          >
            <Heart className={cn('size-[17px]', favorite && 'fill-current')} aria-hidden />
            <span className="sr-only">{t.properties.favourite}</span>
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <Badge variant={STATUS_VARIANT[property.availability.status]} className="shadow-sm">
            {t.properties.availabilityStatus[property.availability.status]}
          </Badge>
          {property.isDemo ? (
            <Badge variant="outline" className="border-white/70 text-[10px]">
              {t.common.demo}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
              {area ? pick(area.name) : property.area}
            </p>
            <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold leading-snug">
              <Link
                href={`/properties/${property.slug}`}
                className="transition-colors after:absolute after:inset-0 after:content-[''] hover:text-gold-600"
              >
                {pick(property.title)}
              </Link>
            </h3>
          </div>
          <p className="shrink-0 whitespace-nowrap text-end font-display text-lg font-semibold text-ink-900">
            {formatCurrency(property.price)}
            <span className="text-xs font-medium text-ink-500">{unitLabel}</span>
          </p>
        </div>

        <p className="mt-2 text-xs text-ink-400">
          {t.common.reference} {property.reference}
        </p>

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-600">
          <li className="inline-flex items-center gap-1.5">
            <Ruler className="size-3.5 text-gold-600" aria-hidden />
            {formatSurface(property.surface)}
          </li>
          {property.bedrooms > 0 ? (
            <li className="inline-flex items-center gap-1.5">
              <BedDouble className="size-3.5 text-gold-600" aria-hidden />
              {property.bedrooms} {t.common.bedrooms.toLowerCase()}
            </li>
          ) : null}
          {property.bathrooms > 0 ? (
            <li className="inline-flex items-center gap-1.5">
              <Bath className="size-3.5 text-gold-600" aria-hidden />
              {property.bathrooms}
            </li>
          ) : null}
          <li className="inline-flex items-center gap-1.5">
            <Sofa className="size-3.5 text-gold-600" aria-hidden />
            {property.furnished ? t.common.furnished : t.common.unfurnished}
          </li>
        </ul>

        {variant === 'list' ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">
            {pick(property.description)}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
            <Maximize2 className="size-3.5" aria-hidden />
            {t.properties.precision[property.coordinatePrecision]}
          </span>
          <span className="text-xs font-semibold text-gold-600 transition-transform duration-300 group-hover:translate-x-1 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            {t.common.viewDetails} →
          </span>
        </div>
      </div>
      <span className="sr-only">{locale === 'ar' ? 'معلومات العقار' : 'Détails du bien'}</span>
    </article>
  );
}

export default PropertyCard;
