'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowLeftRight,
  Building2,
  Car,
  Check,
  FileCheck2,
  KeyRound,
  MessageCircle,
  Sofa,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { services } from '@/data/services';
import { company } from '@/data/company';
import { buildGeneralMessage, whatsappUrl } from '@/lib/whatsapp';
import { unsplash } from '@/lib/images';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/shared/reveal';
import SmartImage from '@/components/shared/smart-image';

const ICONS: Record<string, LucideIcon> = {
  Building2,
  KeyRound,
  Sofa,
  ArrowLeftRight,
  Car,
  FileCheck2,
};

const IMAGES: Record<string, string> = {
  'location-immobiliere': unsplash('1600607687939-ce8a6c25118c', 1200),
  'vente-immobiliere': unsplash('1560518883-ce09059eeffa', 1200),
  'meubles-courte-duree': unsplash('1522708323590-d24dbb6b0267', 1200),
  'echange-de-biens': unsplash('1592595896551-12b371d546d5', 1200),
  'location-vehicules': unsplash('1555215695-3004980ad54e', 1200),
  'assistance-administrative': unsplash('1554224155-6726b3ff858f', 1200),
};

export function ServicesContent() {
  const { t, pick, locale } = useI18n();
  const message = buildGeneralMessage(
    locale === 'ar' ? 'استفسار عن الخدمات' : 'Renseignement sur vos services',
    { locale, t },
  );

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink-900 py-20 text-white sm:py-24">
        <div className="absolute inset-0 -z-10 opacity-40">
          <SmartImage
            src={unsplash('1600585154340-be6161a56a0c', 1600)}
            alt=""
            fill
            seed={1}
            fallbackKind="hero"
            sizes="100vw"
          />
        </div>
        <div className="container-page">
          <p className="eyebrow text-gold-300">{t.nav.services}</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {t.services.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t.services.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/properties">{t.nav.properties}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineLight">
              <Link href="/cars">{t.nav.cars}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <div className="container-page py-16 sm:py-20">
        <div className="space-y-16 sm:space-y-24">
          {services.map((service, index) => {
            const Icon = ICONS[service.icon] ?? Building2;
            const reversed = index % 2 === 1;
            return (
              <Reveal
                key={service.id}
                className={cn(
                  'grid items-center gap-8 lg:grid-cols-2 lg:gap-14',
                  reversed && 'lg:[&>*:first-child]:order-2',
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ink-100 bg-ink-100 shadow-card">
                  <SmartImage
                    src={IMAGES[service.slug] ?? ''}
                    alt={pick(service.title)}
                    fill
                    seed={index + 2}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <span className="absolute start-5 top-5 flex size-12 items-center justify-center rounded-xl bg-ink-900 text-gold-400 shadow-lg">
                    <Icon className="size-[22px]" aria-hidden />
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                    {pick(service.title)}
                  </h2>
                  <div className="gold-rule my-4" aria-hidden />
                  <p className="text-[15px] leading-relaxed text-ink-600">
                    {pick(service.description)}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {service.bullets.map((bullet) => (
                      <li key={bullet.fr} className="flex items-start gap-2.5 text-sm text-ink-700">
                        <Check className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                        {pick(bullet)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={service.href}>
                        {t.services.cta}
                        <ArrowLeft
                          className={cn('size-4', locale === 'ar' ? '' : 'rotate-180')}
                          aria-hidden
                        />
                      </Link>
                    </Button>
                    <Button asChild variant="whatsapp">
                      <a
                        href={whatsappUrl(
                          buildGeneralMessage(pick(service.title), { locale, t }),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle aria-hidden />
                        {t.services.inquire}
                      </a>
                    </Button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Process */}
      <section className="border-y border-ink-100 bg-sand-50 py-16 sm:py-20">
        <div className="container-page">
          <h2 className="font-display text-3xl font-semibold">{t.services.processTitle}</h2>
          <div className="gold-rule my-5" aria-hidden />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.process.map((step, index) => (
              <Reveal as="li" key={step.step} delay={index * 70}>
                <div className="h-full rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                  <span className="font-display text-3xl font-semibold text-gold-500">
                    {step.step}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{pick(step.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{pick(step.body)}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <Reveal className="rounded-3xl bg-ink-900 px-6 py-14 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold text-white">
            {t.home.whatsappTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65">
            {t.home.whatsappText}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="whatsapp">
              <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t.home.whatsappCta}
              </a>
            </Button>
            <Button asChild size="lg" variant="outlineLight">
              <Link href="/contact">{t.nav.contact}</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

export default ServicesContent;
