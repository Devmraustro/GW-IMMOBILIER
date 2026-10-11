import { describe, expect, it } from 'vitest';
import {
  prepareNewRecord,
  validateNewRecord,
} from '@/lib/server/record-validation';

const validInquiry = {
  type: 'property',
  status: 'new',
  channel: 'form',
  fullName: 'Test Customer',
  phone: '0555123456',
  email: 'customer@example.com',
  message: 'Please send more details about this listing.',
  propertyId: 'p-live-123',
  startDate: '2026-10-20',
  endDate: '2026-10-24',
};

describe('public inquiry validation', () => {
  it('accepts a valid inquiry with a complete date range', () => {
    expect(validateNewRecord('inquiries', validInquiry)).toEqual({
      ok: true,
      value: validInquiry,
    });
  });

  it('accepts a general contact request without listing or dates', () => {
    expect(validateNewRecord('inquiries', {
      type: 'general',
      status: 'new',
      channel: 'form',
      fullName: 'Test Customer',
      phone: '0555123456',
      message: 'I would like to contact the agency.',
    }).ok).toBe(true);
  });

  it('rejects invalid type, status, or channel values', () => {
    expect(validateNewRecord('inquiries', { ...validInquiry, type: 'admin' }))
      .toEqual({ ok: false, error: 'INVALID_INQUIRY_RECORD' });
    expect(validateNewRecord('inquiries', { ...validInquiry, status: 'paid' }))
      .toEqual({ ok: false, error: 'INVALID_INQUIRY_RECORD' });
    expect(validateNewRecord('inquiries', { ...validInquiry, channel: 'webhook' }))
      .toEqual({ ok: false, error: 'INVALID_INQUIRY_RECORD' });
  });

  it('rejects an incomplete, reversed, or malformed date range', () => {
    expect(validateNewRecord('inquiries', { ...validInquiry, endDate: undefined }))
      .toEqual({ ok: false, error: 'INVALID_INQUIRY_RECORD' });
    expect(validateNewRecord('inquiries', {
      ...validInquiry,
      startDate: '2026-10-25',
      endDate: '2026-10-24',
    })).toEqual({ ok: false, error: 'INVALID_INQUIRY_RECORD' });
    expect(validateNewRecord('inquiries', {
      ...validInquiry,
      startDate: '2026-02-31',
      endDate: '2026-03-04',
    })).toEqual({ ok: false, error: 'INVALID_INQUIRY_RECORD' });
  });

  it('rejects unsupported client fields and server-owned metadata', () => {
    expect(validateNewRecord('inquiries', {
      ...validInquiry,
      isAdmin: true,
    })).toEqual({ ok: false, error: 'RECORD_CONTAINS_UNSUPPORTED_FIELDS' });
    expect(validateNewRecord('inquiries', {
      ...validInquiry,
      id: 'forged-id',
    })).toEqual({ ok: false, error: 'RECORD_CONTAINS_UNSUPPORTED_FIELDS' });
  });

  it('assigns server-controlled identifiers and timestamps', () => {
    const validation = validateNewRecord('inquiries', validInquiry);
    expect(validation.ok).toBe(true);
    if (!validation.ok) throw new Error('Expected valid inquiry input');

    const created = prepareNewRecord('inquiries', validation.value, new Date('2026-10-11T02:00:00.000Z'));
    expect(created.id).toMatch(/^i-[0-9a-f-]+$/i);
    expect(created.createdAt).toBe('2026-10-11T02:00:00.000Z');
  });
});
