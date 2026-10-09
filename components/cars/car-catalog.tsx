'use client';

import { useMemo, useState } from 'react';
import { CarFront } from 'lucide-react';
import type { SortOption, VehicleCategory, VehicleFilters } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import {
  DEFAULT_VEHICLE_FILTERS,
  VEHICLE_PRICE_BOUNDS,
  applyVehicleFilters,
  sortVehicles,
} from '@/lib/filters';
import { formatCurrency } from '@/lib/format';
import { cn, toggleInArray } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyState from '@/components/shared/empty-state';
import CarCard from './car-card';

const CATEGORIES: VehicleCategory[] = ['economique', 'berline', 'suv', 'luxe', 'utilitaire'];
const SORTS: SortOption[] = ['relevance', 'price-asc', 'price-desc', 'newest'];

export function CarCatalog() {
  const { t } = useI18n();
  const { vehicles } = useDemoStore();
  const [filters, setFilters] = useState<VehicleFilters>(DEFAULT_VEHICLE_FILTERS);
  const [sort, setSort] = useState<SortOption>('relevance');

  const set = <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const results = useMemo(
    () => sortVehicles(applyVehicleFilters(vehicles, filters), sort),
    [vehicles, filters, sort],
  );

  const dirty =
    filters.query !== '' ||
    filters.categories.length > 0 ||
    filters.minPrice > VEHICLE_PRICE_BOUNDS.min ||
    filters.maxPrice < VEHICLE_PRICE_BOUNDS.max ||
    filters.transmission !== 'all' ||
    filters.seats > 0 ||
    filters.availableOnly;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <div className="space-y-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">{t.common.filters}</h2>
            {dirty ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setFilters(DEFAULT_VEHICLE_FILTERS)}
              >
                {t.common.reset}
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t.cars.category}</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={filters.categories.includes(category)}
                  onClick={() => set('categories', toggleInArray(filters.categories, category))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                    filters.categories.includes(category)
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900',
                  )}
                >
                  {t.cars[
                    `category${category.charAt(0).toUpperCase()}${category.slice(1)}` as
                      | 'categoryEconomique'
                      | 'categoryBerline'
                      | 'categorySuv'
                      | 'categoryLuxe'
                      | 'categoryUtilitaire'
                  ] ?? category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t.cars.dailyPrice}</Label>
              <span className="text-xs font-semibold tabular-nums text-ink-600">
                {formatCurrency(filters.minPrice)} — {formatCurrency(filters.maxPrice)}
              </span>
            </div>
            <Slider
              min={VEHICLE_PRICE_BOUNDS.min}
              max={VEHICLE_PRICE_BOUNDS.max}
              step={500}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) =>
                setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))
              }
              aria-label={t.cars.dailyPrice}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="car-transmission">{t.cars.transmission}</Label>
            <Select
              value={filters.transmission}
              onValueChange={(value) => set('transmission', value as VehicleFilters['transmission'])}
            >
              <SelectTrigger id="car-transmission">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.all}</SelectItem>
                <SelectItem value="manuelle">{t.cars.transmissionManuelle}</SelectItem>
                <SelectItem value="automatique">{t.cars.transmissionAutomatique}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="car-seats">{t.cars.seatsAny}</Label>
            <Select value={String(filters.seats)} onValueChange={(v) => set('seats', Number(v))}>
              <SelectTrigger id="car-seats">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 3, 4, 5, 7].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? t.common.all : `+${n}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-sand-50 px-3.5 py-3">
            <Label htmlFor="car-available" className="cursor-pointer text-sm">
              {t.cars.availableOnly}
            </Label>
            <Switch
              id="car-available"
              checked={filters.availableOnly}
              onCheckedChange={(checked) => set('availableOnly', checked)}
            />
          </div>
        </div>
      </aside>

      <section aria-live="polite">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            <span className="font-semibold text-ink-900">{results.length}</span>{' '}
            {results.length === 1 ? t.common.result : t.common.results}
          </p>
          <div className="w-[190px]">
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger aria-label={t.cars.sort}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t.properties[
                      option === 'price-asc'
                        ? 'sortPriceAsc'
                        : option === 'price-desc'
                          ? 'sortPriceDesc'
                          : option === 'newest'
                            ? 'sortNewest'
                            : 'sortRelevance'
                    ]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon={<CarFront className="size-6" aria-hidden />}
            title={t.cars.emptyTitle}
            text={t.cars.emptyText}
            action={
              <Button variant="outline" onClick={() => setFilters(DEFAULT_VEHICLE_FILTERS)}>
                {t.common.resetFilters}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
              >
                <CarCard vehicle={vehicle} priority={index < 3} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CarCatalog;
