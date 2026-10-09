import type { Locale, Property, Vehicle } from '@/types';
import type { Dictionary } from '@/lib/i18n';
import { WHATSAPP_NUMBER } from '@/lib/config';
import { formatCurrency, nightsBetween } from '@/lib/format';
import { propertyTypeLabel } from '@/lib/labels';
import { AREAS } from '@/data/areas';

export interface MessageContext {
  locale: Locale;
  t: Dictionary;
  /** Customer-entered details (optional — used to prefill the request). */
  fullName?: string;
  phone?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
}

const SITE_LABEL = 'GW Immobilier';

function header(locale: Locale): string {
  return locale === 'ar'
    ? `مرحباً ${SITE_LABEL}،`
    : `Bonjour ${SITE_LABEL},`;
}

function dateLine(locale: Locale, startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return '';
  const nights = nightsBetween(startDate, endDate);
  return locale === 'ar'
    ? `\n• التواريخ: من ${startDate} إلى ${endDate} (${nights} ليلة)`
    : `\n• Dates souhaitées : du ${startDate} au ${endDate} (${nights} nuit${nights > 1 ? 's' : ''})`;
}

/** Human-readable commune name — never send the raw area id to a customer. */
function areaLabel(areaId: string, locale: Locale): string {
  return AREAS.find((area) => area.id === areaId)?.name[locale] ?? areaId;
}

function footer(locale: Locale, fullName?: string, phone?: string): string {
  const parts: string[] = [];
  if (fullName) parts.push(locale === 'ar' ? `الاسم: ${fullName}` : `Nom : ${fullName}`);
  if (phone) parts.push(locale === 'ar' ? `الهاتف: ${phone}` : `Téléphone : ${phone}`);
  return parts.length ? `\n—\n${parts.join('\n')}` : '';
}

export function buildPropertyMessage(
  property: Property,
  ctx: MessageContext,
): string {
  const { locale } = ctx;
  const area = areaLabel(property.area, locale);
  if (locale === 'ar') {
    return [
      header(locale),
      `أرغب في الاستفسار عن العقار التالي:`,
      `• المرجع: ${property.reference}`,
      `• العنوان: ${property.title.ar}`,
      `• البلدية: ${area}`,
      `• النوع: ${propertyTypeLabel(property.type, ctx.t)}`,
      `• السعر: ${formatCurrency(property.price)}${
        property.priceUnit === 'day'
          ? ' / يوم'
          : property.priceUnit === 'month'
            ? ' / شهر'
            : property.priceUnit === 'year'
              ? ' / سنة'
              : ''
      }`,
      dateLine(locale, ctx.startDate, ctx.endDate).trim(),
      ctx.message ? `\n• ${ctx.message}` : '',
      footer(locale, ctx.fullName, ctx.phone),
    ]
      .filter(Boolean)
      .join('\n');
  }

  const unit =
    property.priceUnit === 'day'
      ? ctx.t.common.perDay
      : property.priceUnit === 'month'
        ? ctx.t.common.perMonth
        : property.priceUnit === 'year'
          ? ctx.t.common.perYear
          : '';

  return [
    header(locale),
    `Je souhaite recevoir des informations sur le bien suivant :`,
    `• Référence : ${property.reference}`,
    `• Titre : ${property.title.fr}`,
    `• Commune : ${area}`,
    `• Type : ${propertyTypeLabel(property.type, ctx.t)}`,
    `• Prix : ${formatCurrency(property.price)}${unit}`,
    dateLine(locale, ctx.startDate, ctx.endDate).trim(),
    ctx.message ? `\n• ${ctx.message}` : '',
    footer(locale, ctx.fullName, ctx.phone),
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildVehicleMessage(vehicle: Vehicle, ctx: MessageContext): string {
  const { locale } = ctx;
  if (locale === 'ar') {
    return [
      header(locale),
      `أرغب في حجز السيارة التالية:`,
      `• المرجع: ${vehicle.reference}`,
      `• السيارة: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      `• السعر اليومي: ${formatCurrency(vehicle.dailyPrice)}`,
      dateLine(locale, ctx.startDate, ctx.endDate).trim(),
      ctx.message ? `\n• ${ctx.message}` : '',
      footer(locale, ctx.fullName, ctx.phone),
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    header(locale),
    `Je souhaite réserver le véhicule suivant :`,
    `• Référence : ${vehicle.reference}`,
    `• Véhicule : ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    `• Prix / jour : ${formatCurrency(vehicle.dailyPrice)}`,
    dateLine(locale, ctx.startDate, ctx.endDate).trim(),
    ctx.message ? `\n• ${ctx.message}` : '',
    footer(locale, ctx.fullName, ctx.phone),
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildGeneralMessage(
  subject: string,
  ctx: MessageContext,
): string {
  const { locale } = ctx;
  if (locale === 'ar') {
    return [
      header(locale),
      `• الموضوع: ${subject}`,
      ctx.message ? `\n• ${ctx.message}` : '',
      footer(locale, ctx.fullName, ctx.phone),
    ]
      .filter(Boolean)
      .join('\n');
  }
  return [
    header(locale),
    `• Objet : ${subject}`,
    ctx.message ? `\n• ${ctx.message}` : '',
    footer(locale, ctx.fullName, ctx.phone),
  ]
    .filter(Boolean)
    .join('\n');
}

/** Build the wa.me deep link. Works on desktop (web) and mobile (app). */
export function whatsappUrl(message: string, number: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent(message)}`;
}
