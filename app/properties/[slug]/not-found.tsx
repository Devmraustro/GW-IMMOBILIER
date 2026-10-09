'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';

export default function PropertyNotFound() {
  const { t } = useI18n();
  return (
    <div className="container-page py-24">
      <EmptyState
        icon={<Building2 className="size-6" aria-hidden />}
        title={t.errors.missingProperty}
        text={t.common.notFoundText}
        action={
          <Button asChild>
            <Link href="/properties">{t.errors.backToCatalog}</Link>
          </Button>
        }
      />
    </div>
  );
}
