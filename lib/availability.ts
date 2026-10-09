import type { Reservation } from '@/types';

/**
 * Reservation availability logic.
 *
 * Ranges are treated as **half-open**: [start, end). A reservation ending on
 * the 10th and another starting on the 10th do NOT conflict — a checkout on the
 * morning of the 10th frees the listing for the evening of the 10th.
 *
 * This is real logic, unit-tested in `tests/availability.test.ts`. The demo
 * dashboard uses it to block double-bookings; the public reservation widget
 * creates inquiries only (never a confirmed booking) because no payment or
 * contract step exists yet.
 */

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart < bEnd && bStart < aEnd;
}

export function findConflicts(
  reservations: Reservation[],
  itemId: string,
  start: string,
  end: string,
  ignoreId?: string,
): Reservation[] {
  return reservations.filter(
    (r) =>
      r.itemId === itemId &&
      r.id !== ignoreId &&
      r.status !== 'cancelled' &&
      rangesOverlap(start, end, r.startDate, r.endDate),
  );
}

export function hasConflict(
  reservations: Reservation[],
  itemId: string,
  start: string,
  end: string,
  ignoreId?: string,
): boolean {
  return findConflicts(reservations, itemId, start, end, ignoreId).length > 0;
}

/** Pseudo-status derived from the calendar — used by the reservations board. */
export function reservationStatusFor(
  reservation: Pick<Reservation, 'startDate' | 'endDate'>,
  today: string,
): 'upcoming' | 'ongoing' | 'completed' {
  if (reservation.startDate > today) return 'upcoming';
  if (reservation.endDate > today) return 'ongoing';
  return 'completed';
}

export function remainingBalance(reservation: Pick<Reservation, 'amount' | 'deposit'>): number {
  return Math.max(0, reservation.amount - reservation.deposit);
}

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export function paymentStatus(
  reservation: Pick<Reservation, 'amount' | 'deposit'>,
): PaymentStatus {
  if (reservation.deposit <= 0) return 'unpaid';
  if (reservation.deposit >= reservation.amount) return 'paid';
  return 'partial';
}

/** Number of nights occupied by a reservation. */
export function nights(reservation: Pick<Reservation, 'startDate' | 'endDate'>): number {
  const a = new Date(`${reservation.startDate}T00:00:00`).getTime();
  const b = new Date(`${reservation.endDate}T00:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** Simple day-cell map used by the demo calendar grid. */
export function reservationsByDate(
  reservations: Reservation[],
  year: number,
  month: number,
): Map<string, Reservation[]> {
  const map = new Map<string, Reservation[]>();
  const last = new Date(year, month + 1, 0).getDate();
  for (const reservation of reservations) {
    if (reservation.status === 'cancelled') continue;
    const start = new Date(`${reservation.startDate}T00:00:00`);
    const end = new Date(`${reservation.endDate}T00:00:00`);
    for (let day = 1; day <= last; day += 1) {
      const current = new Date(year, month, day);
      const cursor = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      // [start, end) — the end date is free again.
      if (cursor >= start && cursor < end) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const bucket = map.get(key);
        if (bucket) bucket.push(reservation);
        else map.set(key, [reservation]);
      }
    }
  }
  return map;
}
