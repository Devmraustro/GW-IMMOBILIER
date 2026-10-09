'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowLeftRight,
  Building2,
  Car,
  FileCheck2,
  KeyRound,
  Sofa,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { services } from '@/data/services';
import { cn } from '@/lib/utils';
import SectionHeading from '@/components/shared/section-heading';
import Reveal from '@/components/shared/reveal';

const ICONS: Record<string, LucideIcon> = {
  Building2,
  KeyRound,
  Sofa,
  ArrowLeftRight,
  Car,
  FileCheck2,
};

export function ServicesSection() {
  const { t, pick, locale } = useI18n();

  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow={t.nav.services}
        title={t.home.servicesTitle}
        text={t.home.servicesText}
        action={
          <ButtonLink href="/services" label={t.services.title} locale={locale} />
        }
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const Icon = ICONS[service.icon] ?? Building2;
          return (
            <Reveal key={service.id} delay={index * 60}>
              <Link
                href={service.href}
                className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-gold-300 hover:shadow-card-hover"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-ink-900 text-gold-400 transition-colors group-hover:bg-gold-400 group-hover:text-ink-900">
                  <Icon className="size-[22px]" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{pick(service.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{pick(service.summary)}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold text-gold-600">
                  {t.services.cta}
                  <ArrowLeft
                    className={cn('size-3.5 transition-transform', locale === 'ar' ? '' : 'rotate-180')}
                    aria-hidden
                  />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ButtonLink({
  href,
  label,
  locale,
}: {
  href: string;
  label: string;
  locale: 'fr' | 'ar';
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-50"
    >
      {label}
      <ArrowLeft className={cn('size-4', locale === 'ar' ? '' : 'rotate-180')} aria-hidden />
    </Link>
  );
}

export default ServicesSection;
