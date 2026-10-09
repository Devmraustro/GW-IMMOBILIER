'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Images, Maximize2, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import SmartImage from '@/components/shared/smart-image';

export function PropertyGallery({
  images,
  title,
  seed = 0,
  kind = 'property',
}: {
  images: string[];
  title: string;
  seed?: number;
  kind?: 'property' | 'vehicle';
}) {
  const { t, locale } = useI18n();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const list = images.length ? images : [''];

  const step = (delta: number) =>
    setActive((current) => (current + delta + list.length) % list.length);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="group relative aspect-[16/11] overflow-hidden rounded-2xl bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label={`${title} — ${t.properties.gallery}`}
        >
          <SmartImage
            src={list[active] ?? ''}
            alt={title}
            fill
            priority
            seed={seed}
            fallbackKind={kind}
            sizes="(max-width: 640px) 100vw, 70vw"
            className="transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-950/35 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="absolute bottom-4 end-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-900 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            <Maximize2 className="size-3.5" aria-hidden />
            {t.properties.gallery}
          </span>
          <span className="absolute bottom-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-ink-900/80 px-3 py-1.5 text-xs font-semibold text-white">
            <Images className="size-3.5" aria-hidden />
            {active + 1} / {list.length}
          </span>
        </button>

        <div className="hidden gap-3 sm:grid sm:grid-rows-3">
          {list.slice(0, 3).map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'relative overflow-hidden rounded-xl border-2 transition-all',
                index === active
                  ? 'border-gold-400'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
              aria-label={`${title} — ${index + 1}`}
              aria-pressed={index === active}
            >
              <SmartImage
                src={src}
                alt={`${title} — ${index + 1}`}
                fill
                seed={seed + index}
                fallbackKind={kind}
                sizes="220px"
              />
            </button>
          ))}
        </div>

        {/* Mobile thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {list.map((src, index) => (
            <button
              key={`m-${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2',
                index === active ? 'border-gold-400' : 'border-transparent',
              )}
              aria-label={`${title} — ${index + 1}`}
            >
              <SmartImage
                src={src}
                alt={`${title} — ${index + 1}`}
                fill
                seed={seed + index}
                fallbackKind={kind}
                sizes="96px"
              />
            </button>
          ))}
        </div>
      </div>

      <Dialog.Root open={lightbox} onOpenChange={setLightbox}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/90 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-4 focus:outline-none">
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            <div className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-ink-900">
              <SmartImage
                src={list[active] ?? ''}
                alt={`${title} — ${active + 1}`}
                fill
                seed={seed}
                fallbackKind={kind}
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="flex items-center gap-4 text-white">
              <button
                type="button"
                onClick={() => step(locale === 'ar' ? 1 : -1)}
                className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-white/20"
                aria-label={t.common.previous}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <span className="text-sm tabular-nums">
                {active + 1} / {list.length}
              </span>
              <button
                type="button"
                onClick={() => step(locale === 'ar' ? -1 : 1)}
                className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-white/20"
                aria-label={t.common.next}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-white/20"
                  aria-label={t.common.close}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default PropertyGallery;
