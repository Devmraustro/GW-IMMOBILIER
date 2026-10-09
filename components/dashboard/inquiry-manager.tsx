'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Inbox, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { InquiryStatus, InquiryType } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { formatDate, formatDateTime } from '@/lib/format';
import { normalizePhone } from '@/lib/validation';
import { buildGeneralMessage, buildPropertyMessage, buildVehicleMessage, whatsappUrl } from '@/lib/whatsapp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyState from '@/components/shared/empty-state';

const STATUSES: InquiryStatus[] = ['new', 'contacted', 'confirmed', 'cancelled'];
const TYPES: InquiryType[] = ['property', 'vehicle', 'general'];

const STATUS_VARIANT = {
  new: 'info',
  contacted: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
} as const;

export function InquiryManager() {
  const { t, pick, locale } = useI18n();
  const {
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    getProperty,
    getVehicle,
  } = useDemoStore();

  const [type, setType] = useState<'all' | InquiryType>('all');
  const [status, setStatus] = useState<'all' | InquiryStatus>('all');

  const filtered = useMemo(
    () =>
      inquiries.filter((item) => {
        if (type !== 'all' && item.type !== type) return false;
        if (status !== 'all' && item.status !== status) return false;
        return true;
      }),
    [inquiries, type, status],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">{t.admin.inquiries}</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          {filtered.length} / {inquiries.length}
        </p>
      </header>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
        <div className="w-48 space-y-1.5">
          <Label htmlFor="im-type">{t.admin.filterType}</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger id="im-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {TYPES.map((item) => (
                <SelectItem key={item} value={item}>
                  {t.admin[
                    `inquiry${item.charAt(0).toUpperCase()}${item.slice(1)}` as
                      | 'inquiryProperty'
                      | 'inquiryVehicle'
                      | 'inquiryGeneral'
                  ]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48 space-y-1.5">
          <Label htmlFor="im-status">{t.admin.filterStatus}</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger id="im-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {t.admin[
                    `inquiry${item.charAt(0).toUpperCase()}${item.slice(1)}` as
                      | 'inquiryNew'
                      | 'inquiryContacted'
                      | 'inquiryConfirmed'
                      | 'inquiryCancelled'
                  ]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" aria-hidden />}
          title={t.admin.noResults}
          text={t.admin.noInquiries}
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((inquiry) => {
            const property = inquiry.propertyId ? getProperty(inquiry.propertyId) : undefined;
            const vehicle = inquiry.vehicleId ? getVehicle(inquiry.vehicleId) : undefined;
            const message = property
              ? buildPropertyMessage(property, {
                  locale,
                  t,
                  fullName: inquiry.fullName,
                  phone: inquiry.phone,
                  message: inquiry.message,
                  startDate: inquiry.startDate,
                  endDate: inquiry.endDate,
                })
              : vehicle
                ? buildVehicleMessage(vehicle, {
                    locale,
                    t,
                    fullName: inquiry.fullName,
                    phone: inquiry.phone,
                    message: inquiry.message,
                    startDate: inquiry.startDate,
                    endDate: inquiry.endDate,
                  })
                : buildGeneralMessage(inquiry.message.slice(0, 60), {
                    locale,
                    t,
                    fullName: inquiry.fullName,
                    phone: inquiry.phone,
                  });

            return (
              <li
                key={inquiry.id}
                className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-semibold">{inquiry.fullName}</h2>
                      <Badge variant={STATUS_VARIANT[inquiry.status]}>
                        {t.admin[
                          `inquiry${inquiry.status.charAt(0).toUpperCase()}${inquiry.status.slice(1)}` as
                            | 'inquiryNew'
                            | 'inquiryContacted'
                            | 'inquiryConfirmed'
                            | 'inquiryCancelled'
                        ]}
                      </Badge>
                      <Badge variant="default">
                        {t.admin[
                          `inquiry${inquiry.type.charAt(0).toUpperCase()}${inquiry.type.slice(1)}` as
                            | 'inquiryProperty'
                            | 'inquiryVehicle'
                            | 'inquiryGeneral'
                        ]}
                      </Badge>
                      <span className="text-[11px] text-ink-400">
                        {inquiry.channel === 'whatsapp'
                          ? t.admin.inquiryChannelWhatsapp
                          : t.admin.inquiryChannelForm}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{inquiry.message}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-500">
                      <a
                        href={`tel:${normalizePhone(inquiry.phone)}`}
                        className="tabular-nums text-gold-600 hover:underline"
                      >
                        {inquiry.phone}
                      </a>
                      {inquiry.email ? (
                        <a href={`mailto:${inquiry.email}`} className="hover:underline">
                          {inquiry.email}
                        </a>
                      ) : null}
                      <time dateTime={inquiry.createdAt}>
                        {formatDateTime(inquiry.createdAt, locale)}
                      </time>
                      {inquiry.startDate && inquiry.endDate ? (
                        <span className="tabular-nums">
                          {formatDate(inquiry.startDate, locale)} →{' '}
                          {formatDate(inquiry.endDate, locale)}
                        </span>
                      ) : null}
                    </div>

                    {property || vehicle ? (
                      <p className="mt-2 text-xs text-ink-400">
                        {property
                          ? `${property.reference} — ${pick(property.title)}`
                          : vehicle
                            ? `${vehicle.reference} — ${vehicle.brand} ${vehicle.model}`
                            : ''}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <div className="w-40">
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => {
                          updateInquiryStatus(inquiry.id, value as InquiryStatus);
                          toast.success(t.admin.statusUpdated);
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((item) => (
                            <SelectItem key={item} value={item}>
                              {t.admin[
                                `inquiry${item.charAt(0).toUpperCase()}${item.slice(1)}` as
                                  | 'inquiryNew'
                                  | 'inquiryContacted'
                                  | 'inquiryConfirmed'
                                  | 'inquiryCancelled'
                              ]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button asChild size="sm" variant="whatsapp">
                      <a
                        href={whatsappUrl(message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t.admin.whatsappAction}
                      >
                        <MessageCircle aria-hidden />
                        <span className="hidden sm:inline">{t.admin.whatsappAction}</span>
                      </a>
                    </Button>

                    {property ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/properties/${property.slug}`}>
                          <ExternalLink aria-hidden />
                          <span className="hidden sm:inline">{t.admin.openItem}</span>
                        </Link>
                      </Button>
                    ) : null}
                    {vehicle ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/cars/${vehicle.slug}`}>
                          <ExternalLink aria-hidden />
                          <span className="hidden sm:inline">{t.admin.openItem}</span>
                        </Link>
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger-soft"
                      onClick={() => {
                        deleteInquiry(inquiry.id);
                        toast.success(t.admin.deleted);
                      }}
                      aria-label={t.common.delete}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default InquiryManager;
