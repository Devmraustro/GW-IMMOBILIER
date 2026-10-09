'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { CONTACT_EMAIL, IS_PLACEHOLDER_CONTACT, PHONE_NUMBER, WHATSAPP_NUMBER } from '@/lib/config';
import { normalizePhone, validateContactForm, type FieldErrors } from '@/lib/validation';
import { buildGeneralMessage, whatsappUrl } from '@/lib/whatsapp';
import { AREAS } from '@/data/areas';
import { Button } from '@/components/ui/button';
import { Input, Textarea, FieldError } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Reveal from '@/components/shared/reveal';

export function ContactContent() {
  const { t, pick } = useI18n();
  const { addInquiry } = useDemoStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preference, setPreference] = useState<'phone' | 'whatsapp' | 'email'>('phone');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = validateContactForm(
      { fullName, phone, email, subject, message, preference },
      t,
    );
    setErrors(result.errors);
    if (!result.valid) {
      toast.error(t.contact.errorTitle);
      return;
    }

    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    addInquiry({
      type: 'general',
      status: 'new',
      channel: 'form',
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      message: `${subject.trim()} — ${message.trim()} (préférence: ${preference})`,
    });
    setSending(false);
    setSent(true);
    toast.success(t.contact.successTitle, { description: t.contact.successText });
  };

  const openWhatsApp = () => {
    const result = validateContactForm({ fullName, phone, email, subject, message, preference }, t);
    setErrors(result.errors);
    if (!result.valid) {
      toast.error(t.contact.errorTitle);
      return;
    }
    window.open(
      whatsappUrl(buildGeneralMessage(subject.trim(), { locale: 'fr', t, fullName, phone, message })),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const reset = () => {
    setSent(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setSubject('');
    setMessage('');
    setErrors({});
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="eyebrow">{t.nav.contact}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{t.contact.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">{t.contact.subtitle}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        {/* Form */}
        <Reveal className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto size-11 text-success" aria-hidden />
              <h2 className="mt-4 font-display text-2xl font-semibold">{t.contact.successTitle}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                {t.contact.successText}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={reset}>
                  {t.contact.sendAnother}
                </Button>
                <Button onClick={openWhatsApp} variant="whatsapp">
                  <MessageCircle aria-hidden />
                  {t.contact.whatsappCta}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 className="font-display text-xl font-semibold">{t.contact.formTitle}</h2>

              <div className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="c-name">
                      {t.contact.name} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="c-name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder={t.contact.namePlaceholder}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.fullName)}
                      className="mt-1.5"
                    />
                    <FieldError>{errors.fullName}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="c-phone">
                      {t.contact.phone} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="c-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder={t.contact.phonePlaceholder}
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.phone)}
                      className="mt-1.5"
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </div>
                </div>

                <div>
                  <Label htmlFor="c-email">
                    {t.contact.email}{' '}
                    <span className="text-xs font-normal text-ink-400">({t.common.optional})</span>
                  </Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t.contact.emailPlaceholder}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    className="mt-1.5"
                  />
                  <FieldError>{errors.email}</FieldError>
                </div>

                <div>
                  <Label htmlFor="c-subject">
                    {t.contact.subject} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="c-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder={t.contact.subjectPlaceholder}
                    aria-invalid={Boolean(errors.subject)}
                    className="mt-1.5"
                  />
                  <FieldError>{errors.subject}</FieldError>
                </div>

                <div>
                  <Label htmlFor="c-preference">{t.contact.contactPreference}</Label>
                  <Select
                    value={preference}
                    onValueChange={(value) => setPreference(value as typeof preference)}
                  >
                    <SelectTrigger id="c-preference" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">{t.contact.preferencePhone}</SelectItem>
                      <SelectItem value="whatsapp">{t.contact.preferenceWhatsapp}</SelectItem>
                      <SelectItem value="email">{t.contact.preferenceEmail}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="c-message">
                    {t.contact.message} <span className="text-danger">*</span>
                  </Label>
                  <Textarea
                    id="c-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t.contact.messagePlaceholder}
                    aria-invalid={Boolean(errors.message)}
                    className="mt-1.5"
                  />
                  <FieldError>{errors.message}</FieldError>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" size="lg" loading={sending} className="flex-1">
                    {!sending ? <Send aria-hidden /> : null}
                    {t.contact.submit}
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="whatsapp"
                    onClick={openWhatsApp}
                    className="flex-1"
                  >
                    <MessageCircle aria-hidden />
                    {t.home.whatsappCta}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Reveal>

        {/* Contact details */}
        <aside className="space-y-4">
          {IS_PLACEHOLDER_CONTACT ? (
            <p className="rounded-xl border border-dashed border-warning/50 bg-warning-soft px-4 py-3 text-xs leading-relaxed text-warning">
              {t.common.placeholderContact}
            </p>
          ) : null}

          <ContactCard
            icon={<Phone className="size-5" aria-hidden />}
            title={t.contact.callTitle}
            value={PHONE_NUMBER}
            href={`tel:${normalizePhone(PHONE_NUMBER)}`}
            cta={t.contact.callCta}
            note={t.contact.callText}
          />
          <ContactCard
            icon={<MessageCircle className="size-5" aria-hidden />}
            title={t.contact.whatsappTitle}
            value={`+${WHATSAPP_NUMBER}`}
            href={whatsappUrl(
              buildGeneralMessage(
                'Bonjour GW Immobilier, je souhaite obtenir des informations.',
                { locale: 'fr', t },
              ),
            )}
            cta={t.contact.whatsappCta}
            note={t.contact.whatsappText}
            external
          />
          <ContactCard
            icon={<Mail className="size-5" aria-hidden />}
            title={t.contact.emailTitle}
            value={CONTACT_EMAIL}
            href={`mailto:${CONTACT_EMAIL}`}
            cta={t.contact.emailTitle}
            note={t.contact.emailText}
          />
          <ContactCard
            icon={<MapPin className="size-5" aria-hidden />}
            title={t.contact.addressTitle}
            value={t.contact.addressPlaceholder}
            note={AREAS.map((area) => pick(area.name)).join(' · ')}
            muted
          />
          <ContactCard
            icon={<Clock className="size-5" aria-hidden />}
            title={t.contact.hoursTitle}
            value={t.contact.hours}
            muted
          />
        </aside>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  cta,
  note,
  external,
  muted,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
  cta?: string;
  note?: string;
  external?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-start gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-gold-400">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          <p className="mt-1 break-words text-sm text-ink-600">{value}</p>
          {note ? <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{note}</p> : null}
          {href && cta ? (
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 hover:underline"
            >
              {cta}
            </a>
          ) : null}
          {muted ? (
            <span className="mt-2 inline-block rounded-full bg-sand-100 px-2.5 py-1 text-[11px] text-ink-500">
              {note ? '' : '—'}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ContactContent;
