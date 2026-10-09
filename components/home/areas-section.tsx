'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { AREAS } from '@/data/areas';
import { company } from '@/data/company';
import SectionHeading from '@/components/shared/section-heading';
import Reveal from '@/components/shared/reveal';

export function AreasSection() {
  const { t, pick } = useI18n();
  const { properties } = useDemoStore();

  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow={t.nav.map}
        title={t.home.areasTitle}
        text={t.home.areasText}
        action={
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
          >
            <MapPin className="size-4" aria-hidden />
            {t.home.heroSecondary}
          </Link>
        }
      />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((area, index) => {
          const count = properties.filter((p) => p.area === area.id).length;
          return (
            <Reveal as="li" key={area.id} delay={index * 50}>
              <Link
                href={`/properties?area=${area.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-card-hover"
              >
                <div>
                  <p className="font-display text-base font-semibold">{pick(area.name)}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{pick(area.wilaya)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-600 transition-colors group-hover:bg-gold-400 group-hover:text-ink-900">
                  {count} {count === 1 ? t.common.result : t.common.results}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>

      <p className="mt-8 text-sm text-ink-400">{pick(company.serviceAreasNote)}</p>
    </section>
  );
}

export default AreasSection;
