import { describe, expect, it } from 'vitest';
import { fr } from '@/lib/i18n/dictionaries/fr';
import {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  todayLocalISO,
  validateContactForm,
  validateInquiryForm,
  validateCoordinates,
} from '@/lib/validation';

const t = fr;

const validInquiry = {
  fullName: 'Karim Benali',
  phone: '0555 12 34 56',
  email: 'karim@example.dz',
  message: 'Bonjour, je souhaite visiter ce bien la semaine prochaine.',
};

describe('isValidPhone', () => {
  it('accepts Algerian mobile formats', () => {
    ['0555123456', '05 55 12 34 56', '+213555123456', '00213555123456', '0662 90 11 22', '0799 45 67 89'].forEach(
      (value) => expect(isValidPhone(value), value).toBe(true),
    );
  });

  it('rejects invalid numbers', () => {
    ['123', '', 'abcdefghij', '+33 6 12 34 56 78', '0555123'].forEach((value) =>
      expect(isValidPhone(value), value).toBe(false),
    );
  });
});

describe('normalizePhone', () => {
  it('converts to the international form without the plus sign', () => {
    expect(normalizePhone('0555 12 34 56')).toBe('213555123456');
    expect(normalizePhone('+213 555 12 34 56')).toBe('213555123456');
    expect(normalizePhone('00213 555 12 34 56')).toBe('213555123456');
    expect(normalizePhone('213555123456')).toBe('213555123456');
  });
});

describe('isValidEmail', () => {
  it('accepts well-formed addresses and rejects malformed ones', () => {
    expect(isValidEmail('karim@example.dz')).toBe(true);
    expect(isValidEmail('karim@example')).toBe(false);
    expect(isValidEmail('karim example@example.dz')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('validateInquiryForm', () => {
  it('accepts a complete request', () => {
    const result = validateInquiryForm(validInquiry, t);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('requires a name of at least 2 characters', () => {
    expect(validateInquiryForm({ ...validInquiry, fullName: '' }, t).errors.fullName).toBe(
      t.validation.nameRequired,
    );
    expect(validateInquiryForm({ ...validInquiry, fullName: 'K' }, t).errors.fullName).toBe(
      t.validation.nameTooShort,
    );
  });

  it('requires a valid phone number', () => {
    expect(validateInquiryForm({ ...validInquiry, phone: '' }, t).errors.phone).toBe(
      t.validation.phoneRequired,
    );
    expect(validateInquiryForm({ ...validInquiry, phone: '12345' }, t).errors.phone).toBe(
      t.validation.phoneInvalid,
    );
  });

  it('requires a message of at least 10 characters', () => {
    expect(validateInquiryForm({ ...validInquiry, message: '' }, t).errors.message).toBe(
      t.validation.messageRequired,
    );
    expect(validateInquiryForm({ ...validInquiry, message: 'court' }, t).errors.message).toBe(
      t.validation.messageTooShort,
    );
  });

  it('validates the optional e-mail only when provided', () => {
    expect(validateInquiryForm({ ...validInquiry, email: '' }, t).valid).toBe(true);
    expect(validateInquiryForm({ ...validInquiry, email: 'nope' }, t).errors.email).toBe(
      t.validation.emailInvalid,
    );
  });

  it('validates dates when they are required', () => {
    const missing = validateInquiryForm(validInquiry, t, { requireDates: true });
    expect(missing.valid).toBe(false);
    expect(missing.errors.startDate).toBe(t.validation.datesRequired);

    const future = `${Number(todayLocalISO().slice(0, 4)) + 1}-01-10`;
    const badOrder = validateInquiryForm(
      { ...validInquiry, startDate: future, endDate: `${Number(todayLocalISO().slice(0, 4)) + 1}-01-05` },
      t,
      { requireDates: true },
    );
    expect(badOrder.errors.endDate).toBe(t.validation.dateOrder);

    const past = validateInquiryForm(
      { ...validInquiry, startDate: '2020-01-01', endDate: '2020-01-10' },
      t,
      { requireDates: true },
    );
    expect(past.errors.startDate).toBe(t.validation.datePast);
  });

  it('does not require dates when they are optional', () => {
    expect(validateInquiryForm(validInquiry, t, { requireDates: false }).valid).toBe(true);
  });
});

describe('validateContactForm', () => {
  const base = {
    fullName: 'Karim Benali',
    phone: '0555 12 34 56',
    email: '',
    subject: 'Location F3',
    message: 'Bonjour, je cherche un F3 meublé à Chéraga pour décembre.',
    preference: 'phone' as const,
  };

  it('accepts a complete message', () => {
    expect(validateContactForm(base, t).valid).toBe(true);
  });

  it('requires a subject', () => {
    expect(validateContactForm({ ...base, subject: '' }, t).errors.subject).toBe(
      t.validation.subjectRequired,
    );
  });

  it('requires a valid e-mail when e-mail is the preferred channel', () => {
    expect(
      validateContactForm({ ...base, preference: 'email', email: '' }, t).errors.email,
    ).toBe(t.validation.emailInvalid);
    expect(
      validateContactForm({ ...base, preference: 'email', email: 'karim@example.dz' }, t).valid,
    ).toBe(true);
  });
});

describe('validateCoordinates', () => {
  it('accepts coordinates inside the Algiers bounding box', () => {
    expect(validateCoordinates('36.7538', '3.0588')).toBe(true);
  });

  it('rejects out-of-range or non-numeric coordinates', () => {
    expect(validateCoordinates('91', '3')).toBe(false);
    expect(validateCoordinates('36.7', '181')).toBe(false);
    expect(validateCoordinates('abc', 'def')).toBe(false);
  });
});
