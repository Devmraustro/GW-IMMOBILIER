'use client';

import { LoaderCircle, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { Button } from '@/components/ui/button';

export function CatalogPersistenceState() {
  const { t } = useI18n();
  const { persistenceMode } = useDemoStore();

  if (persistenceMode !== 'loading' && persistenceMode !== 'unavailable') return null;

  const loading = persistenceMode === 'loading';
  return (
    <section
      role={loading ? 'status' : 'alert'}
      aria-live="polite"
      className="rounded-2xl border border-ink-100 bg-white p-7 shadow-card sm:p-9"
    >
      <div className="flex items-start gap-3">
        {loading ? (
          <LoaderCircle className="mt-1 size-5 shrink-0 animate-spin text-gold-600" aria-hidden />
        ) : (
          <AlertTriangle className="mt-1 size-5 shrink-0 text-danger" aria-hidden />
        )}
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-950">
            {loading ? t.common.catalogLoading : t.common.catalogUnavailable}
          </h2>
          {!loading ? (
            <>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
                {t.common.catalogUnavailableDescription}
              </p>
              <Button className="mt-5" variant="outline" onClick={() => window.location.reload()}>
                {t.common.retry}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default CatalogPersistenceState;
