'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import type { RentalPeriod } from '@/types';
import { useI18n } from '@/lib/i18n';
import { propertyTypeLabel } from '@/lib/labels';
import { AREAS } from '@/data/areas';
import { PROPERTY_TYPES, RENTAL_PERIODS } from '@/lib/filters';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BUDGET_STEPS = [0, 50_000, 100_000, 200_000, 400_000, 1_000_000, 20_000_000];

export function HomeSearchBar() {
  const { t, pick } = useI18n();
  const router = useRouter();
  const [area, setArea] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [period, setPeriod] = useState<string>('all');
  const [budget, setBudget] = useState<string>('0');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (area !== 'all') params.set('area', area);
    if (type !== 'all') params.set('type', type);
    if (period !== 'all') params.set('period', period);
    if (Number(budget) > 0) params.set('max', budget);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : '/properties');
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-white/15 bg-white/95 p-6 shadow-panel backdrop-blur-md sm:p-7"
      aria-label={t.home.searchTitle}
    >
      <h2 className="font-display text-lg font-semibold text-ink-900">{t.home.searchTitle}</h2>
      <p className="mt-1 text-sm text-ink-500">{t.home.searchSubtitle}</p>

      <div className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="home-area" className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            {t.search.location}
          </label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger id="home-area">
              <SelectValue placeholder={t.search.locationPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.search.locationPlaceholder}</SelectItem>
              {AREAS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {pick(item.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="home-type"
              className="text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              {t.search.propertyType}
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="home-type">
                <SelectValue placeholder={t.search.propertyTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.search.propertyTypePlaceholder}</SelectItem>
                {PROPERTY_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {propertyTypeLabel(item, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="home-period"
              className="text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              {t.search.period}
            </label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="home-period">
                <SelectValue placeholder={t.search.periodPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.search.periodPlaceholder}</SelectItem>
                {RENTAL_PERIODS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t.periods[item as RentalPeriod]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="home-budget"
            className="text-xs font-semibold uppercase tracking-wide text-ink-500"
          >
            {t.search.budget}
          </label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger id="home-budget">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_STEPS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value === 0 ? t.common.all : `≤ ${formatCurrency(value)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" size="lg" fullWidth className="mt-2">
          <Search aria-hidden />
          {t.search.submit}
        </Button>
      </div>
    </form>
  );
}

export default HomeSearchBar;
