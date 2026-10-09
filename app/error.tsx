'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[GW Immobilier]', error);
    }
  }, [error]);

  return (
    <div className="container-page py-24">
      <EmptyState
        icon={<TriangleAlert className="size-6" aria-hidden />}
        title={t.common.errorTitle}
        text={t.common.errorText}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={reset}>
              <RotateCcw aria-hidden />
              {t.common.retry}
            </Button>
            <Button asChild variant="outline">
              <Link href="/">{t.common.backHome}</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
