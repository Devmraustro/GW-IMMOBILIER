'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Property, Reservation, ReservationStatus, Vehicle } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import {
  findConflicts,
  hasConflict,
  nights,
  paymentStatus,
  remainingBalance,
  reservationStatusFor,
  reservationsByDate,
} from '@/lib/availability';
import { formatCurrency, formatDate, todayISO } from '@/lib/format';
import { validatePositiveNumber } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, FieldError } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_KEYS: ReservationStatus[] = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const STATUS_VARIANT = {
  upcoming: 'info',
  ongoing: 'gold',
  completed: 'success',
  cancelled: 'danger',
} as const;

type Draft = {
  id?: string;
  kind: 'property' | 'vehicle';
  itemId: string;
  customerName: string;
  phone: string;
  startDate: string;
  endDate: string;
  amount: string;
  deposit: string;
  status: ReservationStatus;
  notes: string;
};

const WEEKDAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const WEEKDAYS_AR = ['إث', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'];

export function ReservationManager() {
  const { t, pick, locale } = useI18n();
  const {
    reservations,
    properties,
    vehicles,
    addReservation,
    updateReservation,
    deleteReservation,
  } = useDemoStore();

  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft>({
    kind: 'property',
    itemId: '',
    customerName: '',
    phone: '',
    startDate: '',
    endDate: '',
    amount: '',
    deposit: '0',
    status: 'upcoming',
    notes: '',
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const items = draft.kind === 'property' ? properties : vehicles;

  const byDate = useMemo(
    () => reservationsByDate(reservations, cursor.year, cursor.month),
    [reservations, cursor],
  );

  const firstDay = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // Monday-first grid

  const monthLabel = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(firstDay);

  const openCreate = (date?: string) => {
    setDraft({
      kind: 'property',
      itemId: properties[0]?.id ?? '',
      customerName: '',
      phone: '',
      startDate: date ?? '',
      endDate: '',
      amount: '',
      deposit: '0',
      status: 'upcoming',
      notes: '',
    });
    setEditing(false);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (reservation: Reservation) => {
    setDraft({
      id: reservation.id,
      kind: reservation.kind,
      itemId: reservation.itemId,
      customerName: reservation.customerName,
      phone: reservation.phone,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      amount: String(reservation.amount),
      deposit: String(reservation.deposit),
      status: reservation.status,
      notes: reservation.notes ?? '',
    });
    setEditing(true);
    setErrors({});
    setOpen(true);
  };

  const save = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.itemId) nextErrors.itemId = t.admin.requiredField;
    if (!draft.customerName.trim()) nextErrors.customerName = t.admin.requiredField;
    if (!draft.startDate) nextErrors.startDate = t.admin.requiredField;
    if (!draft.endDate) nextErrors.endDate = t.admin.requiredField;
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate)
      nextErrors.endDate = t.validation.dateOrder;
    if (!validatePositiveNumber(draft.amount)) nextErrors.amount = t.admin.invalidNumber;
    if (!validatePositiveNumber(draft.deposit)) nextErrors.deposit = t.admin.invalidNumber;

    if (
      draft.startDate &&
      draft.endDate &&
      draft.itemId &&
      hasConflict(reservations, draft.itemId, draft.startDate, draft.endDate, draft.id)
    ) {
      nextErrors.startDate = t.admin.conflictText;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t.admin.conflictTitle);
      return;
    }

    const item =
      draft.kind === 'property'
        ? properties.find((item) => item.id === draft.itemId)
        : vehicles.find((item) => item.id === draft.itemId);

    const payload = {
      kind: draft.kind,
      itemId: draft.itemId,
      itemReference:
        draft.kind === 'property'
          ? (properties.find((i) => i.id === draft.itemId)?.reference ?? '—')
          : (vehicles.find((i) => i.id === draft.itemId)?.reference ?? '—'),
      itemTitle:
        draft.kind === 'property'
          ? (properties.find((i) => i.id === draft.itemId)?.title ?? { fr: '—', ar: '—' })
          : {
              fr:
                vehicles.find((i) => i.id === draft.itemId)?.brand +
                ' ' +
                vehicles.find((i) => i.id === draft.itemId)?.model,
              ar:
                vehicles.find((i) => i.id === draft.itemId)?.brand +
                ' ' +
                vehicles.find((i) => i.id === draft.itemId)?.model,
            },
      customerName: draft.customerName.trim(),
      phone: draft.phone.trim(),
      startDate: draft.startDate,
      endDate: draft.endDate,
      amount: Number(draft.amount),
      deposit: Number(draft.deposit),
      status: draft.status,
      notes: draft.notes.trim() || undefined,
    };

    if (editing && draft.id) {
      updateReservation(draft.id, payload);
      toast.success(t.admin.saved);
    } else {
      addReservation(payload);
      toast.success(t.admin.created);
    }
    setOpen(false);
    void item;
  };

  const sorted = [...reservations].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const conflicts = draft.itemId
    ? findConflicts(reservations, draft.itemId, draft.startDate, draft.endDate, draft.id)
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t.admin.reservations}</h1>
          <p className="mt-1.5 text-sm text-ink-500">{t.admin.reservationsIntro}</p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus aria-hidden />
          {t.admin.addReservation}
        </Button>
      </header>

      {/* Calendar */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() =>
              setCursor((prev) =>
                prev.month === 0
                  ? { year: prev.year - 1, month: 11 }
                  : { year: prev.year, month: prev.month - 1 },
              )
            }
            aria-label={t.common.previous}
          >
            <ChevronLeft className={cn('size-4', locale === 'ar' && 'rotate-180')} aria-hidden />
          </Button>
          <h2 className="font-display text-lg font-semibold capitalize">{monthLabel}</h2>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() =>
              setCursor((prev) =>
                prev.month === 11
                  ? { year: prev.year + 1, month: 0 }
                  : { year: prev.year, month: prev.month + 1 },
              )
            }
            aria-label={t.common.next}
          >
            <ChevronRight className={cn('size-4', locale === 'ar' && 'rotate-180')} aria-hidden />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-ink-400">
          {(locale === 'ar' ? WEEKDAYS_AR : WEEKDAYS_FR).map((day) => (
            <div key={day} className="py-1.5">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, index) => (
            <div key={`blank-${index}`} className="h-16 rounded-lg" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayReservations = byDate.get(key) ?? [];
            const isToday = key === today;
            const isSelected = key === selectedDate;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDate(key);
                  openCreate(key);
                }}
                className={cn(
                  'flex h-16 flex-col items-start gap-1 rounded-lg border p-1.5 text-start transition-colors',
                  isToday ? 'border-gold-400 bg-gold-50' : 'border-transparent hover:bg-sand-50',
                  isSelected && 'ring-1 ring-gold-400',
                )}
              >
                <span className={cn('text-xs font-semibold tabular-nums', isToday ? 'text-gold-700' : 'text-ink-600')}>
                  {day}
                </span>
                <span className="flex w-full flex-wrap gap-0.5">
                  {dayReservations.slice(0, 2).map((reservation) => (
                    <span
                      key={reservation.id}
                      title={pick(reservation.itemTitle)}
                      className={cn(
                        'h-1.5 w-full rounded-full',
                        reservation.kind === 'property' ? 'bg-ink-900' : 'bg-gold-400',
                      )}
                    />
                  ))}
                  {dayReservations.length > 2 ? (
                    <span className="text-[9px] text-ink-400">+{dayReservations.length - 2}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-4 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-ink-900" />
            {t.admin.properties}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-gold-400" />
            {t.admin.vehicles}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5 text-gold-600" aria-hidden />
            {t.admin.reservationsIntro}
          </span>
        </div>
      </section>

      {/* List */}
      <section className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-ink-100 bg-sand-50 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldItem}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldCustomer}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldStartDate}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldAmount}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldPaymentStatus}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.common.status}</th>
                <th className="px-4 py-3 text-end font-semibold">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {sorted.map((reservation) => {
                const derived = reservationStatusFor(reservation, today);
                const status = reservation.status === 'cancelled' ? 'cancelled' : derived;
                const payment = paymentStatus(reservation);
                return (
                  <tr key={reservation.id} className="transition-colors hover:bg-sand-50">
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-ink-900">
                        {pick(reservation.itemTitle)}
                      </p>
                      <p className="font-mono text-[11px] text-ink-400">
                        {reservation.itemReference} · {nights(reservation)} {t.common.nights}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink-800">{reservation.customerName}</p>
                      <p className="text-[11px] text-ink-400">{reservation.phone}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-600">
                      {formatDate(reservation.startDate, locale)}
                      <p className="text-[11px] text-ink-400">
                        → {formatDate(reservation.endDate, locale)}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatCurrency(reservation.amount)}
                      <p className="text-[11px] font-normal text-ink-400">
                        {t.admin.monthBalance} {formatCurrency(remainingBalance(reservation))}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          payment === 'paid' ? 'success' : payment === 'partial' ? 'warning' : 'danger'
                        }
                      >
                        {t.admin[payment]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[status]}>{t.admin[status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => openEdit(reservation)}
                          title={t.common.edit}
                        >
                          <Pencil aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          className="text-danger hover:bg-danger-soft"
                          onClick={() => setDeleteId(reservation.id)}
                          title={t.common.delete}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-ink-400">{t.admin.noResults}</p>
        ) : null}
      </section>

      {/* Create / edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.editReservation : t.admin.addReservation}
            </DialogTitle>
            <DialogDescription>{t.admin.demoBanner}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rm-kind">{t.admin.fieldItem}</Label>
                <Select
                  value={draft.kind}
                  onValueChange={(value) => {
                    const kind = value as Draft['kind'];
                    const nextItems = kind === 'property' ? properties : vehicles;
                    setDraft((prev) => ({ ...prev, kind, itemId: nextItems[0]?.id ?? '' }));
                  }}
                >
                  <SelectTrigger id="rm-kind" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">{t.admin.properties}</SelectItem>
                    <SelectItem value="vehicle">{t.admin.vehicles}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rm-item">{t.common.reference}</Label>
                <Select value={draft.itemId} onValueChange={(value) => set('itemId', value)}>
                  <SelectTrigger id="rm-item" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {draft.kind === 'property'
                          ? `${item.reference} — ${pick((item as Property).title)}`
                          : `${item.reference} — ${(item as Vehicle).brand} ${(item as Vehicle).model}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{errors.itemId}</FieldError>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rm-customer">
                  {t.admin.fieldCustomer} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="rm-customer"
                  value={draft.customerName}
                  onChange={(event) => set('customerName', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.customerName}</FieldError>
              </div>
              <div>
                <Label htmlFor="rm-phone">{t.admin.fieldCustomerPhone}</Label>
                <Input
                  id="rm-phone"
                  value={draft.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rm-start">
                  {t.admin.fieldStartDate} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="rm-start"
                  type="date"
                  value={draft.startDate}
                  onChange={(event) => set('startDate', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.startDate}</FieldError>
              </div>
              <div>
                <Label htmlFor="rm-end">
                  {t.admin.fieldEndDate} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="rm-end"
                  type="date"
                  value={draft.endDate}
                  onChange={(event) => set('endDate', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.endDate}</FieldError>
              </div>
            </div>

            {draft.startDate && draft.endDate && draft.endDate > draft.startDate ? (
              <p className="rounded-xl bg-sand-50 px-3.5 py-2.5 text-xs text-ink-600">
                {nights({ startDate: draft.startDate, endDate: draft.endDate })} {t.common.nights}
                {conflicts.length > 0 ? (
                  <span className="ms-2 font-semibold text-danger">
                    {conflicts.length} × {t.admin.conflictTitle}
                  </span>
                ) : null}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="rm-amount">
                  {t.admin.fieldAmount} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="rm-amount"
                  type="number"
                  value={draft.amount}
                  onChange={(event) => set('amount', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.amount}</FieldError>
              </div>
              <div>
                <Label htmlFor="rm-deposit">{t.admin.fieldDeposit}</Label>
                <Input
                  id="rm-deposit"
                  type="number"
                  value={draft.deposit}
                  onChange={(event) => set('deposit', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.deposit}</FieldError>
              </div>
              <div>
                <Label htmlFor="rm-status">{t.common.status}</Label>
                <Select
                  value={draft.status}
                  onValueChange={(value) => set('status', value as ReservationStatus)}
                >
                  <SelectTrigger id="rm-status" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_KEYS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t.admin[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="rm-notes">{t.admin.fieldNotes}</Label>
              <Input
                id="rm-notes"
                value={draft.notes}
                onChange={(event) => set('notes', event.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={save}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.confirmDelete}</DialogTitle>
            <DialogDescription>{t.admin.deleteWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) deleteReservation(deleteId);
                setDeleteId(null);
                toast.success(t.admin.deleted);
              }}
            >
              {t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReservationManager;
