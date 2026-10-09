'use client';

import Link from 'next/link';
import { ArrowLeft, Car, MapPinned, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { AREAS } from '@/data/areas';
import { formatNumber } from '@/lib/format';
import { unsplash } from '@/lib/images';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SmartImage from '@/components/shared/smart-image';
import { HomeSearchBar } from './home-search-bar';

const HERO_IMAGE = unsplash('1600585154340-be6161a56a0c', 1920);
const HERO_IMAGE_ALT = unsplash('1613490493576-7fde63acd811', 1920);

export function Hero() {
  const { t, locale } = useI18n();
  const { properties, vehicles } = useDemoStore();

  const stats = [
    { value: formatNumber(properties.length), label: t.home.statsProperties },
    { value: formatNumber(AREAS.length), label: t.home.statsAreas },
    { value: formatNumber(vehicles.length), label: t.home.statsVehicles },
    { value: '24 h', label: t.home.statsResponse },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-ink-900">
      {/* Photography */}
      <div className="absolute inset-0 -z-10">
        <SmartImage
          src={HERO_IMAGE}
          alt="Architecture résidentielle moderne à Alger"
          fill
          priority
          seed={2}
          fallbackKind="hero"
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-ink-950/92 via-ink-950/78 to-ink-900/55"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(229,184,63,0.18),transparent_60%)]"
          aria-hidden
        />
      </div>

      <div className="container-page relative pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-16">
          <div className="animate-fade-up text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-gold-200 backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden />
              {t.home.heroBadge}
            </span>

            <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-[3.65rem]">
              {t.home.heroTitle}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              {t.home.heroSubtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/properties">
                  {t.home.heroPrimary}
                  <ArrowLeft className={cn('size-[18px]', locale === 'ar' ? '' : 'rotate-180')} aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outlineLight">
                <Link href="/map">
                  <MapPinned aria-hidden />
                  {t.home.heroSecondary}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outlineLight">
                <Link href="/cars">
                  <Car aria-hidden />
                  {t.home.heroTertiary}
                </Link>
              </Button>
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wide text-white/50">{stat.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-gold-400">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Search card */}
          <div className="animate-fade-up [animation-delay:180ms]">
            <HomeSearchBar />
          </div>
        </div>

        {/* Secondary image strip — hidden on small screens to stay light */}
        <div className="mt-16 hidden items-center gap-4 lg:flex">
          {[HERO_IMAGE_ALT, unsplash('1600607687939-ce8a6c25118c', 600), unsplash('1583608205776-bfd35f0d9f83', 600)].map(
            (src, index) => (
              <div
                key={src}
                className="relative h-24 w-40 overflow-hidden rounded-xl border border-white/15 shadow-lg"
              >
                <SmartImage
                  src={src}
                  alt={`${t.meta.siteName} — intérieur ${index + 1}`}
                  fill
                  seed={index + 1}
                  sizes="160px"
                  className="object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
