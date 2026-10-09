'use client';

import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

/**
 * Marks an element as fictional demonstration data.
 * Shown on every seeded listing so no one mistakes it for real inventory.
 */
export function DemoBadge({
  variant = 'demo',
  className,
  title,
}: {
  variant?: 'demo' | 'warning';
  className?: string;
  title?: string;
}) {
  const { t } = useI18n();
  return (
    <Badge variant={variant === 'demo' ? 'demo' : 'warning'} className={className} title={title ?? t.common.demoBadgeTitle}>
      <Info aria-hidden />
      {t.common.demoData}
    </Badge>
  );
}

export default DemoBadge;
