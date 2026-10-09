'use client';

import Link from 'next/link';
import { ArrowUp, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { AREAS } from '@/data/areas';
import { services } from '@/data/services';
import { company, socialLinks } from '@/data/company';
import { CONTACT_EMAIL, IS_PLACEHOLDER_CONTACT, PHONE_NUMBER, WHATSAPP_NUMBER } from '@/lib/config';
import { whatsappUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { NAV_ITEMS, ADMIN_NAV_ITEM } from './nav-links';

export function SiteFooter() {
  const { t, pick } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-ink-100 bg-ink-900 text-ink-100">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5">
            <Logo variant="light" />
            <p className="max-w-xs text-sm leading-relaxed text-white/60">{t.footer.description}</p>
            {IS_PLACEHOLDER_CONTACT ? (
              <p className="rounded-lg border border-dashed border-warning/50 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-gold-200">
                {t.common.placeholderContact}
              </p>
            ) : null}
            {socialLinks.length > 0 ? (
              <ul className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-gold-400 hover:text-ink-900"
                    >
                      <span className="sr-only">{social.label}</span>
                      <MessageCircle className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/40">{t.contact.socialEmpty}</p>
            )}
          </div>

          {/* Navigation */}
          <nav aria-label={t.footer.quickLinks}>
            <h2 className="font-display text-base font-semibold text-white">{t.footer.quickLinks}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <ul className="space-y-2.5 text-sm">
              {[...NAV_ITEMS, ADMIN_NAV_ITEM].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/60 transition-colors hover:text-gold-400"
                  >
                    {t.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services + areas */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                {t.footer.servicesList}
              </h2>
              <div className="gold-rule my-4" aria-hidden />
              <ul className="space-y-2.5 text-sm">
                {services.slice(0, 6).map((service) => (
                  <li key={service.id}>
                    <Link
                      href={service.href}
                      className="text-white/60 transition-colors hover:text-gold-400"
                    >
                      {pick(service.title)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-white">{t.footer.areas}</h2>
              <div className="gold-rule my-4" aria-hidden />
              <ul className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-white/60">
                {AREAS.map((area) => (
                  <li key={area.id}>
                    <Link
                      href={`/properties?area=${area.id}`}
                      className="transition-colors hover:text-gold-400"
                    >
                      {pick(area.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-display text-base font-semibold text-white">{t.footer.contactUs}</h2>
            <div className="gold-rule my-4" aria-hidden />
            <ul className="space-y-3.5 text-sm">
              <li>
                <a
                  href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
                  className="-mx-1 flex items-center gap-3 rounded-lg px-1 py-1 text-white/70 transition-colors hover:text-gold-400"
                >
                  <Phone className="size-4 shrink-0 text-gold-400" aria-hidden />
                  <span className="tabular-nums">{PHONE_NUMBER}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl(t.home.whatsappText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-mx-1 flex items-center gap-3 rounded-lg px-1 py-1 text-white/70 transition-colors hover:text-gold-400"
                >
                  <MessageCircle className="size-4 shrink-0 text-gold-400" aria-hidden />
                  <span className="tabular-nums">+{WHATSAPP_NUMBER}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="-mx-1 flex items-center gap-3 rounded-lg px-1 py-1 text-white/70 transition-colors hover:text-gold-400"
                >
                  <Mail className="size-4 shrink-0 text-gold-400" aria-hidden />
                  <span className="break-all">{CONTACT_EMAIL}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
                <span>{t.contact.addressPlaceholder}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row">
          <p>
            © {year} {company.legalName}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-dashed border-white/20 px-2.5 py-1">
              {t.footer.demoNote}
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:text-gold-400',
              )}
            >
              {t.footer.backToTop}
              <ArrowUp className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
