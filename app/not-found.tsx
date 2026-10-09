'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';
import { NAV_ITEMS } from '@/components/layout/nav-links';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container-page py-24">
      <EmptyState
        icon={<Compass className="size-6" aria-hidden />}
        title={t.common.notFound}
        text={t.common.notFoundText}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/">{t.common.backHome}</Link>
            </Button>
            {NAV_ITEMS.filter((item) => item.href !== '/').map((item) => (
              <Button key={item.href} asChild variant="outline">
                <Link href={item.href}>{t.nav[item.key]}</Link>
              </Button>
            ))}
          </div>
        }
      />
    </div>
  );
}
