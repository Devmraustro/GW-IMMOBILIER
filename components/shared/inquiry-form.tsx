'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { Property, Vehicle } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { validateInquiryForm, type FieldErrors } from '@/lib/validation';
import {
  buildPropertyMessage,
  buildVehicleMessage,
  whatsappUrl,
} from '@/lib/whatsapp';
import { formatCurrency, nightsBetween, todayISO } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input, Textarea, FieldError } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InquiryFormProps {
  property?: Property;
  vehicle?: Vehicle;
  requireDates?: boolean;
  className?: string;
}

export function InquiryForm({ property, vehicle, requireDates, className }: InquiryFormProps) {
  const { t, tpl, locale } = useI18n();
  const { addInquiry } = useDemoStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const messagePlaceholder = property
    ? t.inquiry.messagePropertyPlaceholder
    : t.inquiry.messageVehiclePlaceholder;
  const [message, setMessage] = useState(messagePlaceholder);
  // Once the visitor has typed something we must never overwrite it, but a
  // language switch should still translate the untouched default text.
  const [messageEdited, setMessageEdited] = useState(false);

  useEffect(() => {
    if (!messageEdited) setMessage(messagePlaceholder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const needsDates = requireDates ?? Boolean(property?.rentalPeriod === 'daily');

  const composeMessage = () => {
    const ctx = { locale, t, fullName, phone, message, startDate, endDate };
    if (property) return buildPropertyMessage(property, ctx);
    if (vehicle) return buildVehicleMessage(vehicle, ctx);
    return '';
  };

  const estimate = () => {
    if (!startDate || !endDate) return null;
    const nights = nightsBetween(startDate, endDate);
    if (nights <= 0) return null;
    if (property && property.priceUnit === 'day') return nights * property.price;
    if (vehicle) return nights * vehicle.dailyPrice;
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = validateInquiryForm(
      { fullName, phone, email, message, startDate, endDate },
      t,
      { requireDates: needsDates },
    );
    setErrors(result.errors);

    if (!result.valid) {
      toast.error(t.contact.errorTitle);
      return;
    }

    setSending(true);
    // Demo flow: stored locally, no backend call is made.
    await new Promise((resolve) => setTimeout(resolve, 450));
    addInquiry({
      type: property ? 'property' : vehicle ? 'vehicle' : 'general',
      status: 'new',
      channel: 'form',
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      message: message.trim(),
      propertyId: property?.id,
      vehicleId: vehicle?.id,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setSending(false);
    setSubmitted(true);
    toast.success(t.inquiry.successTitle, { description: t.inquiry.successText });
  };

  const handleWhatsApp = () => {
    const result = validateInquiryForm(
      { fullName, phone, email, message, startDate, endDate },
      t,
      { requireDates: needsDates },
    );
    setErrors(result.errors);
    if (!result.valid) {
      toast.error(t.contact.errorTitle);
      return;
    }
    window.open(whatsappUrl(composeMessage()), '_blank', 'noopener,noreferrer');
    toast.success(t.inquiry.whatsappSuccessTitle, { description: t.inquiry.whatsappSuccessText });
  };

  const reset = () => {
    setSubmitted(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setStartDate('');
    setEndDate('');
    setMessage(
      property ? t.inquiry.messagePropertyPlaceholder : t.inquiry.messageVehiclePlaceholder,
    );
    setErrors({});
  };

  const estimated = estimate();

  if (submitted) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-success/25 bg-success-soft p-6 text-center">
          <CheckCircle2 className="mx-auto size-9 text-success" aria-hidden />
          <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">
            {t.inquiry.successTitle}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t.inquiry.successText}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              {t.contact.sendAnother}
            </Button>
            <Button size="sm" onClick={handleWhatsApp}>
              <MessageCircle aria-hidden />
              {t.common.whatsapp}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const title = property
    ? tpl(t.inquiry.propertyTitle, { reference: property.reference })
    : vehicle
      ? tpl(t.inquiry.vehicleTitle, { reference: vehicle.reference })
      : t.inquiry.title;

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{t.inquiry.description}</p>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="inq-name">
              {t.inquiry.name} <span className="text-danger">*</span>
            </Label>
            <Input
              id="inq-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              aria-invalid={Boolean(errors.fullName)}
              autoComplete="name"
              className="mt-1.5"
            />
            <FieldError>{errors.fullName}</FieldError>
          </div>

          <div>
            <Label htmlFor="inq-phone">
              {t.inquiry.phone} <span className="text-danger">*</span>
            </Label>
            <Input
              id="inq-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              autoComplete="tel"
              placeholder="0555 12 34 56"
              className="mt-1.5"
            />
            <FieldError>{errors.phone}</FieldError>
          </div>
        </div>

        <div>
          <Label htmlFor="inq-email">
            {t.inquiry.email}{' '}
            <span className="text-xs font-normal text-ink-400">({t.common.optional})</span>
          </Label>
          <Input
            id="inq-email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="mt-1.5"
          />
          <FieldError>{errors.email}</FieldError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="inq-start">
              {t.inquiry.startDate}
              {needsDates ? <span className="text-danger"> *</span> : null}
            </Label>
            <Input
              id="inq-start"
              type="date"
              min={todayISO()}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              aria-invalid={Boolean(errors.startDate)}
              className="mt-1.5"
            />
            <FieldError>{errors.startDate}</FieldError>
          </div>
          <div>
            <Label htmlFor="inq-end">
              {t.inquiry.endDate}
              {needsDates ? <span className="text-danger"> *</span> : null}
            </Label>
            <Input
              id="inq-end"
              type="date"
              min={startDate || todayISO()}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              aria-invalid={Boolean(errors.endDate)}
              className="mt-1.5"
            />
            <FieldError>{errors.endDate}</FieldError>
          </div>
        </div>

        {estimated ? (
          <p className="rounded-xl bg-sand-50 px-3.5 py-2.5 text-sm text-ink-700">
            {tpl(t.inquiry.totalEstimate, { amount: formatCurrency(estimated) })}{' '}
            <span className="text-ink-400">
              ({tpl(t.inquiry.nights, { nights: nightsBetween(startDate, endDate) })})
            </span>
          </p>
        ) : null}

        <div>
          <Label htmlFor="inq-message">
            {t.inquiry.message} <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="inq-message"
            value={message}
            onChange={(event) => {
              setMessageEdited(true);
              setMessage(event.target.value);
            }}
            aria-invalid={Boolean(errors.message)}
            className="mt-1.5"
          />
          <FieldError>{errors.message}</FieldError>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" size="lg" loading={sending} className="flex-1">
            {!sending ? <Send aria-hidden /> : null}
            {t.inquiry.submit}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="whatsapp"
            onClick={handleWhatsApp}
            className="flex-1"
          >
            <MessageCircle aria-hidden />
            {t.inquiry.whatsappSubmit}
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-ink-400">
          {property?.isDemo || vehicle?.isDemo ? t.common.demoBadgeTitle : t.directions.permissionNote}
        </p>
      </div>
    </form>
  );
}

export default InquiryForm;
