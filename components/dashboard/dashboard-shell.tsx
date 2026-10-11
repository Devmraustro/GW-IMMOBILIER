'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  Car,
  ChevronLeft,
  Inbox,
  LayoutDashboard,
  LogOut,
  LoaderCircle,
  Menu,
  Wallet,
  X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';

const ITEMS = [
  { href: '/admin', key: 'overview', icon: LayoutDashboard },
  { href: '/admin/properties', key: 'properties', icon: Building2 },
  { href: '/admin/vehicles', key: 'vehicles', icon: Car },
  { href: '/admin/inquiries', key: 'inquiries', icon: Inbox },
  { href: '/admin/reservations', key: 'reservations', icon: CalendarIcon },
  { href: '/admin/finances', key: 'finances', icon: Wallet },
] as const;

// Local alias so the import list stays tidy.
function CalendarIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { inquiries, persistenceMode } = useDemoStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pending = inquiries.filter((item) => item.status === 'new').length;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', cache: 'no-store' });
    } catch {
      // The admin boundary still blocks access if the request fails.
    }
    router.replace('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  const nav = (
    <nav aria-label={t.admin.dashboard} className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-ink-900 text-white'
                : 'text-ink-600 hover:bg-white hover:text-ink-900',
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            <span className="flex-1">{t.admin[item.key]}</span>
            {item.key === 'inquiries' && pending > 0 ? (
              <span className="rounded-full bg-gold-400 px-1.5 text-[11px] font-bold text-ink-900">
                {pending}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-sand-50">
      <div className="container-page py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-16 space-y-5">
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <Logo />
                <p className="mt-3 text-[11px] uppercase tracking-wide text-ink-400">
                  {t.admin.dashboard}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-sand-50 p-3">
                {nav}
                <button
                  type="button"
                  onClick={logout}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-white hover:text-ink-900"
                >
                  <LogOut className="size-[18px]" aria-hidden />
                  {t.admin.logout}
                </button>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 px-3 text-xs text-ink-400 transition-colors hover:text-ink-900"
              >
                <ChevronLeft className={cn('size-3.5', locale === 'ar' && 'rotate-180')} aria-hidden />
                {t.common.backHome}
              </Link>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileOpen(true)}
                aria-label={t.common.openMenu}
              >
                <Menu aria-hidden />
                {t.admin.dashboard}
              </Button>
            </div>
            {persistenceMode === 'database' ? (
              children
            ) : (
              <section
                role={persistenceMode === 'unavailable' ? 'alert' : 'status'}
                aria-live="polite"
                className="rounded-2xl border border-ink-100 bg-white p-8 shadow-card"
              >
                <div className="flex items-start gap-3">
                  {persistenceMode === 'loading' ? (
                    <LoaderCircle className="mt-1 size-5 shrink-0 animate-spin text-gold-600" aria-hidden />
                  ) : (
                    <span className="mt-1 size-2.5 shrink-0 rounded-full bg-danger" aria-hidden />
                  )}
                  <div>
                    <h1 className="font-display text-xl font-semibold text-ink-950">
                      {persistenceMode === 'unavailable'
                        ? t.admin.databaseUnavailable
                        : t.admin.databaseConnecting}
                    </h1>
                    {persistenceMode === 'unavailable' ? (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
                        {t.admin.databaseUnavailableDescription}
                      </p>
                    ) : null}
                    {persistenceMode === 'unavailable' ? (
                      <Button
                        className="mt-5"
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        {t.common.retry}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t.common.close}
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              'absolute inset-y-0 start-0 w-[80%] max-w-xs space-y-5 bg-white p-5 shadow-panel',
            )}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => setMobileOpen(false)}
                aria-label={t.common.close}
              >
                <X aria-hidden />
              </Button>
            </div>
            {nav}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-sand-50 hover:text-ink-900"
            >
              <LogOut className="size-[18px]" aria-hidden />
              {t.admin.logout}
            </button>
          </div>
        </div>
      ) : null}

    </div>
  );
}

export default DashboardShell;
