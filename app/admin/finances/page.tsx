'use client';

import { Wallet } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { paymentStatus, remainingBalance } from '@/lib/availability';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/dashboard/stat-card';

export default function AdminFinancesPage() {
  const { t, pick, locale } = useI18n();
  const { reservations } = useDemoStore();

  const active = reservations.filter((item) => item.status !== 'cancelled');
  const total = active.reduce((sum, item) => sum + item.amount, 0);
  const deposit = active.reduce((sum, item) => sum + item.deposit, 0);
  const balance = active.reduce((sum, item) => sum + remainingBalance(item), 0);
  const collected = active.filter((item) => paymentStatus(item) === 'paid').length;
  const partial = active.filter((item) => paymentStatus(item) === 'partial').length;
  const unpaid = active.filter((item) => paymentStatus(item) === 'unpaid').length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">{t.admin.finances}</h1>
        <p className="mt-1.5 text-sm text-ink-500">{t.admin.demoBanner}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label={t.admin.monthRevenue} value={formatCurrency(total)} />
        <StatCard
          icon={Wallet}
          label={t.admin.monthDeposit}
          value={formatCurrency(deposit)}
          hint={`${collected} ${t.admin.paid}`}
        />
        <StatCard
          icon={Wallet}
          label={t.admin.monthBalance}
          value={formatCurrency(balance)}
          hint={`${partial} ${t.admin.partial} · ${unpaid} ${t.admin.unpaid}`}
        />
        <StatCard icon={Wallet} label={t.admin.reservations} value={active.length} tone="ink" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-ink-100 bg-sand-50 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldItem}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldCustomer}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldStartDate}</th>
                <th className="px-4 py-3 text-end font-semibold">{t.admin.monthRevenue}</th>
                <th className="px-4 py-3 text-end font-semibold">{t.admin.monthDeposit}</th>
                <th className="px-4 py-3 text-end font-semibold">{t.admin.monthBalance}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldPaymentStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {reservations.map((reservation) => {
                const payment = paymentStatus(reservation);
                return (
                  <tr
                    key={reservation.id}
                    className={cn(
                      'transition-colors hover:bg-sand-50',
                      reservation.status === 'cancelled' && 'opacity-50',
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-ink-900">
                        {pick(reservation.itemTitle)}
                      </p>
                      <p className="font-mono text-[11px] text-ink-400">
                        {reservation.itemReference}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{reservation.customerName}</td>
                    <td className="px-4 py-3 tabular-nums text-ink-600">
                      {formatDate(reservation.startDate, locale)}
                    </td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums">
                      {formatCurrency(reservation.amount)}
                    </td>
                    <td className="px-4 py-3 text-end tabular-nums text-ink-600">
                      {formatCurrency(reservation.deposit)}
                    </td>
                    <td className="px-4 py-3 text-end font-semibold tabular-nums">
                      {formatCurrency(remainingBalance(reservation))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          payment === 'paid'
                            ? 'success'
                            : payment === 'partial'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {t.admin[payment]}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-ink-200 bg-sand-50 text-sm">
              <tr>
                <td className="px-4 py-3 font-semibold" colSpan={3}>
                  {t.common.total}
                </td>
                <td className="px-4 py-3 text-end font-semibold tabular-nums">
                  {formatCurrency(total)}
                </td>
                <td className="px-4 py-3 text-end font-semibold tabular-nums">
                  {formatCurrency(deposit)}
                </td>
                <td className="px-4 py-3 text-end font-semibold tabular-nums">
                  {formatCurrency(balance)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <p className="rounded-2xl border border-dashed border-warning/50 bg-warning-soft px-4 py-3 text-xs leading-relaxed text-warning">
        {t.admin.futureAuthText}
      </p>
    </div>
  );
}
