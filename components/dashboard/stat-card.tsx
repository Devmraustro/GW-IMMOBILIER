import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = {
  default: 'bg-white text-ink-900',
  gold: 'bg-gold-400 text-ink-900',
  ink: 'bg-ink-900 text-white',
  success: 'bg-white text-ink-900',
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-100 p-5 shadow-card transition-shadow hover:shadow-card-hover',
        TONES[tone],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-wide',
            tone === 'ink' ? 'text-white/60' : 'text-ink-400',
          )}
        >
          {label}
        </p>
        <Icon
          className={cn('size-[18px] shrink-0', tone === 'gold' ? 'text-ink-900' : 'text-gold-600')}
          aria-hidden
        />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</p>
      {hint ? (
        <p
          className={cn(
            'mt-1.5 text-xs',
            tone === 'ink' ? 'text-white/60' : 'text-ink-500',
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default StatCard;
