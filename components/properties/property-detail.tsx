'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Check,
  Copy,
  Heart,
  Home,
  KeyRound,
  Layers,
  MapPin,
  MessageCircle,
  Ruler,
  Share2,
  Sofa,
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { propertyTypeLabel } from '@/lib/labels';
import { useDemoStore } from '@/lib/demo-store';
import { buildPropertyMessage, whatsappUrl } from '@/lib/whatsapp';
import { formatCurrency, formatDate, formatSurface } from '@/lib/format';
import { getArea } from '@/data/areas';
import { copyToClipboard, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DemoBadge from '@/components/shared/demo-badge';
import EmptyState from '@/components/shared/empty-state';
import SectionHeading from '@/components/shared/section-heading';
import DirectionsDialog from '@/components/shared/directions-dialog';
import InquiryForm from '@/components/shared/inquiry-form';
import { PropertyGallery } from './property-gallery';
import PropertyCard from './property-card';
import { PropertyMapLazy } from '@/components/map/map-lazy';

const STATUS_VARIANT = {
  available: 'success',
  reserved: 'warning',
  unavailable: 'danger',
} as const;

export function PropertyDetail({ slug }: { slug: string }) {
  const { t, pick, locale } = useI18n();
  const { properties, hydrated, isFavorite, toggleFavorite } = useDemoStore();
  const property = useMemo(() => properties.find((p) => p.slug === slug), [properties, slug]);
  const [shareError, setShareError] = useState(false);
  const [missing, setMissing] = useState(false);
  const mapRef = useRef<null | import('leaflet').Map>(null);

  useEffect(() => {
    if (hydrated && !property) setMissing(true);
  }, [hydrated, property]);

  if (missing) {
    return (
      <div className="container-page py-24">
        <EmptyState
          icon={<Building2 className="size-6" aria-hidden />}
          title={t.errors.missingProperty}
          text={t.common.notFoundText}
          action={
            <Button asChild>
              <Link href="/properties">{t.errors.backToCatalog}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container-page py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const area = getArea(property.area);
  const favorite = isFavorite(property.id);
  const message = buildPropertyMessage(property, { locale, t });

  const unitLabel =
    property.priceUnit === 'day'
      ? t.common.perDay
      : property.priceUnit === 'month'
        ? t.common.perMonth
        : property.priceUnit === 'year'
          ? t.common.perYear
          : '';

  const specs = [
    { icon: Ruler, label: t.common.surface, value: formatSurface(property.surface) },
    property.bedrooms > 0
      ? { icon: BedDouble, label: t.common.bedrooms, value: String(property.bedrooms) }
      : null,
    property.bathrooms > 0
      ? { icon: Bath, label: t.common.bathrooms, value: String(property.bathrooms) }
      : null,
    property.floor !== undefined && property.floor > 0
      ? { icon: Layers, label: t.common.floor, value: String(property.floor) }
      : null,
    {
      icon: Sofa,
      label: t.properties.furnishedFilter,
      value: property.furnished ? t.common.furnished : t.common.unfurnished,
    },
    { icon: Building2, label: t.common.type, value: propertyTypeLabel(property.type, t) },
    {
      icon: KeyRound,
      label: t.common.category,
      value: t.categories[property.category],
    },
  ].filter(Boolean) as { icon: typeof Ruler; label: string; value: string }[];

  const related = properties
    .filter(
      (item) =>
        item.id !== property.id && (item.area === property.area || item.type === property.type),
    )
    .slice(0, 3);

  const share = async () => {
    const url = window.location.href;
    const ok = await copyToClipboard(url);
    if (ok) {
      toast.success(t.properties.copied);
    } else {
      setShareError(true);
      toast.error(t.errors.generic);
    }
  };

  return (
    <article className="pb-8">
      {/* Breadcrumb + title */}
      <div className="container-page pt-8">
        <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-xs text-ink-400">
          <Link href="/" className="hover:text-ink-900">
            {t.nav.home}
          </Link>
          <span aria-hidden>/</span>
          <Link href="/properties" className="hover:text-ink-900">
            {t.nav.properties}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-ink-600">{pick(property.title)}</span>
        </nav>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ink">{propertyTypeLabel(property.type, t)}</Badge>
              <Badge variant={STATUS_VARIANT[property.availability.status]}>
                {t.properties.availabilityStatus[property.availability.status]}
              </Badge>
              {property.category !== 'rent' ? (
                <Badge variant="gold">{t.categories[property.category]}</Badge>
              ) : null}
              {property.isDemo ? <DemoBadge /> : null}
            </div>

            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {pick(property.title)}
            </h1>

            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-gold-600" aria-hidden />
                {area ? pick(area.name) : property.area} · {pick(area?.wilaya ?? { fr: '', ar: '' })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Home className="size-4 text-gold-600" aria-hidden />
                {pick(property.address)}
              </span>
              <span className="font-mono text-xs">{property.reference}</span>
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="font-display text-3xl font-semibold text-ink-900">
              {formatCurrency(property.price)}
              <span className="text-base font-medium text-ink-500">{unitLabel}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant="whatsapp"
                size="sm"
              >
                <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden />
                  {t.common.whatsapp}
                </a>
              </Button>
              <DirectionsDialog
                destination={property.coordinates}
                destinationLabel={`${pick(property.title)} — ${area ? pick(area.name) : ''}`}
                variant="outline"
                size="sm"
              />
              <Button variant="outline" size="sm" onClick={share}>
                {shareError ? <Copy aria-hidden /> : <Share2 aria-hidden />}
                {t.properties.share}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const added = toggleFavorite(property.id);
                  toast.success(added ? t.properties.favouriteAdded : t.properties.favouriteRemoved);
                }}
                aria-pressed={favorite}
              >
                <Heart className={cn('size-4', favorite && 'fill-current text-danger')} aria-hidden />
                {t.properties.favourites}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container-page mt-8">
        <PropertyGallery
          images={property.images}
          title={pick(property.title)}
          seed={property.surface}
        />
      </div>

      {/* Body */}
      <div className="container-page mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="space-y-12">
          {/* Specs */}
          <section>
            <h2 className="font-display text-xl font-semibold">{t.properties.specifications}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-start gap-3">
                  <spec.icon className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink-400">{spec.label}</dt>
                    <dd className="text-sm font-semibold text-ink-900">{spec.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Description */}
          <section>
            <h2 className="font-display text-xl font-semibold">{t.properties.description}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-600">
              {pick(property.description)}
            </p>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="font-display text-xl font-semibold">{t.properties.amenities}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {property.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <span className="flex size-5 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {t.amenities[amenity as keyof typeof t.amenities] ?? amenity}
                </li>
              ))}
            </ul>
          </section>

          {/* Availability */}
          <section>
            <h2 className="font-display text-xl font-semibold">{t.properties.availability}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <div className="rounded-2xl border border-ink-100 bg-sand-50 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={STATUS_VARIANT[property.availability.status]}>
                  {t.properties.availabilityStatus[property.availability.status]}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-sm text-ink-600">
                  <CalendarClock className="size-4 text-gold-600" aria-hidden />
                  {t.properties.availableFrom} : {formatDate(property.availability.availableFrom, locale)}
                  {property.availability.availableTo
                    ? ` → ${formatDate(property.availability.availableTo, locale)}`
                    : ''}
                </span>
              </div>
              {property.availability.note ? (
                <p className="mt-3 text-sm text-ink-500">{pick(property.availability.note)}</p>
              ) : null}
            </div>
          </section>

          {/* Conditions */}
          <section>
            <h2 className="font-display text-xl font-semibold">{t.properties.conditions}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <ul className="space-y-3">
              {property.conditions.map((condition) => (
                <li key={condition.fr} className="flex items-start gap-3 text-sm text-ink-600">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                  {pick(condition)}
                </li>
              ))}
            </ul>
          </section>

          {/* Map */}
          <section>
            <h2 className="font-display text-xl font-semibold">{t.properties.mapSection}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <div className="overflow-hidden rounded-2xl border border-ink-100">
              <div className="h-[320px] w-full">
                <PropertyMapLazy
                  items={[property]}
                  center={property.coordinates}
                  zoom={14}
                  mapRef={mapRef as never}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
                <span>
                  {t.properties.mapNote}{' '}
                  <span className="font-semibold text-warning">
                    {t.properties.precision[property.coordinatePrecision]}
                  </span>
                </span>
              </p>
              <DirectionsDialog
                destination={property.coordinates}
                destinationLabel={pick(property.title)}
                variant="outline"
                size="sm"
              />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <p className="font-display text-2xl font-semibold">
              {formatCurrency(property.price)}
              <span className="text-sm font-medium text-ink-500">{unitLabel}</span>
            </p>
            <p className="mt-1 text-xs text-ink-400">
              {t.common.reference} {property.reference}
            </p>
            <Separator className="my-5" />
            <InquiryForm property={property} />
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 ? (
        <section className="container-page mt-20 border-t border-ink-100 pt-14">
          <SectionHeading
            eyebrow={t.nav.properties}
            title={t.properties.related}
            action={
              <Button asChild variant="outline">
                <Link href="/properties">
                  {t.common.seeAll}
                  <ArrowLeft className={cn('size-4', locale === 'ar' ? '' : 'rotate-180')} aria-hidden />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default PropertyDetail;
