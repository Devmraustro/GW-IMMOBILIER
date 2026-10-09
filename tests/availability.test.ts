import { describe, expect, it } from 'vitest';
import {
  findConflicts,
  hasConflict,
  nights,
  paymentStatus,
  rangesOverlap,
  remainingBalance,
  reservationStatusFor,
  reservationsByDate,
} from '@/lib/availability';
import type { Reservation } from '@/types';

const reservation = (patch: Partial<Reservation> & Pick<Reservation, 'id' | 'startDate' | 'endDate'>): Reservation => ({
  kind: 'property',
  itemId: 'p-001',
  itemReference: 'REF',
  itemTitle: { fr: 'Bien', ar: 'عقار' },
  customerName: 'Client',
  phone: '0555 00 00 00',
  amount: 100_000,
  deposit: 0,
  status: 'upcoming',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...patch,
});

describe('rangesOverlap', () => {
  it('detects overlapping ranges', () => {
    expect(rangesOverlap('2026-08-01', '2026-08-10', '2026-08-05', '2026-08-08')).toBe(true);
    expect(rangesOverlap('2026-08-01', '2026-08-10', '2026-08-09', '2026-08-20')).toBe(true);
    expect(rangesOverlap('2026-08-05', '2026-08-08', '2026-08-01', '2026-08-10')).toBe(true);
  });

  it('treats ranges as half-open so back-to-back stays free', () => {
    // Checkout on the 10th, check-in on the 10th → no conflict.
    expect(rangesOverlap('2026-08-01', '2026-08-10', '2026-08-10', '2026-08-15')).toBe(false);
    expect(rangesOverlap('2026-08-10', '2026-08-15', '2026-08-01', '2026-08-10')).toBe(false);
  });

  it('detects disjoint ranges', () => {
    expect(rangesOverlap('2026-08-01', '2026-08-05', '2026-09-01', '2026-09-05')).toBe(false);
  });

  it('is safe with empty input', () => {
    expect(rangesOverlap('', '2026-08-10', '2026-08-01', '2026-08-05')).toBe(false);
  });
});

describe('hasConflict / findConflicts', () => {
  const existing = reservation({ id: 'r-1', startDate: '2026-08-01', endDate: '2026-08-10' });

  it('blocks a booking that overlaps', () => {
    expect(hasConflict([existing], 'p-001', '2026-08-05', '2026-08-08')).toBe(true);
    expect(findConflicts([existing], 'p-001', '2026-08-05', '2026-08-08')).toHaveLength(1);
  });

  it('allows a booking that starts exactly when another ends', () => {
    expect(hasConflict([existing], 'p-001', '2026-08-10', '2026-08-15')).toBe(false);
  });

  it('ignores conflicts on a different item', () => {
    expect(hasConflict([existing], 'p-999', '2026-08-05', '2026-08-08')).toBe(false);
  });

  it('ignores cancelled reservations', () => {
    const cancelled = { ...existing, status: 'cancelled' as const };
    expect(hasConflict([cancelled], 'p-001', '2026-08-05', '2026-08-08')).toBe(false);
  });

  it('ignores the reservation being edited', () => {
    expect(hasConflict([existing], 'p-001', '2026-08-05', '2026-08-08', 'r-1')).toBe(false);
  });
});

describe('reservationStatusFor', () => {
  it('derives upcoming / ongoing / completed', () => {
    expect(reservationStatusFor({ startDate: '2026-08-01', endDate: '2026-08-10' }, '2026-07-01')).toBe('upcoming');
    expect(reservationStatusFor({ startDate: '2026-08-01', endDate: '2026-08-10' }, '2026-08-05')).toBe('ongoing');
    expect(reservationStatusFor({ startDate: '2026-08-01', endDate: '2026-08-10' }, '2026-08-10')).toBe('completed');
  });
});

describe('money helpers', () => {
  it('computes the remaining balance', () => {
    expect(remainingBalance({ amount: 100_000, deposit: 40_000 })).toBe(60_000);
    expect(remainingBalance({ amount: 100_000, deposit: 150_000 })).toBe(0);
  });

  it('computes the payment status', () => {
    expect(paymentStatus({ amount: 100_000, deposit: 0 })).toBe('unpaid');
    expect(paymentStatus({ amount: 100_000, deposit: 40_000 })).toBe('partial');
    expect(paymentStatus({ amount: 100_000, deposit: 100_000 })).toBe('paid');
    expect(paymentStatus({ amount: 100_000, deposit: 120_000 })).toBe('paid');
  });

  it('counts nights', () => {
    expect(nights({ startDate: '2026-08-01', endDate: '2026-08-08' })).toBe(7);
    expect(nights({ startDate: '2026-08-01', endDate: '2026-08-01' })).toBe(0);
  });
});

describe('reservationsByDate', () => {
  it('maps every day of a stay, excluding the checkout day', () => {
    const map = reservationsByDate(
      [reservation({ id: 'r-1', startDate: '2026-08-01', endDate: '2026-08-04' })],
      2026,
      7, // month index 7 = August
    );
    expect(map.get('2026-08-01')).toHaveLength(1);
    expect(map.get('2026-08-03')).toHaveLength(1);
    expect(map.get('2026-08-04')).toBeUndefined();
    expect(map.get('2026-08-05')).toBeUndefined();
  });

  it('skips cancelled reservations', () => {
    const map = reservationsByDate(
      [reservation({ id: 'r-2', startDate: '2026-08-01', endDate: '2026-08-04', status: 'cancelled' })],
      2026,
      7,
    );
    expect(map.size).toBe(0);
  });

  it('groups two reservations on the same day', () => {
    const map = reservationsByDate(
      [
        reservation({ id: 'a', startDate: '2026-08-01', endDate: '2026-08-05' }),
        reservation({ id: 'b', startDate: '2026-08-03', endDate: '2026-08-07' }),
      ],
      2026,
      7,
    );
    expect(map.get('2026-08-03')).toHaveLength(2);
  });
});
