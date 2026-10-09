'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, Rows3, SearchX, SlidersHorizontal } from 'lucide-react';
import type { PropertyFilters, SortOption } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import {
  DEFAULT_PROPERTY_FILTERS,
  applyPropertyFilters,
  countActivePropertyFilters,
  sortProperties,
} from '@/lib/filters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';
import { PropertyCard } from './property-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PropertyFiltersPanel from './property-filters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SORTS: SortOption[] = ['relevance', 'price-asc', 'price-desc', 'newest', 'surface-desc'];

function filtersFromParams(params: URLSearchParams): PropertyFilters {
  const readList = (key: string) =>
    (params.get(key) ?? '').split(',').filter(Boolean) as never[];

  return {
    ...DEFAULT_PROPERTY_FILTERS,
    query: params.get('q') ?? '',
    areas: readList('area'),
    types: readList('type'),
    periods: readList('period'),
    categories: readList('category'),
    minPrice: Number(params.get('min') ?? DEFAULT_PROPERTY_FILTERS.minPrice) || 0,
    maxPrice:
      Number(params.get('max') ?? DEFAULT_PROPERTY_FILTERS.maxPrice) ||
      DEFAULT_PROPERTY_FILTERS.maxPrice,
  };
}

function paramsFromFilters(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.areas.length) params.set('area', filters.areas.join(','));
  if (filters.types.length) params.set('type', filters.types.join(','));
  if (filters.periods.length) params.set('period', filters.periods.join(','));
  if (filters.categories.length) params.set('category', filters.categories.join(','));
  if (filters.minPrice > 0) params.set('min', String(filters.minPrice));
  if (filters.maxPrice < DEFAULT_PROPERTY_FILTERS.maxPrice)
    params.set('max', String(filters.maxPrice));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function PropertyCatalog() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { properties } = useDemoStore();

  const [filters, setFilters] = useState<PropertyFilters>(() =>
    filtersFromParams(new URLSearchParams(searchParams?.toString() ?? '')),
  );
  const [sort, setSort] = useState<SortOption>('relevance');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Reflect the filters in the URL so a search can be shared or bookmarked.
  useEffect(() => {
    const next = paramsFromFilters(filters);
    const current = window.location.search;
    if (next !== current) {
      router.replace(`/properties${next}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const results = useMemo(
    () => sortProperties(applyPropertyFilters(properties, filters), sort),
    [properties, filters, sort],
  );

  const activeCount = countActivePropertyFilters(filters);
  const reset = () => setFilters(DEFAULT_PROPERTY_FILTERS);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      {/* Filters — desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+1.5rem)]">
          <PropertyFiltersPanel
            filters={filters}
            onChange={setFilters}
            onReset={reset}
            activeCount={activeCount}
          />
        </div>
      </aside>

      {/* Results */}
      <section aria-live="polite">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            <span className="font-semibold text-ink-900">{results.length}</span>{' '}
            {results.length === 1 ? t.common.result : t.common.results}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal aria-hidden />
              {t.common.filters}
              {activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>

            <div className="w-[190px]">
              <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                <SelectTrigger aria-label={t.common.sortBy}>
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
                              : option === 'surface-desc'
                                ? 'sortSurfaceDesc'
                                : 'sortRelevance'
                      ] ?? t.common.sortBy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="hidden items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 sm:flex"
              role="group"
              aria-label={t.common.view}
            >
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                className={cn(
                  'rounded-lg p-1.5 transition-colors',
                  view === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:text-ink-900',
                )}
              >
                <LayoutGrid className="size-4" aria-hidden />
                <span className="sr-only">{t.common.grid}</span>
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                className={cn(
                  'rounded-lg p-1.5 transition-colors',
                  view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:text-ink-900',
                )}
              >
                <Rows3 className="size-4" aria-hidden />
                <span className="sr-only">{t.common.list}</span>
              </button>
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" aria-hidden />}
            title={t.properties.emptyTitle}
            text={t.properties.emptyText}
            action={
              <Button variant="outline" onClick={reset}>
                {t.common.resetFilters}
              </Button>
            }
          />
        ) : (
          <div
            className={cn(
              view === 'grid'
                ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col gap-6',
            )}
          >
            {results.map((property, index) => (
              <div
                key={property.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
              >
                <PropertyCard property={property} variant={view} priority={index < 3} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Filters — mobile dialog */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.common.filters}</DialogTitle>
          </DialogHeader>
          <PropertyFiltersPanel
            filters={filters}
            onChange={setFilters}
            onReset={reset}
            activeCount={activeCount}
            className="border-0 p-0 shadow-none"
            idPrefix="filter-mobile"
          />
          <Button onClick={() => setMobileFiltersOpen(false)} fullWidth>
            {t.common.apply}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertyCatalog;
