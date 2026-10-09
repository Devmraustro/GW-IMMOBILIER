'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bath,
  BedDouble,
  Crosshair,
  Layers,
  List,
  Loader2,
  Map as MapIcon,
  MapPin,
  Navigation,
  Ruler,
  Search,
  SearchX,
  WifiOff,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AreaId, GeoPoint, PropertyType } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { AREAS } from '@/data/areas';
import { PROPERTY_TYPES } from '@/lib/filters';
import { formatCurrency, formatSurface } from '@/lib/format';
import { requestCurrentPosition } from '@/lib/geo';
import { buildPropertyMessage } from '@/lib/whatsapp';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { cn, toggleInArray } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import SmartImage from '@/components/shared/smart-image';
import EmptyState from '@/components/shared/empty-state';
import DirectionsDialog from '@/components/shared/directions-dialog';
import { PropertyMapLazy } from './map-lazy';
import type L from 'leaflet';

export function MapExplorer() {
  const { t, pick, locale } = useI18n();
  const { properties } = useDemoStore();

  const [query, setQuery] = useState('');
  const [areas, setAreas] = useState<AreaId[]>([]);
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [resizeKey, setResizeKey] = useState(0);
  const mapRef = useRef<L.Map | null>(null);

  const results = useMemo(
    () =>
      properties.filter((property) => {
        if (availableOnly && property.availability.status !== 'available') return false;
        if (areas.length && !areas.includes(property.area)) return false;
        if (types.length && !types.includes(property.type)) return false;
        if (query.trim()) {
          const haystack = `${property.title.fr} ${property.title.ar} ${property.reference} ${property.area} ${property.type}`.toLowerCase();
          if (!haystack.includes(query.trim().toLowerCase())) return false;
        }
        return true;
      }),
    [properties, areas, types, availableOnly, query],
  );

  const selected = results.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !results.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [results, selectedId]);

  // Re-measure the map when the mobile panel switches.
  useEffect(() => {
    setResizeKey((value) => value + 1);
  }, [mobileView]);

  const focusProperty = (property: (typeof results)[number]) => {
    setSelectedId(property.id);
    mapRef.current?.flyTo([property.coordinates.lat, property.coordinates.lng], 15, {
      duration: 0.8,
    });
    setMobileView('map');
  };

  const locate = async () => {
    setLocating(true);
    const result = await requestCurrentPosition();
    setLocating(false);
    if (result.ok) {
      setUserLocation(result.point);
      toast.success(t.mapPage.locationFound, { description: t.mapPage.locationFoundText });
    } else if (result.error === 'denied') {
      toast.error(t.mapPage.locationDenied, { description: t.mapPage.locationDeniedText });
    } else if (result.error === 'unsupported') {
      toast.error(t.mapPage.geolocationUnsupported);
    } else {
      toast.error(t.mapPage.locationUnavailable, { description: t.mapPage.locationUnavailableText });
    }
  };

  const resetMap = () => {
    setSelectedId(null);
    setUserLocation(null);
    mapRef.current?.flyTo([36.7372, 3.0], 12, { duration: 0.8 });
  };

  const activeFilters = areas.length + types.length + (availableOnly ? 1 : 0);

  return (
    <div className="container-page py-8">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.nav.map}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {t.mapPage.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">{t.mapPage.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={locate} disabled={locating}>
            {locating ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Crosshair aria-hidden />
            )}
            {t.mapPage.locateMe}
          </Button>
          <Button variant="outline" size="sm" onClick={resetMap}>
            <Layers aria-hidden />
            {t.mapPage.resetMap}
          </Button>
        </div>
      </header>

      {/* Filters bar */}
      <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.mapPage.searchPlaceholder}
              className="ps-9"
              aria-label={t.mapPage.searchPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-ink-400">
              {t.mapPage.filterByArea}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {AREAS.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  aria-pressed={areas.includes(area.id)}
                  onClick={() => setAreas((prev) => toggleInArray(prev, area.id))}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                    areas.includes(area.id)
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900',
                  )}
                >
                  {pick(area.name)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={types.includes(type)}
                  onClick={() => setTypes((prev) => toggleInArray(prev, type))}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                    types.includes(type)
                      ? 'border-gold-500 bg-gold-400 text-ink-900'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-sand-50 px-3 py-2.5">
              <Label htmlFor="map-available" className="cursor-pointer text-xs">
                {t.properties.availableOnly}
              </Label>
              <Switch
                id="map-available"
                checked={availableOnly}
                onCheckedChange={setAvailableOnly}
              />
            </div>
            {activeFilters > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAreas([]);
                  setTypes([]);
                  setAvailableOnly(false);
                  setQuery('');
                }}
              >
                <X aria-hidden />
                {t.common.resetFilters}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile view switch */}
      <div className="mb-4 flex gap-1 rounded-xl bg-sand-100 p-1 lg:hidden" role="group">
        <button
          type="button"
          onClick={() => setMobileView('map')}
          aria-pressed={mobileView === 'map'}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            mobileView === 'map' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500',
          )}
        >
          <MapIcon className="size-4" aria-hidden />
          {t.mapPage.mapPanel}
        </button>
        <button
          type="button"
          onClick={() => setMobileView('list')}
          aria-pressed={mobileView === 'list'}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            mobileView === 'list' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500',
          )}
        >
          <List className="size-4" aria-hidden />
          {t.mapPage.listPanel}
          <span className="rounded-full bg-gold-400 px-1.5 text-[11px] text-ink-900">
            {results.length}
          </span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* List panel */}
        <div
          className={cn(
            'order-2 lg:order-1',
            mobileView === 'list' ? 'block' : 'hidden lg:block',
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-ink-500">
              <span className="font-semibold text-ink-900">{results.length}</span>{' '}
              {t.mapPage.resultsCount.replace('{count} ', '')}
            </p>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={<SearchX className="size-6" aria-hidden />}
              title={t.mapPage.emptyTitle}
              text={t.mapPage.emptyText}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setAreas([]);
                    setTypes([]);
                    setAvailableOnly(false);
                    setQuery('');
                  }}
                >
                  {t.common.resetFilters}
                </Button>
              }
            />
          ) : (
            <ul className="max-h-[68vh] space-y-3 overflow-y-auto pe-1 lg:max-h-[70vh]">
              {results.map((property) => {
                const area = getAreaName(property.area);
                const isActive = property.id === selectedId;
                return (
                  <li key={property.id}>
                    <button
                      type="button"
                      onClick={() => focusProperty(property)}
                      aria-pressed={isActive}
                      className={cn(
                        'flex w-full gap-3 rounded-xl border bg-white p-3 text-start transition-all duration-200',
                        isActive
                          ? 'border-gold-400 shadow-card-hover ring-1 ring-gold-400/40'
                          : 'border-ink-100 hover:border-ink-300 hover:shadow-card',
                      )}
                    >
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        <SmartImage
                          src={property.images[0] ?? ''}
                          alt={pick(property.title)}
                          fill
                          seed={property.surface}
                          sizes="96px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {pick(property.title)}
                          </p>
                          <Badge variant="ink" className="shrink-0">
                            {property.type}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-ink-400">{area}</p>
                        <p className="mt-1 font-display text-sm font-semibold text-ink-900">
                          {formatCurrency(property.price)}
                          <span className="text-[11px] font-medium text-ink-500">
                            {property.priceUnit === 'day'
                              ? t.common.perDay
                              : property.priceUnit === 'month'
                                ? t.common.perMonth
                                : property.priceUnit === 'year'
                                  ? t.common.perYear
                                  : ''}
                          </span>
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                          <span className="inline-flex items-center gap-1">
                            <Ruler className="size-3" aria-hidden />
                            {formatSurface(property.surface)}
                          </span>
                          {property.bedrooms > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <BedDouble className="size-3" aria-hidden />
                              {property.bedrooms}
                            </span>
                          ) : null}
                          {property.bathrooms > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Bath className="size-3" aria-hidden />
                              {property.bathrooms}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Map */}
        <div className={cn('order-1 lg:order-2', mobileView === 'map' ? 'block' : 'hidden lg:block')}>
          <div className="relative h-[62vh] overflow-hidden rounded-2xl border border-ink-100 shadow-card lg:h-[76vh] lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
            <PropertyMapLazy
              items={results}
              selectedId={selectedId}
              onSelect={setSelectedId}
              userLocation={userLocation}
              mapRef={mapRef}
              onTilesError={() => setTilesFailed(true)}
              resizeKey={resizeKey}
            />

            {tilesFailed ? (
              <div className="absolute inset-x-4 top-4 z-[400] flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft/95 px-3.5 py-2.5 text-xs text-warning shadow-sm">
                <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {locale === 'ar'
                    ? 'تعذّر تحميل مربعات الخريطة (OpenStreetMap). تحقق من اتصالك.'
                    : 'Les tuiles OpenStreetMap n’ont pas pu être chargées. Vérifiez votre connexion.'}
                </span>
              </div>
            ) : null}

            <div className="pointer-events-none absolute bottom-4 start-4 z-[400] flex flex-wrap gap-2">
              <span className="rounded-full bg-ink-900/85 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
                {t.mapPage.legendDemo}
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-ink-700 backdrop-blur">
                {t.mapPage.clusterHint}
              </span>
            </div>

            {/* Selected preview card */}
            {selected ? (
              <div className="absolute inset-x-3 bottom-16 z-[500] sm:inset-x-auto sm:bottom-4 sm:end-4 sm:w-[320px]">
                <div className="animate-scale-in overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-panel">
                  <div className="relative h-36 bg-ink-100">
                    <SmartImage
                      src={selected.images[0] ?? ''}
                      alt={pick(selected.title)}
                      fill
                      seed={selected.surface}
                      sizes="320px"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="absolute end-2 top-2 rounded-full bg-white/90 p-1.5 text-ink-600 transition-colors hover:bg-white hover:text-ink-900"
                      aria-label={t.common.close}
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 p-2">
                      <Badge variant="ink">{selected.type}</Badge>
                      {selected.isDemo ? <Badge variant="demo">{t.common.demo}</Badge> : null}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 font-display text-sm font-semibold">
                      {pick(selected.title)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                      <MapPin className="size-3" aria-hidden />
                      {getAreaName(selected.area)}
                    </p>
                    <p className="mt-2 font-display text-base font-semibold">
                      {formatCurrency(selected.price)}
                      <span className="text-[11px] font-medium text-ink-500">
                        {selected.priceUnit === 'day'
                          ? t.common.perDay
                          : selected.priceUnit === 'month'
                            ? t.common.perMonth
                            : selected.priceUnit === 'year'
                              ? t.common.perYear
                              : ''}
                      </span>
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/properties/${selected.slug}`}>
                          <Navigation aria-hidden />
                          {t.mapPage.previewOpen}
                        </Link>
                      </Button>
                      <WhatsAppButton
                        message={buildPropertyMessage(selected, { locale, t })}
                        size="sm"
                        label={t.common.whatsapp}
                      >
                        <span className="sr-only">{t.common.whatsapp}</span>
                      </WhatsAppButton>
                      <DirectionsDialog
                        destination={selected.coordinates}
                        destinationLabel={`${pick(selected.title)} — ${getAreaName(selected.area)}`}
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAreaName(id: string): string {
  return AREAS.find((area) => area.id === id)?.name.fr ?? id;
}

export default MapExplorer;
