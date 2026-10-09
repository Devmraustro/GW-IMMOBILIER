import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  text,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink-200 bg-sand-50 px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="flex size-14 items-center justify-center rounded-full bg-white text-gold-600 shadow-card">
          {icon}
        </div>
      ) : null}
      <div className="max-w-md space-y-1.5">
        <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
        {text ? <p className="text-sm leading-relaxed text-ink-500">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
