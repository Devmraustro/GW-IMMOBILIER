'use client';

import Link from 'next/link';
import { Clock, FileCheck2, MapPinned, MessageCircle, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { AREAS } from '@/data/areas';
import { company } from '@/data/company';
import { buildGeneralMessage, whatsappUrl } from '@/lib/whatsapp';
import { unsplash } from '@/lib/images';
import { formatNumber } from '@/lib/format';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/shared/reveal';
import SectionHeading from '@/components/shared/section-heading';
import SmartImage from '@/components/shared/smart-image';

const ICONS = { ShieldCheck, MapPinned, Clock, FileCheck2 };

export function AboutContent() {
  const { t, pick, locale } = useI18n();
  const { properties, vehicles } = useDemoStore();
  const message = buildGeneralMessage(
    locale === 'ar' ? 'استفسار عام' : 'Demande générale',
    { locale, t },
  );

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink-900 py-20 text-white sm:py-24">
        <div className="absolute inset-0 -z-10 opacity-35">
          <SmartImage
            src={unsplash('1613490493576-7fde63acd811', 1600)}
            alt=""
            fill
            seed={2}
            fallbackKind="hero"
            sizes="100vw"
          />
        </div>
        <div className="container-page">
          <p className="eyebrow text-gold-300">{t.nav.about}</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {t.about.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t.about.subtitle}
          </p>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-8 border-t border-white/15 pt-8 sm:grid-cols-4">
            <Stat value={formatNumber(properties.length)} label={t.home.statsProperties} />
            <Stat value={formatNumber(AREAS.length)} label={t.home.statsAreas} />
            <Stat value={formatNumber(vehicles.length)} label={t.home.statsVehicles} />
            <Stat value="24 h" label={t.home.statsResponse} />
          </dl>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-semibold">{t.about.storyTitle}</h2>
            <div className="gold-rule my-5" aria-hidden />
            <p className="text-[15px] leading-relaxed text-ink-600">{pick(company.story)}</p>

            <h2 className="mt-12 font-display text-3xl font-semibold">{t.about.missionTitle}</h2>
            <div className="gold-rule my-5" aria-hidden />
            <p className="text-[15px] leading-relaxed text-ink-600">{pick(company.mission)}</p>
          </div>

          <Reveal className="relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-ink-100 shadow-card">
              <SmartImage
                src={unsplash('1600566753086-00f18fb6b3ea', 900)}
                alt="Intérieur d’un bien géré par GW Immobilier"
                fill
                seed={3}
                sizes="(max-width: 1024px) 100vw, 460px"
              />
            </div>
            <div className="absolute -bottom-6 start-6 rounded-2xl bg-ink-900 px-6 py-5 text-white shadow-panel">
              <p className="font-display text-3xl font-semibold text-gold-400">
                {company.established}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/60">GW Immobilier</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-sand-50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow={t.about.valuesTitle} title={t.about.valuesTitle} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.values.map((value, index) => {
              const Icon = ICONS[value.icon as keyof typeof ICONS] ?? ShieldCheck;
              return (
                <Reveal as="li" key={value.title.fr} delay={index * 70}>
                  <div className="h-full rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-ink-900 text-gold-400">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold">{pick(value.title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{pick(value.body)}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={t.nav.map}
          title={t.about.areasTitle}
          text={pick(company.serviceAreasNote)}
          action={
            <Button asChild variant="outline">
              <Link href="/map">{t.home.heroSecondary}</Link>
            </Button>
          }
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area, index) => (
            <Reveal as="li" key={area.id} delay={index * 45}>
              <Link
                href={`/properties?area=${area.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-card-hover"
              >
                <div>
                  <p className="font-display text-base font-semibold">{pick(area.name)}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{pick(area.wilaya)}</p>
                </div>
                <MapPinned className="size-4 shrink-0 text-gold-600" aria-hidden />
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="container-page pb-16">
        <Reveal className="rounded-3xl border border-dashed border-warning/50 bg-warning-soft p-8">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {t.about.disclaimerTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">
            {t.about.disclaimerText}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="whatsapp">
              <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t.about.contactCta}
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">{t.nav.contact}</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-white/50">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold text-gold-400">{value}</dd>
    </div>
  );
}

export default AboutContent;
