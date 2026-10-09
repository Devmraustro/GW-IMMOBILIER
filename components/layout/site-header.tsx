'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '@/lib/i18n';
import { PHONE_NUMBER } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { LanguageToggle } from './language-toggle';
import { NAV_ITEMS, ADMIN_NAV_ITEM } from './nav-links';

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === '/';
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300 ease-premium',
        transparent
          ? 'border-b border-white/10 bg-transparent'
          : 'border-b border-ink-100 bg-white/95 shadow-sm backdrop-blur-md',
      )}
      style={{ minHeight: 'var(--header-height)' }}
    >
      <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label={`${t.common.brand} — ${t.nav.home}`}
        >
          <Logo variant={transparent ? 'light' : 'default'} />
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    transparent
                      ? 'text-white/85 hover:text-white'
                      : 'text-ink-600 hover:text-ink-900',
                    isActive(item.href) &&
                      (transparent ? 'text-white' : 'text-ink-900 font-semibold'),
                  )}
                >
                  {t.nav[item.key]}
                  {isActive(item.href) ? (
                    <span
                      className={cn(
                        'absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full',
                        transparent ? 'bg-gold-400' : 'bg-ink-900',
                      )}
                      aria-hidden
                    />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle className={cn('hidden sm:inline-flex', transparent && 'border-white/25 bg-white/10')} />

          <Button
            asChild
            variant={transparent ? 'outlineLight' : 'outline'}
            size="sm"
            className="hidden md:inline-flex"
          >
            <a href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}>
              <Phone aria-hidden />
              <span className="tabular-nums">{PHONE_NUMBER}</span>
            </a>
          </Button>

          <Button asChild size="sm" className="hidden xl:inline-flex">
            <Link href={ADMIN_NAV_ITEM.href}>{t.nav.admin}</Link>
          </Button>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <Button
                variant={transparent ? 'outlineLight' : 'ghost'}
                size="icon"
                className="lg:hidden"
                aria-label={t.common.openMenu}
              >
                <Menu aria-hidden />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 lg:hidden" />
              <Dialog.Content
                className={cn(
                  'fixed inset-y-0 z-50 flex w-[86%] max-w-sm flex-col gap-6 overflow-y-auto bg-white p-6 shadow-panel lg:hidden',
                  'end-0 data-[state=open]:animate-in data-[state=closed]:animate-out',
                  'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
                  'rtl:data-[state=open]:slide-in-from-left rtl:data-[state=closed]:slide-out-to-left',
                  'duration-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <Logo />
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label={t.common.closeMenu}>
                      <X aria-hidden />
                    </Button>
                  </Dialog.Close>
                </div>

                <Dialog.Title className="sr-only">{t.common.openMenu}</Dialog.Title>

                <nav aria-label="Navigation mobile">
                  <ul className="flex flex-col gap-1">
                    {[...NAV_ITEMS, ADMIN_NAV_ITEM].map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            aria-current={isActive(item.href) ? 'page' : undefined}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors',
                              isActive(item.href)
                                ? 'bg-sand-100 text-ink-900'
                                : 'text-ink-600 hover:bg-sand-50 hover:text-ink-900',
                            )}
                          >
                            <Icon className="size-[18px] text-gold-600" aria-hidden />
                            {t.nav[item.key]}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mt-auto space-y-3">
                  <LanguageToggle className="w-full justify-center" />
                  <Button asChild variant="ink" fullWidth>
                    <a href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}>
                      <Phone aria-hidden />
                      {PHONE_NUMBER}
                    </a>
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
