'use client';

import { Clock, FileCheck2, MapPinned, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { company } from '@/data/company';
import SectionHeading from '@/components/shared/section-heading';
import Reveal from '@/components/shared/reveal';
import { unsplash } from '@/lib/images';
import SmartImage from '@/components/shared/smart-image';

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  MapPinned,
  Clock,
  FileCheck2,
};

export function WhyUs() {
  const { t, pick } = useI18n();

  return (
    <section className="border-y border-ink-100 bg-ink-900 py-20 text-white sm:py-24">
      <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-20">
        <div>
          <SectionHeading
            eyebrow={t.home.whyTitle}
            title={<span className="text-white">{t.home.whyText}</span>}
          />

          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {company.values.map((value, index) => {
              const Icon = ICONS[value.icon] ?? ShieldCheck;
              return (
                <Reveal as="li" key={value.title.fr} delay={index * 70} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold-400/30 bg-gold-400/10 text-gold-400">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {pick(value.title)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">{pick(value.body)}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>

        <Reveal delay={120} className="relative">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10 shadow-panel">
            <SmartImage
              src={unsplash('1600210492486-724fe5c67fb0', 900)}
              alt="Intérieur soigné d’un appartement géré par GW Immobilier"
              fill
              seed={3}
              sizes="(max-width: 1024px) 100vw, 460px"
            />
          </div>
          <div className="absolute -bottom-6 start-6 max-w-[260px] rounded-2xl border border-white/10 bg-ink-800/95 p-5 shadow-panel backdrop-blur">
            <p className="font-display text-3xl font-semibold text-gold-400">4</p>
            <p className="mt-1 text-sm leading-snug text-white/70">{t.home.processTitle}</p>
          </div>
        </Reveal>
      </div>

      {/* Process */}
      <div className="container-page mt-20">
        <h3 className="font-display text-2xl font-semibold text-white">{t.home.processTitle}</h3>
        <div className="gold-rule my-5" aria-hidden />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {company.process.map((step, index) => (
            <Reveal as="li" key={step.step} delay={index * 70}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-gold-400/40">
                <span className="font-display text-3xl font-semibold text-gold-400/80">
                  {step.step}
                </span>
                <h4 className="mt-3 font-display text-base font-semibold text-white">
                  {pick(step.title)}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{pick(step.body)}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default WhyUs;
