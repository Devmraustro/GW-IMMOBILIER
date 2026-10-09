'use client';

import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { PHONE_NUMBER } from '@/lib/config';
import { buildGeneralMessage, whatsappUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/shared/reveal';

export function WhatsAppCta() {
  const { t, locale } = useI18n();
  const message = buildGeneralMessage(
    locale === 'ar' ? 'استفسار عام' : 'Demande générale',
    { locale, t },
  );

  return (
    <section className="container-page py-20 sm:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2a1a] via-[#10452a] to-[#0b2015] px-6 py-14 sm:px-12">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 85% 20%, #25D366 0%, transparent 45%), radial-gradient(circle at 10% 90%, #E5B83F 0%, transparent 40%)',
            }}
            aria-hidden
          />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {t.home.whatsappTitle}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/70">{t.home.whatsappText}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="whatsapp">
                <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden />
                  {t.home.whatsappCta}
                </a>
              </Button>
              <Button asChild size="lg" variant="outlineLight">
                <a href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}>
                  <Phone aria-hidden />
                  {t.home.callCta}
                </a>
              </Button>
              <Button asChild size="lg" variant="outlineLight">
                <Link href="/contact">{t.nav.contact}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default WhatsAppCta;
