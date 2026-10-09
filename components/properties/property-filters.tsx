'use client';

import { useMemo } from 'react';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import type {
  AreaId,
  ListingCategory,
  PropertyFilters,
  PropertyType,
  RentalPeriod,
} from '@/types';
import { useI18n } from '@/lib/i18n';
import { AREAS } from '@/data/areas';
import { PROPERTY_TYPES, RENTAL_PERIODS, PRICE_BOUNDS } from '@/lib/filters';
import { formatCurrency } from '@/lib/format';
import { cn, toggleInArray } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES: ListingCategory[] = ['rent', 'sale', 'exchange'];

/** Upper bound of the price slider adapts to what the user is looking for. */
function priceCeiling(filters: PropertyFilters): number {
  if (filters.categories.includes('sale')) return PRICE_BOUNDS.max;
  if (filters.periods.includes('daily')) return 80_000;
  if (filters.periods.includes('annual')) return 300_000;
  return 300_000;
}

export function PropertyFiltersPanel({
  filters,
  onChange,
  onReset,
  activeCount = 0,
  className,
  compact = false,
  idPrefix = 'filter',
}: {
  filters: PropertyFilters;
  onChange: (next: PropertyFilters) => void;
  onReset: () => void;
  activeCount?: number;
  className?: string;
  compact?: boolean;
  /** Keeps DOM ids unique when the panel is mounted twice (desktop + mobile). */
  idPrefix?: string;
}) {
  const { t, pick } = useI18n();
  const ceiling = useMemo(() => priceCeiling(filters), [filters]);
  const step = Math.max(1000, Math.round(ceiling / 100 / 1000) * 1000);

  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const id = (name: string) => `${idPrefix}-${name}`;

  const toggleArea = (id: AreaId) => set('areas', toggleInArray(filters.areas, id));
  const toggleType = (id: PropertyType) => set('types', toggleInArray(filters.types, id));
  const togglePeriod = (id: RentalPeriod) => set('periods', toggleInArray(filters.periods, id));
  const toggleCategory = (id: ListingCategory) =>
    set('categories', toggleInArray(filters.categories, id));

  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-100 bg-white p-5 shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <SlidersHorizontal className="size-4 text-gold-600" aria-hidden />
          {t.common.filters}
          {activeCount > 0 ? <Badge variant="gold">{activeCount}</Badge> : null}
        </h2>
        {activeCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
            <RotateCcw aria-hidden />
            {t.common.reset}
          </Button>
        ) : null}
      </div>

      <div className="mt-5 space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor={id('query')}>{t.search.location}</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              id={id('query')}
              value={filters.query}
              onChange={(event) => set('query', event.target.value)}
              placeholder={t.common.search}
              className="ps-9"
              type="search"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>{t.common.category}</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                active={filters.categories.includes(category)}
                onClick={() => toggleCategory(category)}
              >
                {t.categories[category]}
              </Chip>
            ))}
          </div>
        </div>

        {/* Area */}
        <div className="space-y-2">
          <Label>{t.common.area}</Label>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((area) => (
              <Chip
                key={area.id}
                active={filters.areas.includes(area.id)}
                onClick={() => toggleArea(area.id)}
              >
                {pick(area.name)}
              </Chip>
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>{t.common.type}</Label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <Chip key={type} active={filters.types.includes(type)} onClick={() => toggleType(type)}>
                {type}
              </Chip>
            ))}
          </div>
        </div>

        {/* Period */}
        <div className="space-y-2">
          <Label>{t.search.period}</Label>
          <div className="flex flex-wrap gap-2">
            {RENTAL_PERIODS.map((period) => (
              <Chip
                key={period}
                active={filters.periods.includes(period)}
                onClick={() => togglePeriod(period)}
              >
                {t.periods[period]}
              </Chip>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t.search.budget}</Label>
            <span className="text-xs font-semibold tabular-nums text-ink-600">
              {formatCurrency(filters.minPrice)} — {formatCurrency(Math.min(filters.maxPrice, ceiling))}
            </span>
          </div>
          <Slider
            min={0}
            max={ceiling}
            step={step}
            value={[Math.min(filters.minPrice, ceiling), Math.min(filters.maxPrice, ceiling)]}
            onValueChange={([min, max]) => onChange({ ...filters, minPrice: min, maxPrice: max })}
            aria-label={t.search.budget}
          />
          <div className="flex justify-between text-[11px] text-ink-400">
            <span>0 DA</span>
            <span>{formatCurrency(ceiling)}</span>
          </div>
        </div>

        {!compact ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={id('furnished')}>{t.properties.furnishedFilter}</Label>
                <Select
                  value={filters.furnished}
                  onValueChange={(value) =>
                    set('furnished', value as PropertyFilters['furnished'])
                  }
                >
                  <SelectTrigger id={id('furnished')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.properties.furnishedAll}</SelectItem>
                    <SelectItem value="furnished">{t.properties.furnishedYes}</SelectItem>
                    <SelectItem value="unfurnished">{t.properties.furnishedNo}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={id('bedrooms')}>{t.properties.bedroomsAny}</Label>
                <Select
                  value={String(filters.bedrooms)}
                  onValueChange={(value) => set('bedrooms', Number(value))}
                >
                  <SelectTrigger id={id('bedrooms')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n === 0 ? t.common.all : `+${n}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={id('available-from')}>{t.properties.availableFrom}</Label>
              <Input
                id={id('available-from')}
                type="date"
                value={filters.availableFrom ?? ''}
                onChange={(event) => set('availableFrom', event.target.value || undefined)}
              />
            </div>
          </>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-3.5 py-3">
          <Label htmlFor={id('available')} className="cursor-pointer text-sm">
            {t.properties.availableOnly}
          </Label>
          <Switch
            id={id('available')}
            checked={filters.availableOnly}
            onCheckedChange={(checked) => set('availableOnly', checked)}
          />
        </div>
      </div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-sand-50 hover:text-ink-900',
      )}
    >
      {children}
      {active ? <X className="size-3" aria-hidden /> : null}
    </button>
  );
}

export default PropertyFiltersPanel;
