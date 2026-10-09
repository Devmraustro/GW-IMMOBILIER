import type { Locale } from '@/types';
import type { Dictionary } from '@/lib/i18n';

export interface FieldErrors {
  [field: string]: string | undefined;
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: FieldErrors;
  data?: T;
}

/**
 * Algerian numbers: mobile prefixes 05/06/07, landlines 02x..04x, written with
 * a leading 0, +213 or 00213. Everything is normalised to `213XXXXXXXXX`.
 */
const ALGERIAN_PHONE = /^213[2-9]\d{8}$/;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Strip every non-digit and convert to the international `213…` form. */
function toInternationalDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00213')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = `213${digits.slice(1)}`;
  return digits;
}

export function isValidPhone(value: string): boolean {
  return ALGERIAN_PHONE.test(toInternationalDigits(value));
}

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

/** Keep the user's input but make it clickable in tel: / wa.me links. */
export function normalizePhone(phone: string): string {
  return toInternationalDigits(phone);
}

export interface InquiryFormInput {
  fullName: string;
  phone: string;
  email?: string;
  message: string;
  startDate?: string;
  endDate?: string;
}

export function validateInquiryForm(
  input: InquiryFormInput,
  t: Dictionary,
  options: { requireDates?: boolean; locale?: Locale } = {},
): ValidationResult<InquiryFormInput> {
  const errors: FieldErrors = {};
  const v = t.validation;

  if (!input.fullName.trim()) errors.fullName = v.nameRequired;
  else if (input.fullName.trim().length < 2) errors.fullName = v.nameTooShort;

  if (!input.phone.trim()) errors.phone = v.phoneRequired;
  else if (!isValidPhone(input.phone)) errors.phone = v.phoneInvalid;

  if (input.email && input.email.trim() && !isValidEmail(input.email))
    errors.email = v.emailInvalid;

  if (!input.message.trim()) errors.message = v.messageRequired;
  else if (input.message.trim().length < 10) errors.message = v.messageTooShort;

  if (options.requireDates) {
    if (!input.startDate || !input.endDate) {
      errors.startDate = v.datesRequired;
      errors.endDate = v.datesRequired;
    } else {
      if (input.startDate < todayLocalISO()) errors.startDate = v.datePast;
      if (input.endDate <= input.startDate) errors.endDate = v.dateOrder;
    }
  } else if (input.startDate && input.endDate && input.endDate <= input.startDate) {
    errors.endDate = v.dateOrder;
  }

  return {
    valid: Object.values(errors).every((e) => !e),
    errors,
    data: Object.values(errors).every((e) => !e) ? input : undefined,
  };
}

export interface ContactFormInput {
  fullName: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  preference: 'phone' | 'whatsapp' | 'email';
}

export function validateContactForm(
  input: ContactFormInput,
  t: Dictionary,
): ValidationResult<ContactFormInput> {
  const errors: FieldErrors = {};
  const v = t.validation;

  if (!input.fullName.trim()) errors.fullName = v.nameRequired;
  else if (input.fullName.trim().length < 2) errors.fullName = v.nameTooShort;

  if (!input.phone.trim()) errors.phone = v.phoneRequired;
  else if (!isValidPhone(input.phone)) errors.phone = v.phoneInvalid;

  if (input.preference === 'email') {
    if (!input.email?.trim()) errors.email = v.emailInvalid;
    else if (!isValidEmail(input.email)) errors.email = v.emailInvalid;
  } else if (input.email && input.email.trim() && !isValidEmail(input.email)) {
    errors.email = v.emailInvalid;
  }

  if (!input.subject.trim()) errors.subject = v.subjectRequired;

  if (!input.message.trim()) errors.message = v.messageRequired;
  else if (input.message.trim().length < 10) errors.message = v.messageTooShort;

  const valid = Object.values(errors).every((e) => !e);
  return { valid, errors, data: valid ? input : undefined };
}

export function todayLocalISO(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Property / vehicle form validation used by the demo dashboard. */
export function validatePositiveNumber(value: string): boolean {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

export function validateCoordinates(lat: string, lng: string): boolean {
  const la = Number(lat);
  const lo = Number(lng);
  return Number.isFinite(la) && Number.isFinite(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
}
