'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Car,
  CalendarClock,
  Inbox,
  Info,
  ListChecks,
  MessageCircle,
  Wallet,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { formatCurrency, formatDate, formatRelativeTime, todayISO } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/dashboard/stat-card';
import { whatsappUrl, buildPropertyMessage } from '@/lib/whatsapp';

const INQUIRY_VARIANT = {
  new: 'info',
  contacted: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
} as const;

export default function AdminOverviewPage() {
  const { t, pick, locale } = useI18n();
  const { properties, vehicles, inquiries, reservations, getProperty } = useDemoStore();
  const today = todayISO();

  const activeProperties = properties.filter(
    (item) => item.availability.status === 'available',
  ).length;
  const availableVehicles = vehicles.filter((item) => item.available).length;
  const pending = inquiries.filter((item) => item.status === 'new').length;
  const upcoming = reservations.filter(
    (item) => item.status !== 'cancelled' && item.endDate >= today,
  );
  const revenue = reservations
    .filter((item) => item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.amount, 0);
  const deposit = reservations
    .filter((item) => item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.deposit, 0);

  const recentActivity = [
    ...inquiries.map((item) => ({
      id: item.id,
      kind: 'inquiry' as const,
      title: item.fullName,
      description: item.message,
      date: item.createdAt,
      status: item.status,
    })),
    ...reservations.map((item) => ({
      id: item.id,
      kind: 'reservation' as const,
      title: item.customerName,
      description: `${pick(item.itemTitle)} · ${formatCurrency(item.amount)}`,
      date: item.createdAt,
      status: item.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">{t.admin.overview}</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          {t.admin.statTotalListings} · {properties.length + vehicles.length}
        </p>
      </header>

      <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={ListChecks}
              label={t.admin.statTotalListings}
              value={properties.length + vehicles.length}
              hint={`${properties.length} ${t.admin.properties} · ${vehicles.length} ${t.admin.vehicles}`}
            />
            <StatCard
              icon={Building2}
              label={t.admin.statActiveProperties}
              value={activeProperties}
              hint={`${properties.length - activeProperties} ${t.properties.availabilityStatus.reserved}`}
            />
            <StatCard
              icon={Car}
              label={t.admin.statAvailableVehicles}
              value={availableVehicles}
              hint={`${vehicles.length - availableVehicles} ${t.cars.unavailable}`}
            />
            <StatCard
              icon={Inbox}
              label={t.admin.statPendingInquiries}
              value={pending}
              hint={`${inquiries.length} ${t.admin.inquiries}`}
              tone="gold"
            />
            <StatCard
              icon={CalendarClock}
              label={t.admin.statUpcomingReservations}
              value={upcoming.length}
              hint={`${reservations.length} ${t.admin.reservations}`}
            />
            <StatCard
              icon={Wallet}
              label={t.admin.statMonthlyRevenue}
              value={formatCurrency(revenue)}
              hint={`${t.admin.monthDeposit} ${formatCurrency(deposit)}`}
              tone="ink"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            {/* Activity */}
            <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">{t.admin.recentActivity}</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/inquiries">
                    {t.admin.viewAll}
                    <ArrowLeft className={cn('size-3.5', locale === 'ar' ? '' : 'rotate-180')} aria-hidden />
                  </Link>
                </Button>
              </div>

              {recentActivity.length === 0 ? (
                <p className="mt-6 text-sm text-ink-400">{t.admin.recentActivityEmpty}</p>
              ) : (
                <ul className="mt-5 divide-y divide-ink-100">
                  {recentActivity.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 py-3.5">
                      <span
                        className={cn(
                          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                          item.kind === 'inquiry' ? 'bg-info-soft text-info' : 'bg-gold-50 text-gold-600',
                        )}
                      >
                        {item.kind === 'inquiry' ? (
                          <Inbox className="size-4" aria-hidden />
                        ) : (
                          <CalendarClock className="size-4" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                          <Badge
                            variant={
                              item.kind === 'inquiry'
                                ? INQUIRY_VARIANT[item.status as keyof typeof INQUIRY_VARIANT]
                                : 'default'
                            }
                          >
                            {item.kind === 'inquiry'
                              ? t.admin[
                                  `inquiry${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}` as
                                    | 'inquiryNew'
                                    | 'inquiryContacted'
                                    | 'inquiryConfirmed'
                                    | 'inquiryCancelled'
                                ]
                              : t.admin[
                                  item.status === 'upcoming'
                                    ? 'upcoming'
                                    : item.status === 'ongoing'
                                      ? 'ongoing'
                                      : item.status === 'completed'
                                        ? 'completed'
                                        : 'cancelled'
                                ]}
                          </Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{item.description}</p>
                      </div>
                      <time className="shrink-0 text-[11px] text-ink-400" dateTime={item.date}>
                        {formatRelativeTime(item.date, locale)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recent inquiries */}
            <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold">{t.admin.recentInquiries}</h2>
              {inquiries.length === 0 ? (
                <p className="mt-6 text-sm text-ink-400">{t.admin.noInquiries}</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {inquiries.slice(0, 5).map((inquiry) => {
                    const property = inquiry.propertyId ? getProperty(inquiry.propertyId) : undefined;
                    return (
                      <li
                        key={inquiry.id}
                        className="rounded-xl border border-ink-100 bg-sand-50 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink-900">
                              {inquiry.fullName}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-400">
                              {formatDate(inquiry.createdAt.slice(0, 10), locale)} ·{' '}
                              {t.admin[
                                `inquiry${inquiry.type.charAt(0).toUpperCase()}${inquiry.type.slice(1)}` as
                                  | 'inquiryProperty'
                                  | 'inquiryVehicle'
                                  | 'inquiryGeneral'
                              ]}
                            </p>
                          </div>
                          <Badge variant={INQUIRY_VARIANT[inquiry.status]}>
                            {t.admin[
                              `inquiry${inquiry.status.charAt(0).toUpperCase()}${inquiry.status.slice(1)}` as
                                | 'inquiryNew'
                                | 'inquiryContacted'
                                | 'inquiryConfirmed'
                                | 'inquiryCancelled'
                            ]}
                          </Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs text-ink-600">{inquiry.message}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="whatsapp">
                            <a
                              href={whatsappUrl(
                                property
                                  ? buildPropertyMessage(property, {
                                      locale,
                                      t,
                                      fullName: inquiry.fullName,
                                      phone: inquiry.phone,
                                      message: inquiry.message,
                                    })
                                  : inquiry.message,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle aria-hidden />
                              {t.admin.whatsappAction}
                            </a>
                          </Button>
                          {property ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/properties/${property.slug}`}>
                                {t.admin.openItem}
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-dashed border-info/40 bg-info-soft p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
              <Info className="size-4 text-info" aria-hidden />
              {t.admin.futureAuthTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
              {t.admin.futureAuthText}
            </p>
          </section>
      </>
    </div>
  );
}
